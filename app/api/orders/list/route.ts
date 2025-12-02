import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "giro",
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
        query = `SELECT p.*, s.tipo_servicio, s.tiempo_entrega_horas, ul.nombre as nombre_local,
                 uc.nombre as nombre_cliente, uc.telefono as telefono_cliente,
                 p.direccion_recogida, p.barrio_recogida, p.referencia_recogida, p.hora_recogida,
                 s.tipo_servicio as service_name, p.metodo_pago
                 FROM pedidos p
                 JOIN servicios s ON p.servicio_id = s.id
                 JOIN usuario_local ul ON p.local_id = ul.id
                 JOIN usuario_cliente uc ON p.cliente_id = uc.id
                 WHERE p.cliente_id = ?
                 ORDER BY p.creado_en DESC`
        params = [usuarioId]

        const [pedidos] = await connection.execute(query, params)

        const ordersWithExtras = await Promise.all(
          (pedidos as any[]).map(async (order) => {
            const [extras] = await connection.execute(
              `SELECT e.nombre, e.descripcion, pe.precio
               FROM pedidos_extras pe
               JOIN extras e ON pe.extra_id = e.id
               WHERE pe.pedido_id = ?`,
              [order.id],
            )
            return { ...order, extras }
          }),
        )

        console.log("[GIRO] Orders fetched successfully:", ordersWithExtras.length, "orders")
        return NextResponse.json({ pedidos: ordersWithExtras }, { status: 200 })
      } else if (rol === "local" || rol === "lavanderia" || rol === "laundry") {
        query = `SELECT p.id, p.numero_pedido, p.peso_kg, p.precio_total, p.precio_base, p.precio_extras,
                  p.cantidad_descuento, p.codigo_descuento, p.estado, p.estado_pago, p.metodo_pago, p.creado_en,
                  p.requiere_recogida, p.requiere_entrega, p.direccion_recogida, p.hora_recogida,
                  p.barrio_recogida, p.referencia_recogida,
                  s.tipo_servicio as service_name, s.tiempo_entrega_horas,
                  uc.nombre as customer_name, uc.telefono as customer_phone
                  FROM pedidos p
                  JOIN servicios s ON p.servicio_id = s.id
                  JOIN usuario_cliente uc ON p.cliente_id = uc.id
                  WHERE p.local_id = ?
                  ORDER BY p.creado_en DESC`
        params = [usuarioId]

        const [pedidos] = await connection.execute(query, params)

        const ordersWithExtras = await Promise.all(
          (pedidos as any[]).map(async (order) => {
            const [extras] = await connection.execute(
              `SELECT e.nombre, e.descripcion, pe.precio
                FROM pedidos_extras pe
                JOIN extras e ON pe.extra_id = e.id
                WHERE pe.pedido_id = ?`,
              [order.id],
            )
            return { ...order, extras }
          }),
        )

        console.log("[GIRO] Orders fetched successfully:", ordersWithExtras.length, "orders")
        return NextResponse.json({ pedidos: ordersWithExtras }, { status: 200 })
      } else {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error fetching orders:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
