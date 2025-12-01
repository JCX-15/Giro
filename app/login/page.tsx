"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RoleSelector } from "@/components/RoleSelector"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [role, setRole] = useState("customer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error en el login")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("role", data.role)
      localStorage.setItem("userName", data.userName)

      if (data.role === "customer") {
        router.push("/dashboard")
      } else if (data.role === "laundry") {
        router.push("/laundry-dashboard")
      }
    } catch (err) {
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#012840] to-[#0368A6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src="/images/imagen-circular-recortada.png" alt="GIRO" className="h-16 w-16" />
        </div>

        <h1 className="text-3xl font-bold text-center text-[#012840] mb-2">Bienvenido a GIRO</h1>
        <p className="text-center text-gray-600 mb-8">Inicia sesión para continuar</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <RoleSelector selectedRole={role} onRoleChange={setRole} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <i className="fas fa-envelope text-[#012840]"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <i className="fas fa-lock text-[#012840]"></i>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#012840] text-white hover:bg-[#0a1a2e] py-2 font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-700">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[#012840] font-bold hover:underline">
              Crear Cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
