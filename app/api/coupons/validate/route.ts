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

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json()

        if (!code) {
        return NextResponse.json({ valid: false, message: "Código de cupón requerido" }, { status: 400 })
        }

        const connection = await pool.getConnection()

        try {
        const [coupons]: any = await connection.execute(
            `SELECT id, porcentaje_descuento, monto_descuento FROM codigos_descuento 
            WHERE codigo = ? AND activo = TRUE AND (valido_hasta IS NULL OR valido_hasta > NOW())`,
            [code.toUpperCase()],
        )

        if (coupons.length === 0) {
            return NextResponse.json({ valid: false, message: "Código de cupón inválido o expirado" }, { status: 200 })
        }

        const coupon = coupons[0]
        const message = coupon.porcentaje_descuento
            ? `Descuento de ${coupon.porcentaje_descuento}% aplicado`
            : `Descuento de $${coupon.monto_descuento} aplicado`

        return NextResponse.json(
            {
            valid: true,
            percentage: coupon.porcentaje_descuento,
            amount: coupon.monto_descuento,
            message,
            },
            { status: 200 },
        )
        } finally {
        connection.release()
        }
    } catch (error) {
        console.error("[GIRO] Error validating coupon:", error)
        return NextResponse.json({ valid: false, message: "Error al validar el cupón" }, { status: 500 })
    }
}
