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
        const {
        nombre,
        correo,
        contrasena,
        telefono,
        ciudad,
        direccion,
        is24h,
        horaApertura,
        horaCierre,
        capacidadSimultanea,
        serviciosOfrecidos,
        } = await request.json()

        if (!nombre || !correo || !contrasena || !ciudad || !direccion) {
        return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
        }

        const connection = await pool.getConnection()

        try {
        const [existingUser]: any = await connection.execute("SELECT id FROM usuario_local WHERE correo = ?", [correo])

        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Correo ya registrado" }, { status: 400 })
        }

        const servicios = serviciosOfrecidos
            .map((offered: boolean, index: number) =>
            offered ? { id: index + 1, nombre: ["Básico", "Premium", "Express"][index] } : null,
            )
            .filter((s: any) => s !== null)

        const [result] = await connection.execute(
            `INSERT INTO usuario_local 
            (nombre, correo, contrasena, telefono, ciudad, direccion, is24h, horario_apertura, horario_cierre, 
            capacidad_simultanea, servicios_ofrecidos, estado, creado_en) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())`,
            [
            nombre,
            correo,
            contrasena,
            telefono,
            ciudad,
            direccion,
            is24h ? 1 : 0,
            is24h ? null : horaApertura,
            is24h ? null : horaCierre,
            capacidadSimultanea,
            JSON.stringify(servicios),
            ],
        )

        const userId = (result as any).insertId

        setTimeout(async () => {
            try {
            const conn = await pool.getConnection()
            await conn.execute("UPDATE usuario_local SET estado = 'activa' WHERE id = ?", [userId])
            conn.release()
            console.log(`[GIRO] Laundry #${userId} auto-activated after validation period`)
            } catch (error) {
            console.error("[GIRO] Error auto-activating laundry:", error)
            }
        }, 60000)

        return NextResponse.json(
            {
            message: "Lavandería registrada. Validando información...",
            userId,
            role: "laundry",
            token: `token_${userId}_${Date.now()}`,
            },
            { status: 201 },
        )
        } finally {
        connection.release()
        }
    } catch (error) {
        console.error("[GIRO] Error en registro de lavandería:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
