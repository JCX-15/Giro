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
    const { email, password, role } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, contraseña y rol requeridos" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      let query = ""
      let dbRole = ""

      if (role === "customer") {
        query = "SELECT id, nombre FROM usuario_cliente WHERE correo = ? AND contrasena = ?"
        dbRole = "customer"
      } else if (role === "laundry") {
        query = "SELECT id, nombre FROM usuario_local WHERE correo = ? AND contrasena = ?"
        dbRole = "laundry"
      } else {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }

      const [users]: any = await connection.execute(query, [email, password])

      if (users.length === 0) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
      }

      const user = users[0]

      return NextResponse.json(
        {
          message: "Inicio de sesión exitoso",
          userId: user.id,
          userName: user.nombre,
          role: dbRole,
          token: `token_${user.id}_${Date.now()}`, // Simple token for MVP
        },
        { status: 200 },
      )
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error en inicio de sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
