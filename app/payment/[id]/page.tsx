"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrderDetails {
  numeroPedido: string
  precioTotal: number
  pesoKg: number
  servicioNombre: string
  pedidoId: number
}

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [loading, setLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const orderData = localStorage.getItem("pendingOrder")
    if (orderData) {
      const order = JSON.parse(orderData)
      setOrderDetails(order)
    } else {
      // If no pending order, redirect to dashboard
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const estadoPago = paymentMethod === "card" ? "completado" : "pendiente"
      const metodoPago = paymentMethod === "card" ? "Tarjeta de crédito" : "Efectivo"

      const res = await fetch(`/api/orders/${orderDetails?.pedidoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estadoPago: estadoPago,
          metodoPago: metodoPago,
        }),
      })

      if (res.ok) {
        localStorage.removeItem("pendingOrder")
        setShowReceipt(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } catch (error) {
      console.error("[GIRO] Error processing payment:", error)
    } finally {
      setLoading(false)
    }
  }

  if (showReceipt && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-bounce">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-4xl">✓</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-green-600 mb-2">¡Pago Completado!</h1>
          <p className="text-center text-gray-600 mb-8">Tu pedido ha sido procesado exitosamente</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <div className="text-center mb-6 pb-6 border-b border-gray-300">
              <h2 className="text-xl font-bold text-[#012840]">FACTURA DIGITAL</h2>
              <p className="text-gray-600 text-sm">{orderDetails.numeroPedido}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-700">Servicio:</span>
                <span className="font-semibold text-[#012840]">{orderDetails.servicioNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Peso:</span>
                <span className="font-semibold text-[#012840]">{orderDetails.pesoKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Fecha:</span>
                <span className="font-semibold text-[#012840]">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-lg border-t border-gray-300 pt-4">
                <span className="font-bold text-[#012840]">Total Pagado:</span>
                <span className="font-bold text-green-600">${orderDetails.precioTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              <p>Método de pago: {paymentMethod === "card" ? "Tarjeta de crédito" : "Efectivo"}</p>
              <p>Tu pedido será recogido pronto</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-6">Redirigiendo al dashboard en 3 segundos...</p>

          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="outline" className="text-[#012840] border-[#012840] bg-transparent">
              ← Volver
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#012840]">Confirmar Pago</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-[#012840] mb-4">Resumen del Pedido</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-semibold">{orderDetails?.numeroPedido}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Servicio:</span>
              <span className="font-semibold">{orderDetails?.servicioNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peso:</span>
              <span className="font-semibold">{orderDetails?.pesoKg} kg</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#012840] pt-3 border-t">
              <span>Total:</span>
              <span>${orderDetails?.precioTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#012840] mb-6">Método de Pago</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { id: "card", label: "Tarjeta de Crédito/Débito", icon: "💳", desc: "Pago inmediato" },
              { id: "cash", label: "Efectivo", icon: "💵", desc: "Pago contra entrega" },
            ].map((method) => (
              <div
                key={method.id}
                onClick={() => setPaymentMethod(method.id as "card" | "cash")}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  paymentMethod === method.id
                    ? "border-[#012840] bg-blue-50 shadow-md"
                    : "border-gray-300 bg-white hover:border-[#012840] hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{method.icon}</span>
                  <div>
                    <p className="font-bold text-[#012840] text-lg">{method.label}</p>
                    <p className="text-sm text-gray-600">{method.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Payment Form - Only show if card selected */}
        {paymentMethod === "card" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold text-[#012840] mb-6">Información de Tarjeta</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="16"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] text-lg tracking-widest"
                />
              </div>

              {/* Card Holder */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titular de la Tarjeta</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Nombre completo"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vencimiento (MM/YY)</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "")
                      if (val.length >= 2) {
                        val = val.slice(0, 2) + "/" + val.slice(2, 4)
                      }
                      setExpiryDate(val)
                    }}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="123"
                    maxLength="3"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 p-4 rounded-lg flex gap-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <p className="text-sm text-green-700">Tu pago es 100% seguro. Utilizamos encriptación SSL de 256-bit</p>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-semibold text-[#012840]">${orderDetails?.precioTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t border-gray-200 pt-3">
                    <span className="font-bold">Total a Pagar</span>
                    <span className="font-bold text-[#012840]">${orderDetails?.precioTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg"
              >
                {loading ? "Procesando pago..." : "Confirmar Pago"}
              </Button>
            </form>
          </div>
        )}

        {/* Cash Payment Info - Only show if cash selected */}
        {paymentMethod === "cash" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-amber-900 mb-4">Instrucciones de Pago en Efectivo</h3>
              <ul className="space-y-3 text-sm text-amber-800">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>El motorista recogerá tu ropa sin adelanto de pago</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>Pagarás en efectivo cuando se entregue tu ropa limpia</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>Total a pagar en entrega: ${orderDetails?.precioTotal.toFixed(2)}</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg mt-6"
            >
              {loading ? "Procesando..." : "Confirmar Pedido con Pago en Efectivo"}
            </Button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="bg-white rounded-lg p-6">
          <p className="text-center text-sm text-gray-600 mb-4">Métodos de pago aceptados:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Visa</span>
            <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Mastercard</span>
            <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Efectivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
