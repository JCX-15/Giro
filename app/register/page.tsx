"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RoleSelector } from "@/components/RoleSelector"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faLock,
  faSpinner,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons"

export default function RegisterPage() {
  const [role, setRole] = useState("customer")
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const availableRoles = [
    { value: "customer", label: "Cliente", icon: "👤" },
    { value: "laundry", label: "Lavandería", icon: "🏢" },
  ]

  const ciudadesDisponibles = ["Tegucigalpa", "Comayagua", "San Pedro Sula", "La Ceiba"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastName,
          email,
          phone,
          city,
          password,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error en el registro")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userId", data.userId)
      localStorage.setItem("role", role)

      if (role === "customer") {
        router.push("/dashboard")
      } else if (role === "laundry") {
        router.push("/register-laundry")
      }
    } catch (err) {
      setError("Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 8) {
      value = value.slice(0, 8)
    }

    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4)
    }

    setPhone(value)
  }

  if (role === "laundry") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#012840] to-[#0368A6] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <img src="/images/imagen-circular-recortada.png" alt="GIRO" className="h-16 w-16" />
          </div>

          <h1 className="text-3xl font-bold text-center text-[#012840] mb-2">Registra tu Lavandería</h1>
          <p className="text-center text-gray-600 mb-8">Completa tu información de empresa</p>

          <RoleSelector selectedRole={role} onRoleChange={setRole} availableRoles={availableRoles} />

          <p className="text-center text-gray-600 my-6">Serás redirigido a un formulario más detallado para empresas</p>

          <Link href="/register-laundry" className="block">
            <Button className="w-full bg-[#012840] text-white hover:bg-[#0a1a2e] py-3 font-bold rounded-lg transition">
              Ir al Registro de Lavandería
            </Button>
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-700">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[#012840] font-bold hover:underline">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#012840] to-[#0368A6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src="/images/imagen-circular-recortada.png" alt="GIRO" className="h-16 w-16" />
        </div>

        <h1 className="text-3xl font-bold text-center text-[#012840] mb-2">Únete a GIRO</h1>
        <p className="text-center text-gray-600 mb-8">Crea tu cuenta hoy</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <RoleSelector selectedRole={role} onRoleChange={setRole} availableRoles={availableRoles} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-[#012840]" />
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-[#012840]" />
                Apellido
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#012840]" />
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
              <FontAwesomeIcon icon={faPhone} className="text-[#012840]" />
              Teléfono
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-semibold">
                +504
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
                placeholder="1234-5678"
                maxLength={9}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#012840]" />
              Ciudad
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="">Selecciona tu ciudad</option>
              {ciudadesDisponibles.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-[#012840]" />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-[#012840]" />
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Repite tu contraseña"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" required className="w-4 h-4 cursor-pointer" />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Acepto los Términos y Condiciones
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#012840] text-white hover:bg-[#0a1a2e] py-2 font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Creando cuenta...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} />
                Crear Cuenta
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-700">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#012840] font-bold hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
