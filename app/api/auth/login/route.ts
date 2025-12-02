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
        query = `SELECT id, nombre, estado, creado_en, 
                 TIMESTAMPDIFF(SECOND, creado_en, NOW()) as seconds_since_creation 
                 FROM usuario_local WHERE correo = ? AND contrasena = ?`
        dbRole = "laundry"
      } else {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }

      const [users]: any = await connection.execute(query, [email, password])

      if (users.length === 0) {
        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
      }

      const user = users[0]

      if (role === "laundry") {
        const timeSinceCreationSeconds = user.seconds_since_creation || 0

        console.log(`[GIRO] Account #${user.id} created ${timeSinceCreationSeconds}s ago, estado: ${user.estado}`)

        if (timeSinceCreationSeconds < 60 && user.estado === "pendiente") {
          const remainingSeconds = 60 - timeSinceCreationSeconds
          console.log(`[GIRO] Account #${user.id} still pending, ${remainingSeconds}s remaining`)
          return NextResponse.json(
            {
              error: `Tu cuenta aún no ha sido verificada. Un encargado visitará tu dirección para validar tu empresa. Por favor, intenta nuevamente en ${remainingSeconds} segundos.`,
            },
            { status: 403 },
          )
        }

        if (user.estado === "pendiente" && timeSinceCreationSeconds >= 60) {
          await connection.execute("UPDATE usuario_local SET estado = 'activa' WHERE id = ?", [user.id])
          console.log(`[GIRO] Laundry account #${user.id} auto-activated after ${timeSinceCreationSeconds} seconds`)
        }

        if (user.estado === "inactiva") {
          return NextResponse.json(
            {
              error: "Tu cuenta está inactiva. Por favor, contacta al soporte.",
            },
            { status: 403 },
          )
        }
      }

      return NextResponse.json(
        {
          message: "Inicio de sesión exitoso",
          userId: user.id,
          userName: user.nombre,
          role: dbRole,
          token: `token_${user.id}_${Date.now()}`,
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
