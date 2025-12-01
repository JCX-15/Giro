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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { id: pedidoId } = await params
    const estado = body.status || body.estado

    console.log("[GIRO] Updating order status:", pedidoId, "to:", estado)

    if (!estado) {
      return NextResponse.json({ error: "Estado requerido" }, { status: 400 })
    }

    const statusSequence = [
      "pendiente",
      "ropa_recibida",
      "lavando",
      "secando",
      "planchando",
      "listo_para_despachar",
      "despachado",
      "entregado",
    ]

    const connection = await pool.getConnection()

    try {
      const [orders]: any = await connection.execute("SELECT estado, local_id FROM pedidos WHERE id = ?", [pedidoId])

      if (orders.length === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
      }

      const currentStatus = orders[0].estado
      const localId = orders[0].local_id
      const currentIndex = statusSequence.indexOf(currentStatus)
      const newIndex = statusSequence.indexOf(estado)

      if (newIndex < currentIndex) {
        return NextResponse.json({ error: "No se puede retroceder en el estado del pedido" }, { status: 400 })
      }

      await connection.execute("UPDATE pedidos SET estado = ? WHERE id = ?", [estado, pedidoId])

      if (estado === "entregado") {
        console.log(`[GIRO] Order #${pedidoId} delivered. Revenue updated for laundry #${localId}`)
      }

      console.log(`[GIRO] Order #${pedidoId} status updated from ${currentStatus} to ${estado}`)

      return NextResponse.json({ message: "Estado actualizado exitosamente" }, { status: 200 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error updating status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { estadoPago, metodoPago } = await request.json()
    const { id: pedidoId } = await params

    console.log("[GIRO] Updating payment status for order:", pedidoId, { estadoPago, metodoPago })

    const connection = await pool.getConnection()

    try {
      let query = "UPDATE pedidos SET estado_pago = ?"
      const queryParams: any[] = [estadoPago || "completado"]

      if (metodoPago) {
        query += ", metodo_pago = ?"
        queryParams.push(metodoPago)
      }

      query += " WHERE id = ?"
      queryParams.push(pedidoId)

      const [result] = await connection.execute(query, queryParams)

      if ((result as any).affectedRows === 0) {
        return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
      }

      console.log("[GIRO] Payment status updated successfully for order:", pedidoId)
      return NextResponse.json({ message: "Estado de pago actualizado" }, { status: 200 })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error updating payment status:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
