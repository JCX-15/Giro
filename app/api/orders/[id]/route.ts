import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"
import jwt from "jsonwebtoken"

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "default_secret")
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const decoded: any = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const connection = await pool.getConnection()

    try {
      const pedidoId = params.id

      const [pedidos]: any = await connection.execute(
        `SELECT p.*, s.tipo_servicio, s.tiempo_entrega_horas, 
                uc.nombre as nombre_cliente, uc.telefono as telefono_cliente,
                ul.nombre as nombre_local, ul.latitud as latitud_local, ul.longitud as longitud_local
         FROM pedidos p
         JOIN servicios s ON p.servicio_id = s.id
         JOIN usuario_cliente uc ON p.cliente_id = uc.id
         LEFT JOIN usuario_local ul ON p.local_id = ul.id
         WHERE p.id = ?`,
        [pedidoId],
      )

      if (pedidos.length === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
      }

      const pedido = pedidos[0]

      const [extras]: any = await connection.execute(
        `SELECT e.nombre, e.precio FROM pedidos_extras pe
         JOIN extras e ON pe.extra_id = e.id
         WHERE pe.pedido_id = ?`,
        [pedidoId],
      )

      return NextResponse.json({ pedido, extras }, { status: 200 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error al obtener pedido:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
