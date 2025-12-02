"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBox,
  faWeightHanging,
  faPlusCircle,
  faTruck,
  faCreditCard,
  faArrowLeft,
  faCheck,
  faCreditCard as faCreditCardAlt,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons"

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
      router.push("/dashboard")
    }
  }, [router])

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "").replace(/\D/g, "")
    const groups = cleaned.match(/.{1,4}/g)
    return groups ? groups.join(" ") : cleaned
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const validateCardForm = () => {
    const cleanedCard = cardNumber.replace(/\s/g, "")
    if (cleanedCard.length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos")
      return false
    }

    const cleanedExpiry = expiryDate.replace(/\D/g, "")
    if (cleanedExpiry.length !== 4) {
      alert("La fecha de vencimiento debe tener formato MM/YY")
      return false
    }

    const month = Number.parseInt(cleanedExpiry.slice(0, 2))
    if (month < 1 || month > 12) {
      alert("El mes debe estar entre 01 y 12")
      return false
    }

    if (cvv.length !== 3) {
      alert("El CVV debe tener 3 dígitos")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "card" && !validateCardForm()) {
      return
    }

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

  const stepLabels = [
    { number: 1, label: "Servicio", icon: faBox },
    { number: 2, label: "Peso", icon: faWeightHanging },
    { number: 3, label: "Extras", icon: faPlusCircle },
    { number: 4, label: "Entrega", icon: faTruck },
    { number: 5, label: "Pago", icon: faCreditCard },
  ]

  if (showReceipt && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-bounce">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <FontAwesomeIcon icon={faCheck} className="text-4xl text-green-600" />
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
    <div className="h-screen flex flex-col bg-[#fdfdfd]">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/dashboard">
            <button className="text-[#012840] border-2 border-[#012840] px-4 py-2 rounded-lg hover:bg-[#012840] hover:text-white font-semibold transition-all">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Dashboard
            </button>
          </Link>
          <h1 className="text-xl font-bold text-[#012840]">
            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
            Confirmar Pago
          </h1>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#012840] to-[#014a6b] px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {/* Progress steps */}
          <div className="flex justify-between items-center mb-2">
            {stepLabels.map((s, idx) => (
              <div key={s.number} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {idx < stepLabels.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 h-1 transition-all duration-500 ease-in-out ${
                      s.number < 5 ? "bg-green-400 w-full" : "bg-gray-400 w-full"
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}

                {/* Step circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 transform relative z-10 ${
                    s.number === 5
                      ? "bg-white text-[#012840] scale-110 shadow-lg animate-pulse"
                      : s.number < 5
                        ? "bg-green-400 text-white shadow-md"
                        : "bg-gray-400 text-gray-200"
                  }`}
                >
                  {s.number < 5 ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    <FontAwesomeIcon icon={s.icon} className="text-sm" />
                  )}
                </div>

                {/* Step label - hidden on mobile, visible on md+ */}
                <span
                  className={`hidden md:block text-xs mt-2 font-semibold transition-all duration-300 ${
                    s.number === 5 ? "text-white scale-105" : s.number < 5 ? "text-green-200" : "text-gray-300"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Current step description */}
          <div className="text-center mt-3">
            <p className="text-white font-semibold text-sm md:text-base">Paso 5: Proceder al pago</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
          {/* Order Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
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
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-[#012840] mb-6">
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
              Método de Pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { id: "card", label: "Tarjeta de Crédito/Débito", icon: faCreditCardAlt, desc: "Pago inmediato" },
                { id: "cash", label: "Efectivo", icon: faMoneyBillWave, desc: "Pago contra entrega" },
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as "card" | "cash")}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-[#012840] bg-blue-50 shadow-md scale-105"
                      : "border-gray-300 bg-white hover:border-[#012840] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FontAwesomeIcon icon={method.icon} className="text-4xl text-[#012840]" />
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-[#012840] mb-6">Información de Tarjeta</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value)
                      if (formatted.replace(/\s/g, "").length <= 16) {
                        setCardNumber(formatted)
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] text-lg tracking-widest font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">{cardNumber.replace(/\s/g, "").length}/16 dígitos</p>
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titular de la Tarjeta</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    placeholder="NOMBRE COMPLETO"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] uppercase"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vencimiento</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value)
                        setExpiryDate(formatted)
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formato: MM/YY</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 3)
                        setCvv(value)
                      }}
                      placeholder="123"
                      maxLength={3}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840] font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">{cvv.length}/3 dígitos</p>
                  </div>
                </div>

                {/* Security Info */}
                <div className="bg-green-50 p-4 rounded-lg flex gap-3">
                  <FontAwesomeIcon icon={faCheck} className="text-green-600 text-xl flex-shrink-0" />
                  <p className="text-sm text-green-700">
                    Tu pago es 100% seguro. Utilizamos encriptación SSL de 256-bit
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Cash Payment Info - Only show if cash selected */}
          {paymentMethod === "cash" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fadeIn">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />
                  Instrucciones de Pago en Efectivo
                </h3>
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
            </div>
          )}

          {/* Trust Badges */}
          <div className="bg-white rounded-lg p-6 animate-fadeIn">
            <p className="text-center text-sm text-gray-600 mb-4">Métodos de pago aceptados:</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Visa</span>
              <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Mastercard</span>
              <span className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold text-[#012840]">Efectivo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faCreditCard} className="fa-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                {paymentMethod === "card" ? "Confirmar Pago" : "Confirmar Pedido con Pago en Efectivo"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
