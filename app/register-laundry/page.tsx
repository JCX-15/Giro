"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterLaundryPage() {
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        telefono: "",
        ciudad: "",
        direccion: "",
        is24h: false,
        horaApertura: "08:00",
        horaCierre: "20:00",
        serviciosOfrecidos: [false, false, false], // Básico, Premium, Express
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const router = useRouter()

    const ciudadesDisponibles = ["Tegucigalpa", "Comayagua", "San Pedro Sula", "La Ceiba"]

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")

        if (value.length > 8) {
        value = value.slice(0, 8)
        }

        if (value.length > 4) {
        value = value.slice(0, 4) + "-" + value.slice(4)
        }

        setFormData((prev) => ({ ...prev, telefono: value }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked
        if (name === "is24h") {
            setFormData((prev) => ({ ...prev, is24h: checked }))
        }
        } else if (name !== "telefono") {
        setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleServiceChange = (index: number) => {
        const newServicios = [...formData.serviciosOfrecidos]
        newServicios[index] = !newServicios[index]
        setFormData((prev) => ({ ...prev, serviciosOfrecidos: newServicios }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (formData.contrasena.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres")
        return
        }

        if (formData.contrasena !== formData.confirmarContrasena) {
        setError("Las contraseñas no coinciden")
        return
        }

        if (!formData.serviciosOfrecidos.some((s) => s)) {
        setError("Debes seleccionar al menos un tipo de servicio")
        return
        }

        setLoading(true)

        try {
        const res = await fetch("/api/auth/register-laundry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            nombre: formData.nombre,
            correo: formData.correo,
            contrasena: formData.contrasena,
            telefono: formData.telefono,
            ciudad: formData.ciudad,
            direccion: formData.direccion,
            is24h: formData.is24h,
            horaApertura: formData.horaApertura,
            horaCierre: formData.horaCierre,
            serviciosOfrecidos: formData.serviciosOfrecidos,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || "Error en el registro")
            return
        }

        setRegistrationSuccess(true)
        } catch (err) {
        setError("Error al conectar con el servidor")
        } finally {
        setLoading(false)
        }
    }

    if (registrationSuccess) {
        return (
        <div className="min-h-screen bg-gradient-to-br from-[#012840] to-[#0368A6] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check-circle text-4xl text-green-600"></i>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-[#012840] mb-4">¡Registro Exitoso!</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
                Tu cuenta ha sido creada. Un encargado de verificación llegará a tu dirección para validar tu empresa.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-700">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                Una vez verificada tu cuenta, podrás iniciar sesión y comenzar a recibir pedidos.
                </p>
            </div>

            <Button
                onClick={() => router.push("/login")}
                className="w-full bg-[#012840] text-white hover:bg-[#0a1a2e] py-3 font-bold rounded-lg transition"
            >
                Ir a Iniciar Sesión
            </Button>
            </div>
        </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#012840] to-[#0368A6] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-center mb-6">
            <img src="/images/imagen-circular-recortada.png" alt="GIRO" className="h-16 w-16" />
            </div>

            <h1 className="text-3xl font-bold text-center text-[#012840] mb-2">Registra tu Lavandería</h1>
            <p className="text-center text-gray-600 mb-8">Únete a GIRO y comienza a crecer</p>

            {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Empresa */}
            <div>
                <h2 className="text-xl font-bold text-[#012840] mb-4">Información de la Empresa</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Empresa</label>
                    <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                    placeholder="Mi Lavandería"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                    <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                    placeholder="empresa@email.com"
                    />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                    <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm font-semibold">
                        +504
                    </span>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handlePhoneChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                        placeholder="1234-5678"
                        maxLength={9}
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                    <select
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                    >
                    <option value="">Selecciona una ciudad</option>
                    {ciudadesDisponibles.map((ciudad) => (
                        <option key={ciudad} value={ciudad}>
                        {ciudad}
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                    placeholder="Av. Principal 123, Barrio Centro"
                />
                </div>
            </div>

            {/* Horario de Atención */}
            <div>
                <h2 className="text-xl font-bold text-[#012840] mb-4">Horario de Atención</h2>

                <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                    type="checkbox"
                    name="is24h"
                    checked={formData.is24h}
                    onChange={handleChange}
                    className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-gray-700 font-semibold">Abierto 24/7</span>
                </label>
                </div>

                {!formData.is24h && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Apertura</label>
                    <input
                        type="time"
                        name="horaApertura"
                        value={formData.horaApertura}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Cierre</label>
                    <input
                        type="time"
                        name="horaCierre"
                        value={formData.horaCierre}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                    />
                    </div>
                </div>
                )}
            </div>

            {/* Capacidad y Servicios */}
            <div>
                <h2 className="text-xl font-bold text-[#012840] mb-4">Servicios Ofrecidos</h2>

                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Servicios que Ofrecerás</label>
                <div className="space-y-3">
                    {["Básico ($9.50/kg)", "Premium ($12.00/kg)", "Express ($17.00/kg)"].map((service, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                        <input
                        type="checkbox"
                        checked={formData.serviciosOfrecidos[index]}
                        onChange={() => handleServiceChange(index)}
                        className="w-5 h-5 cursor-pointer"
                        />
                        <span className="text-gray-700">{service}</span>
                    </label>
                    ))}
                </div>
                </div>
            </div>

            {/* Credenciales */}
            <div>
                <h2 className="text-xl font-bold text-[#012840] mb-4">Credenciales de Acceso</h2>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                    <input
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                    placeholder="Mínimo 8 caracteres"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Contraseña</label>
                    <input
                    type="password"
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] focus:ring-2 focus:ring-blue-100"
                    placeholder="Repite tu contraseña"
                    />
                </div>
                </div>
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
                className="w-full bg-[#012840] text-white hover:bg-[#0a1a2e] py-3 font-bold rounded-lg transition"
            >
                {loading ? "Creando cuenta..." : "Crear Cuenta de Lavandería"}
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
