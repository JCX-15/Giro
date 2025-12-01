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

export async function POST(request: NextRequest) {
  try {
    const {
      usuarioClienteId,
      idLocal,
      tipoServicio,
      pesoKg,
      precioBase,
      precioExtras,
      descuentoRecogida,
      descuentoCupon,
      precioTotal,
      metodoEntrega,
      direccionRecogida,
      coloniaRecogida,
      referenciasRecogida,
      horarioRecogida,
      extras,
      codigoDescuento,
    } = await request.json()

    console.log("[GIRO] Creating order for user:", usuarioClienteId, "laundry:", idLocal)

    if (!usuarioClienteId || !idLocal || !tipoServicio) {
      return NextResponse.json({ error: "Parámetros requeridos faltantes" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      const [servicios]: any = await connection.execute("SELECT id FROM servicios WHERE tipo_servicio = ?", [
        tipoServicio,
      ])

      if (servicios.length === 0) {
        return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
      }

      const servicioId = servicios[0].id
      const numeroPedido = `GIRO-${Date.now()}`

      const requiereRecogida = true
      const requiereEntrega = metodoEntrega === "home"

      const totalDescuento = Number.parseFloat(descuentoRecogida || "0") + Number.parseFloat(descuentoCupon || "0")

      const [result] = await connection.execute(
        `INSERT INTO pedidos (
          numero_pedido, cliente_id, local_id, servicio_id, peso_kg, precio_base, 
          precio_extras, cantidad_descuento, codigo_descuento, precio_total,
          requiere_recogida, requiere_entrega, direccion_recogida, barrio_recogida, referencia_recogida,
          hora_recogida, estado, estado_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', 'pendiente')`,
        [
          numeroPedido,
          usuarioClienteId,
          idLocal,
          servicioId,
          pesoKg,
          precioBase,
          precioExtras,
          totalDescuento,
          codigoDescuento || null,
          precioTotal,
          requiereRecogida,
          requiereEntrega,
          direccionRecogida || null,
          coloniaRecogida || null,
          referenciasRecogida || null,
          horarioRecogida || null,
        ],
      )

      const pedidoId = (result as any).insertId

      if (extras && extras.length > 0) {
        for (const extra of extras) {
          await connection.execute("INSERT INTO pedidos_extras (pedido_id, extra_id, precio) VALUES (?, ?, ?)", [
            pedidoId,
            extra.id,
            extra.price,
          ])
        }
      }

      console.log("[GIRO] Order created successfully:", numeroPedido, "ID:", pedidoId)
      return NextResponse.json(
        { orderId: pedidoId, orderNumber: numeroPedido, precioTotal: precioTotal },
        { status: 201 },
      )
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error creating order:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
