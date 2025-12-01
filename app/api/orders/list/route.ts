import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST ,
  user: process.env.DATABASE_USER ,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rol = searchParams.get("rol")
    const usuarioId = searchParams.get("usuarioId")

    console.log("[GIRO] Fetching orders for role:", rol, "userId:", usuarioId)

    if (!usuarioId || !rol) {
      return NextResponse.json({ error: "usuarioId y rol requeridos" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      let query, params

      if (rol === "cliente" || rol === "customer") {
        query = `SELECT p.*, s.tipo_servicio, s.tiempo_entrega_horas, ul.nombre as nombre_local
                 FROM pedidos p
                 JOIN servicios s ON p.servicio_id = s.id
                 JOIN usuario_local ul ON p.local_id = ul.id
                 WHERE p.cliente_id = ?
                 ORDER BY p.creado_en DESC`
        params = [usuarioId]
      } else if (rol === "local" || rol === "lavanderia" || rol === "laundry") {
        query = `SELECT p.id, p.numero_pedido, p.peso_kg, p.precio_total, p.estado, p.estado_pago, p.metodo_pago, p.creado_en,
                 s.tipo_servicio as service_name, uc.nombre as customer_name, uc.telefono as customer_phone
                 FROM pedidos p
                 JOIN servicios s ON p.servicio_id = s.id
                 JOIN usuario_cliente uc ON p.cliente_id = uc.id
                 WHERE p.local_id = ?
                 ORDER BY p.creado_en DESC`
        params = [usuarioId]
      } else {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }

      const [pedidos] = await connection.execute(query, params)

      console.log("[GIRO] Orders fetched successfully:", (pedidos as any[]).length, "orders")
      return NextResponse.json({ pedidos }, { status: 200 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error fetching orders:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
