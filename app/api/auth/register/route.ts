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

console.log("[GIRO] Intentando conectar a la base de datos...")
pool
  .getConnection()
  .then((connection) => {
    console.log("[GIRO] Conexión exitosa a la base de datos MySQL")
    connection.release()
  })
  .catch((error) => {
    console.error("[GIRO] Error al conectar a la base de datos:", error.message)
  })

export async function POST(request: NextRequest) {
  try {
    const { name, lastName, email, phone, city, password, role } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    const connection = await pool.getConnection()

    try {
      if (role === "customer") {
        const [existingUser]: any = await connection.execute("SELECT id FROM usuario_cliente WHERE correo = ?", [email])

        if (existingUser.length > 0) {
          return NextResponse.json({ error: "Correo ya registrado" }, { status: 400 })
        }

        const [result] = await connection.execute(
          "INSERT INTO usuario_cliente (nombre, correo, contrasena, telefono, ciudad) VALUES (?, ?, ?, ?, ?)",
          [name + " " + (lastName || ""), email, password, phone, city],
        )

        const userId = (result as any).insertId

        return NextResponse.json(
          {
            message: "Usuario cliente registrado exitosamente",
            userId,
            role: "customer",
            token: `token_${userId}_${Date.now()}`, // Simple token for MVP
          },
          { status: 201 },
        )
      } else if (role === "laundry") {
        const [existingUser]: any = await connection.execute("SELECT id FROM usuario_local WHERE correo = ?", [email])

        if (existingUser.length > 0) {
          return NextResponse.json({ error: "Correo ya registrado" }, { status: 400 })
        }

        const [result] = await connection.execute(
          "INSERT INTO usuario_local (nombre, correo, contrasena, telefono, ciudad, direccion) VALUES (?, ?, ?, ?, ?, ?)",
          [name, email, password, phone, city, ""],
        )

        const userId = (result as any).insertId

        return NextResponse.json(
          {
            message: "Local registrado exitosamente",
            userId,
            role: "laundry",
            token: `token_${userId}_${Date.now()}`, // Simple token for MVP
          },
          { status: 201 },
        )
      } else {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
      }
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("[GIRO] Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
