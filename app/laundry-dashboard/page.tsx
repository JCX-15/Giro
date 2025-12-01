"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface LaundryOrder {
  id: number
  numero_pedido: string
  customer_name: string
  customer_phone: string
  peso_kg: number
  precio_total: number
  estado: string
  estado_pago: string
  metodo_pago: string
  creado_en: string
  service_name: string
}

export default function LaundryDashboard() {
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: number; newStatus: string } | null>(null)
  const router = useRouter()

  const statuses = [
    "pendiente",
    "ropa_recibida",
    "lavando",
    "secando",
    "planchando",
    "listo_para_despachar",
    "despachado",
    "entregado",
  ]

  const statusLabels: Record<string, string> = {
    pendiente: "Pendiente",
    ropa_recibida: "Ropa Recibida",
    lavando: "Lavando",
    secando: "Secando",
    planchando: "Planchando",
    listo_para_despachar: "Listo para Despachar",
    despachado: "Despachado",
    entregado: "Entregado",
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || (role !== "laundry" && role !== "lavanderia")) {
      router.push("/login")
      return
    }

    fetchOrders(token)

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchOrders(token)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchOrders = async (token: string) => {
    try {
      const laundryId = localStorage.getItem("userId")
      const res = await fetch(`/api/orders/list?rol=lavanderia&usuarioId=${laundryId}`)

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login")
        }
        console.error("[GIRO] Error fetching orders:", res.status)
        return
      }

      const data = await res.json()
      console.log("[GIRO] Laundry orders fetched:", data.pedidos?.length || 0, data.pedidos)
      setOrders(data.pedidos || [])
    } catch (error) {
      console.error("[GIRO] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = statuses.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statuses.length - 1) return null
    return statuses[currentIndex + 1]
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: newStatus }),
      })

      if (res.ok) {
        const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, estado: newStatus } : o))
        setOrders(updatedOrders)
        setShowConfirmModal(false)
        setPendingStatusChange(null)
      } else {
        const errorData = await res.json()
        console.error("[GIRO] Error updating status:", errorData.error || "Unknown error")
        alert(errorData.error || "Error al actualizar el estado")
      }
    } catch (error) {
      console.error("[GIRO] Error updating status:", error)
      alert("Error al actualizar el estado")
    }
  }

  const updatePaymentStatus = async (orderId: number, paid: boolean) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estadoPago: paid ? "completado" : "pendiente" }),
      })

      if (res.ok) {
        const updatedOrders = orders.map((o) =>
          o.id === orderId ? { ...o, estado_pago: paid ? "completado" : "pendiente" } : o,
        )
        setOrders(updatedOrders)
      }
    } catch (error) {
      console.error("[GIRO] Error updating payment status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      ropa_recibida: "bg-blue-100 text-blue-800",
      lavando: "bg-purple-100 text-purple-800",
      secando: "bg-cyan-100 text-cyan-800",
      planchando: "bg-teal-100 text-teal-800",
      listo_para_despachar: "bg-green-100 text-green-800",
      despachado: "bg-green-200 text-green-900",
      entregado: "bg-green-300 text-green-900",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.estado === filterStatus)

  const pendingCount = orders.filter((o) => o.estado === "pendiente").length
  const inProcessCount = orders.filter((o) => ["lavando", "secando", "planchando"].includes(o.estado)).length
  const readyCount = orders.filter((o) => o.estado === "listo_para_despachar").length

  const todayRevenue = orders
    .filter((o) => {
      const today = new Date().toISOString().split("T")[0]
      const orderDate = new Date(o.creado_en).toISOString().split("T")[0]
      return orderDate === today && o.estado_pago === "completado"
    })
    .reduce((sum, o) => sum + Number.parseFloat(o.precio_total.toString()), 0)

  const handleStatusChangeClick = (orderId: number, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus)
    if (nextStatus) {
      setPendingStatusChange({ orderId, newStatus: nextStatus })
      setShowConfirmModal(true)
    }
  }

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      updateOrderStatus(pendingStatusChange.orderId, pendingStatusChange.newStatus)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#012840] to-[#0368A6] text-white px-4 py-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Lavandería</h1>
            <p className="text-sm opacity-80">Gestión de pedidos y servicios</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
                autoRefresh ? "bg-green-500 hover:bg-green-600" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                router.push("/")
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">PENDIENTES</p>
            <p className="text-4xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-gray-500 mt-2">Esperando confirmación</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">EN PROCESO</p>
            <p className="text-4xl font-bold text-purple-600">{inProcessCount}</p>
            <p className="text-xs text-gray-500 mt-2">Lavando/Planchando</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">LISTOS</p>
            <p className="text-4xl font-bold text-green-600">{readyCount}</p>
            <p className="text-xs text-gray-500 mt-2">Esperando entrega</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-[#012840]">
            <p className="text-gray-600 text-sm font-semibold mb-2">INGRESOS HOY</p>
            <p className="text-4xl font-bold text-[#012840]">${todayRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">
              {
                orders.filter((o) => {
                  const today = new Date().toISOString().split("T")[0]
                  const orderDate = new Date(o.creado_en).toISOString().split("T")[0]
                  return orderDate === today && o.estado_pago === "completado"
                }).length
              }{" "}
              pedidos pagados hoy
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "all" ? "bg-[#012840] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({orders.length})
            </button>
            {statuses.map((status) => {
              const count = orders.filter((o) => o.estado === status).length
              if (count === 0) return null
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterStatus === status ? "bg-[#012840] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {statusLabels[status]} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg font-semibold">No hay pedidos en este estado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.estado)
              const isCashPayment =
                order.metodo_pago?.toLowerCase().includes("efectivo") ||
                (order.estado_pago === "pendiente" && !order.metodo_pago) ||
                order.metodo_pago === ""
              const showPaymentCheckbox =
                isCashPayment && order.estado === "entregado" && order.estado_pago !== "completado"
              const isCardPayment =
                order.metodo_pago?.toLowerCase().includes("tarjeta") ||
                order.metodo_pago?.toLowerCase().includes("card")

              // Debug log
              console.log(
                `[GIRO] Order #${order.id}: metodo_pago="${order.metodo_pago}", estado="${order.estado}", estado_pago="${order.estado_pago}", showCheckbox=${showPaymentCheckbox}`,
              )

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-[#012840] hover:shadow-md transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">PEDIDO #</p>
                      <p className="text-lg font-bold text-[#012840]">{order.numero_pedido || `#${order.id}`}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.creado_en).toLocaleDateString("es-ES")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">CLIENTE</p>
                      <p className="text-sm font-bold text-gray-800">{order.customer_name}</p>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-xs text-green-600 hover:text-green-800 font-semibold"
                      >
                        {order.customer_phone}
                      </a>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">SERVICIO</p>
                      <p className="text-sm font-bold text-gray-800">{order.service_name}</p>
                      <p className="text-xs text-gray-600">{order.peso_kg} kg</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">MONTO</p>
                      <p className="text-lg font-bold text-[#012840]">
                        ${Number.parseFloat(order.precio_total.toString()).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pago:{" "}
                        {isCardPayment ? "✓ Tarjeta" : order.estado_pago === "completado" ? "✓ Pagado" : "Pendiente"}
                      </p>
                      {showPaymentCheckbox && (
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={order.estado_pago === "completado"}
                            onChange={(e) => updatePaymentStatus(order.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-xs font-semibold text-green-600">Marcar como Pagado</span>
                        </label>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${getStatusColor(order.estado)}`}
                      >
                        {statusLabels[order.estado] || order.estado}
                      </span>
                      {nextStatus && (
                        <button
                          onClick={() => handleStatusChangeClick(order.id, order.estado)}
                          className="bg-[#012840] text-white hover:bg-[#0a1a2e] px-3 py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Cambiar Estado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showConfirmModal && pendingStatusChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fas fa-sync-alt text-3xl text-blue-600"></i>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-[#012840] mb-4">Confirmar Cambio de Estado</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-center text-gray-700 mb-3">¿Deseas cambiar el estado del pedido a:</p>
              <div className="flex justify-center">
                <span
                  className={`px-6 py-2 rounded-full text-sm font-bold ${getStatusColor(pendingStatusChange.newStatus)}`}
                >
                  {statusLabels[pendingStatusChange.newStatus]}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setPendingStatusChange(null)
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 bg-[#012840] hover:bg-[#0a1a2e] text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
