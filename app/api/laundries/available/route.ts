import { type NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

export async function GET(request: NextRequest) {
    try {
        const serviceId = request.nextUrl.searchParams.get("serviceId")
        const ciudad = request.nextUrl.searchParams.get("ciudad")

        if (!serviceId || !ciudad) {
        return NextResponse.json({ error: "Service ID and ciudad required" }, { status: 400 })
        }

        const connection = await pool.getConnection()
        console.log("[GIRO] Conexión exitosa a la base de datos")

        try {
        const [laundries]: any = await connection.execute(
            `SELECT 
            ul.id, 
            ul.nombre, 
            ul.ciudad,
            ul.direccion,
            ul.horario_apertura,
            ul.horario_cierre,
            ul.is24h,
            ul.capacidad_simultanea,
            COUNT(p.id) as solicitudes_activas
            FROM usuario_local ul
            LEFT JOIN pedidos p ON ul.id = p.local_id 
            AND p.estado NOT IN ('listo_para_despachar', 'despachado', 'entregado', 'cancelado')
            WHERE ul.estado = 'activa'
            AND ul.ciudad = ?
            AND JSON_CONTAINS(ul.servicios_ofrecidos, ?)
            GROUP BY ul.id
            HAVING solicitudes_activas < ul.capacidad_simultanea
            ORDER BY solicitudes_activas ASC`,
            [ciudad, serviceId],
        )

        return NextResponse.json({ laundries }, { status: 200 })
        } finally {
        connection.release()
        }
    } catch (error) {
        console.error("[GIRO] Error fetching available laundries:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
