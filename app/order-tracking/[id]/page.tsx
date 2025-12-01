"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrderDetail {
  id: number
  order_number: string
  service_name: string
  weight_kg: number
  total_price: number
  status: string
  delivery_method: string
  pickup_address: string
  customer_name: string
  customer_phone: string
  driver_name: string
  driver_phone: string
  driver_latitude: number
  driver_longitude: number
  laundry_name: string
  laundry_lat: number
  laundry_lng: number
  created_at: string
}

interface Extra {
  name: string
  price: number
}

interface OrderLog {
  id: number
  previous_status: string
  new_status: string
  created_at: string
}

export default function OrderTrackingPage() {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [extras, setExtras] = useState<Extra[]>([])
  const [logs, setLogs] = useState<OrderLog[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const params = useParams()
  const router = useRouter()

  const statusSteps = [
    "pending",
    "confirmed",
    "picked_up",
    "in_laundry",
    "washed",
    "ironed",
    "ready",
    "in_delivery",
    "delivered",
  ]

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchOrderDetails(token)

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchOrderDetails(token)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchOrderDetails = async (token: string) => {
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login")
        }
        return
      }

      const data = await res.json()
      setOrder(data.order)
      setExtras(data.extras || [])
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      picked_up: "bg-blue-100 text-blue-800",
      in_laundry: "bg-purple-100 text-purple-800",
      washed: "bg-purple-100 text-purple-800",
      ironed: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
      in_delivery: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente de Confirmación",
      confirmed: "Confirmado",
      picked_up: "Recogido",
      in_laundry: "En Lavandería",
      washed: "Lavado",
      ironed: "Planchado",
      ready: "Listo para Entrega",
      in_delivery: "En Camino",
      delivered: "Entregado",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
        <p className="text-gray-600">Cargando detalles del pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
        <p className="text-gray-600">Pedido no encontrado</p>
      </div>
    )
  }

  const currentStatusIndex = statusSteps.indexOf(order.status)
  const estimatedDeliveryDate = new Date(order.created_at)
  estimatedDeliveryDate.setHours(estimatedDeliveryDate.getHours() + (order.status === "pending" ? 48 : 24))

  return (
    <div className="min-h-screen bg-[#fdfdfd] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="outline" className="text-[#012840] border-[#012840] bg-transparent">
              ← Atrás
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-[#012840]">Rastreo del Pedido</h1>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-sm font-semibold px-3 py-1 rounded-lg ${
              autoRefresh ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {autoRefresh ? "Auto-actualización ON" : "Auto-actualización OFF"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Order Number and Status */}
        <div className="bg-gradient-to-r from-[#012840] to-[#0368A6] text-white rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-80 mb-1">Número de Pedido</p>
              <p className="text-2xl font-bold">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Estado Actual</p>
              <p className="text-2xl font-bold">{getStatusLabel(order.status)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Monto Total</p>
              <p className="text-2xl font-bold">${order.total_price}</p>
            </div>
          </div>
        </div>

        {/* Timeline/Progress */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#012840] mb-6">Progreso del Pedido</h2>

          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex

              return (
                <div key={step} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        isCompleted ? "bg-green-600" : "bg-gray-300"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-1 h-12 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />
                    )}
                  </div>

                  <div className={`flex-1 ${isCurrent ? "font-bold" : ""}`}>
                    <p className={`text-sm ${isCurrent ? "text-[#012840]" : "text-gray-600"}`}>
                      {getStatusLabel(step)}
                    </p>
                    {isCurrent && <p className="text-sm text-green-600 font-semibold">En progreso ahora</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Driver Information */}
        {order.driver_name && order.status !== "pending" && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border-l-4 border-green-600">
            <h2 className="text-xl font-bold text-[#012840] mb-4">Información del Motorista</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Nombre</p>
                <p className="text-lg font-bold text-[#012840]">{order.driver_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Teléfono</p>
                <a href={`tel:${order.driver_phone}`} className="text-lg font-bold text-green-600 hover:underline">
                  {order.driver_phone}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Estado</p>
                <p className="text-lg font-bold text-[#012840]">
                  {order.status === "in_delivery" ? "En Camino" : "Asignado"}
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-4 bg-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-600 font-semibold">
              Mapa de Ubicación del Motorista
              {order.driver_latitude && order.driver_longitude && (
                <div className="text-xs ml-2">
                  ({order.driver_latitude.toFixed(4)}, {order.driver_longitude.toFixed(4)})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#012840] mb-4">Detalles del Pedido</h2>

          <div className="space-y-4">
            <div className="flex justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-700">Servicio</span>
              <span className="font-bold text-[#012840]">{order.service_name}</span>
            </div>

            <div className="flex justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-700">Peso</span>
              <span className="font-bold text-[#012840]">{order.weight_kg} kg</span>
            </div>

            <div className="flex justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-700">Método de Entrega</span>
              <span className="font-bold text-[#012840]">
                {order.delivery_method === "home" ? "A Domicilio" : "Recoger en Local"}
              </span>
            </div>

            <div className="flex justify-between pb-4 border-b border-gray-200">
              <span className="text-gray-700">Dirección</span>
              <span className="font-bold text-[#012840] text-right">{order.pickup_address}</span>
            </div>

            {extras.length > 0 && (
              <div>
                <p className="text-gray-700 font-semibold mb-2">Extras Seleccionados:</p>
                <ul className="space-y-1">
                  {extras.map((extra, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-700">
                      <span>• {extra.name}</span>
                      <span className="font-bold text-[#012840]">+${extra.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#012840] mb-4">Contacto</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-bold text-[#012840]">{order.customer_name}</p>
              </div>
              <a href={`tel:${order.customer_phone}`} className="text-green-600 hover:text-green-800 font-semibold">
                Llamar
              </a>
            </div>

            {order.laundry_name && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Lavandería</p>
                  <p className="font-bold text-[#012840]">{order.laundry_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline/History */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#012840] mb-4">Historial de Cambios</h2>

            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-700">
                      Estado cambió de <strong>{log.previous_status}</strong> a{" "}
                      <strong className="text-green-600">{log.new_status}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
