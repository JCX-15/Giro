"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface LaundryOrder {
  id: number
  numero_pedido: string
  customer_name: string
  customer_phone: string
  peso_kg: number
  precio_total: number | string
  estado: string
  estado_pago: string
  metodo_pago: string
  creado_en: string
  service_name: string
  precio_base: number
  precio_extras: number
  cantidad_descuento: number
  codigo_descuento: string | null
  requiere_recogida: boolean
  requiere_entrega: boolean
  direccion_recogida: string
  barrio_recogida: string
  referencia_recogida: string
  hora_recogida: string
  tiempo_entrega_horas: number
  extras?: Extra[]
}

interface Extra {
  nombre: string
  descripcion: string
  precio: number
}

export default function LaundryDashboard() {
  const [orders, setOrders] = useState<LaundryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: number; newStatus: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [currentView, setCurrentView] = useState<"active" | "history">("active")
  const [autoOnOff, setAutoOnOff] = useState(true)
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
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

  const displayedOrders =
    currentView === "active"
      ? orders.filter((o) => !(o.estado === "entregado" && o.estado_pago === "completado"))
      : orders.filter((o) => o.estado === "entregado" && o.estado_pago === "completado")

  const filteredOrders =
    filterStatus === "all" ? displayedOrders : displayedOrders.filter((o) => o.estado === filterStatus)

  const pendingCount = displayedOrders.filter((o) => o.estado === "pendiente").length
  const inProcessCount = displayedOrders.filter((o) => ["lavando", "secando", "planchando"].includes(o.estado)).length
  const readyCount = displayedOrders.filter((o) => o.estado === "listo_para_despachar").length

  const todayRevenue = displayedOrders
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
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition flex items-center gap-2"
            >
              <i className="fas fa-bars text-xl"></i>
              <span className="hidden md:inline">Menú</span>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top duration-200 z-50">
                <button
                  onClick={() => {
                    setCurrentView("active")
                    setShowMenu(false)
                  }}
                  className={`w-full text-left px-4 py-3 transition flex items-center ${
                    currentView === "active" ? "bg-[#012840] text-white" : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <i className="fas fa-tasks mr-3 w-5"></i>
                  Pedidos Activos
                </button>

                <button
                  onClick={() => {
                    setCurrentView("history")
                    setShowMenu(false)
                  }}
                  className={`w-full text-left px-4 py-3 transition flex items-center border-t ${
                    currentView === "history" ? "bg-[#012840] text-white" : "text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <i className="fas fa-history mr-3 w-5"></i>
                  Historial de Pedidos
                </button>

                <div className="border-t px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-power-off text-gray-600 w-5"></i>
                      <span className="text-gray-800 font-medium">Auto</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoOnOff}
                        onChange={(e) => {
                          setAutoOnOff(e.target.checked)
                          setAutoRefresh(e.target.checked)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-2 text-sm font-medium text-gray-800">{autoOnOff ? "ON" : "OFF"}</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => {
                    localStorage.clear()
                    router.push("/login")
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition border-t flex items-center"
                >
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>
                  Salir
                </button>
              </div>
            )}
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
                displayedOrders.filter((o) => {
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
              Todos ({displayedOrders.length})
            </button>
            {statuses.map((status) => {
              const count = displayedOrders.filter((o) => o.estado === status).length
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
            <p className="text-gray-600 text-lg font-semibold">
              {currentView === "history"
                ? "No hay pedidos completados en el historial"
                : "No hay pedidos en este estado"}
            </p>
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
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderDetailsModal(true)
                        }}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-eye"></i>
                        Ver Detalles
                      </button>
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

      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#012840] to-[#0368A6] text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Detalles del Pedido</h2>
                  <p className="text-sm opacity-90">#{selectedOrder.numero_pedido}</p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderDetailsModal(false)
                    setSelectedOrder(null)
                    setShowDetailedBreakdown(false)
                  }}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                  <i className="fas fa-user-circle"></i>
                  Información del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-semibold text-[#012840]">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      className="font-semibold text-green-600 hover:text-green-800"
                    >
                      {selectedOrder.customer_phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Estado Actual</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.estado)}`}
                >
                  {statusLabels[selectedOrder.estado]}
                </span>
              </div>

              {/* Service Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2">Información del Servicio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Servicio</p>
                    <p className="font-semibold text-[#012840] capitalize">{selectedOrder.service_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Peso del Pedido</p>
                    <p className="font-semibold text-[#012840]">{selectedOrder.peso_kg} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo de Entrega</p>
                    <p className="font-semibold text-[#012840]">{selectedOrder.tiempo_entrega_horas} horas</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha del Pedido</p>
                    <p className="font-semibold text-[#012840]">
                      {new Date(selectedOrder.creado_en).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extras Section */}
              {selectedOrder.extras && selectedOrder.extras.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                    <i className="fas fa-plus-circle"></i>
                    Extras Añadidos
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.extras.map((extra, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-[#012840]">{extra.nombre}</p>
                          <p className="text-xs text-gray-600">{extra.descripcion}</p>
                        </div>
                        <span className="font-bold text-green-600">
                          +${Number.parseFloat(extra.precio.toString()).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pickup & Delivery */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                  <i className="fas fa-map-marker-alt"></i>
                  Recogida y Entrega
                </h3>
                <div className="space-y-3">
                  {selectedOrder.requiere_recogida && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <i className="fas fa-box-open text-orange-600 mt-1"></i>
                        <div className="flex-1">
                          <p className="font-semibold text-orange-800 mb-1">Requiere Recogida</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dirección:</span> {selectedOrder.direccion_recogida}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Barrio:</span> {selectedOrder.barrio_recogida}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Referencia:</span> {selectedOrder.referencia_recogida}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Hora:</span> {selectedOrder.hora_recogida}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedOrder.requiere_entrega && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <i className="fas fa-truck text-green-600 mt-1"></i>
                        <div className="flex-1">
                          <p className="font-semibold text-green-800 mb-1">Requiere Entrega a Domicilio</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dirección de entrega:</span>{" "}
                            {selectedOrder.direccion_recogida}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Barrio:</span> {selectedOrder.barrio_recogida}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Referencia:</span> {selectedOrder.referencia_recogida}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                  <i className="fas fa-dollar-sign"></i>
                  Información de Pago
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <p className="font-semibold text-[#012840] capitalize">{selectedOrder.metodo_pago}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado del Pago</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.estado_pago === "completado"
                          ? "bg-green-100 text-green-800"
                          : selectedOrder.estado_pago === "fallido"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedOrder.estado_pago.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-[#012840] text-lg">Desglose de Precios</h3>
                  <button
                    onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {showDetailedBreakdown ? "Ocultar detalles" : "Ver detalles"}
                  </button>
                </div>
                {showDetailedBreakdown && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Precio Base ({selectedOrder.service_name})</span>
                      <span className="font-semibold text-[#012840]">
                        ${Number.parseFloat(selectedOrder.precio_base?.toString() || "0").toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.precio_extras > 0 && (
                      <div className="flex justify-between items-center py-2 border-t">
                        <span className="text-gray-700">Extras Añadidos</span>
                        <span className="font-semibold text-green-600">
                          +${Number.parseFloat(selectedOrder.precio_extras.toString()).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.cantidad_descuento > 0 && (
                      <div className="flex justify-between items-center py-2 border-t">
                        <span className="text-gray-700">
                          Descuento {selectedOrder.codigo_descuento && `(${selectedOrder.codigo_descuento})`}
                        </span>
                        <span className="font-semibold text-red-600">
                          -${Number.parseFloat(selectedOrder.cantidad_descuento.toString()).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
                      <span className="text-lg font-bold text-[#012840]">Total a Pagar</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${Number.parseFloat(selectedOrder.precio_total?.toString() || "0").toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                {!showDetailedBreakdown && (
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#012840]">Total</span>
                    <span className="text-3xl font-bold text-green-600">
                      ${Number.parseFloat(selectedOrder.precio_total?.toString() || "0").toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowOrderDetailsModal(false)
                  setSelectedOrder(null)
                  setShowDetailedBreakdown(false)
                }}
                className="w-full bg-[#012840] hover:bg-[#0a1a2e] text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
