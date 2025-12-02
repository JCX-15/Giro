"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FaSpinner,
  FaMapMarkedAlt,
  FaCity,
  FaUserCircle,
  FaSignOutAlt,
  FaPlusCircle,
  FaArrowRight,
  FaTasks,
  FaChartLine,
  FaBox,
  FaReceipt,
  FaTshirt,
  FaCalendarAlt,
  FaDollarSign,
  FaEye,
  FaStar,
  FaTag,
  FaCopy,
  FaShoppingBag,
  FaPlus,
  FaBars,
  FaTimes,
  FaHistory,
} from "react-icons/fa"

interface Order {
  id: number
  numero_pedido: string
  tipo_servicio: string
  service_name?: string
  peso_kg: number
  precio_base: number
  precio_extras: number
  cantidad_descuento: number
  codigo_descuento: string | null
  precio_total: number | string
  estado: string
  estado_pago: string
  metodo_pago: string
  tiempo_entrega_horas: number
  creado_en: string
  nombre_local: string
  requiere_entrega: boolean
  requiere_recogida: boolean
  direccion_recogida: string
  barrio_recogida: string
  referencia_recogida: string
  hora_recogida: string
  extras?: Extra[]
}

interface Extra {
  nombre: string
  descripcion: string
  precio: number
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Usuario")
  const [showCityModal, setShowCityModal] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    const userId = localStorage.getItem("userId")
    const storedName = localStorage.getItem("userName")
    if (storedName) {
      setUserName(storedName)
    }

    if (!token || role !== "customer") {
      router.push("/login")
      return
    }

    fetchOrders(userId || "")
  }, [])

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch(`/api/orders/list?rol=cliente&usuarioId=${userId}`)

      if (!res.ok) {
        console.error("[GIRO] Error fetching orders:", res.status)
        return
      }

      const data = await res.json()
      console.log("[GIRO] Orders fetched:", data.pedidos?.length || 0)
      const ordersWithParsedPrice = (data.pedidos || []).map((order: any) => ({
        ...order,
        precio_total: Number.parseFloat(order.precio_total) || 0,
        precio_base: Number.parseFloat(order.precio_base) || 0,
        precio_extras: Number.parseFloat(order.precio_extras) || 0,
        cantidad_descuento: Number.parseFloat(order.cantidad_descuento) || 0,
      }))
      setOrders(ordersWithParsedPrice)
    } catch (error) {
      console.error("[GIRO] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      ropa_recibida: "bg-purple-100 text-purple-800",
      lavando: "bg-indigo-100 text-indigo-800",
      secando: "bg-cyan-100 text-cyan-800",
      planchando: "bg-teal-100 text-teal-800",
      listo_para_despachar: "bg-green-100 text-green-800",
      despachado: "bg-green-200 text-green-900",
      entregado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const handleNewOrder = () => {
    setShowCityModal(true)
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    localStorage.setItem("selectedCity", city)
    setShowCityModal(false)
    router.push("/new-order")
  }

  const activeOrders = orders.filter((order) => order.estado !== "entregado" || order.estado_pago !== "completado")

  const historyOrders = orders.filter((order) => order.estado === "entregado" && order.estado_pago === "completado")

  const displayedOrders = showHistory ? historyOrders : activeOrders

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-[#012840] mb-4 animate-spin" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {showCityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#012840] mb-4 flex items-center gap-2">
              <FaMapMarkedAlt />
              Selecciona tu ciudad
            </h2>
            <p className="text-gray-600 mb-6">¿En qué ciudad necesitas el servicio?</p>
            <div className="grid grid-cols-2 gap-3">
              {["Tegucigalpa", "Comayagua", "San Pedro Sula", "La Ceiba"].map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="p-4 border-2 border-[#012840] rounded-lg hover:bg-[#012840] hover:text-white transition font-semibold text-[#012840] flex flex-col items-center gap-2"
                >
                  <FaCity className="text-2xl" />
                  {city}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCityModal(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 md:px-6 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/images/imagen-circular-recortada.png" alt="GIRO" className="h-8 w-8" />
            <span className="font-bold text-[#012840]">GIRO</span>
          </div>
          <h1 className="hidden md:block text-2xl font-bold text-[#012840] flex items-center gap-2">
            <FaUserCircle />
            Hola, {userName}
          </h1>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-[#012840] text-2xl">
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>
          <button
            onClick={() => {
              localStorage.clear()
              router.push("/")
            }}
            className="hidden md:flex text-red-600 hover:text-red-800 font-semibold items-center gap-2"
          >
            <FaSignOutAlt />
            Salir
          </button>
        </div>
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="flex flex-col">
              <button
                onClick={() => {
                  setShowHistory(false)
                  setShowMobileMenu(false)
                }}
                className={`px-6 py-4 text-left hover:bg-gray-50 flex items-center gap-3 ${
                  !showHistory ? "bg-blue-50 text-[#012840] font-semibold" : "text-gray-700"
                }`}
              >
                <FaTasks />
                Pedidos Activos
              </button>
              <button
                onClick={() => {
                  setShowHistory(true)
                  setShowMobileMenu(false)
                }}
                className={`px-6 py-4 text-left hover:bg-gray-50 flex items-center gap-3 border-t ${
                  showHistory ? "bg-blue-50 text-[#012840] font-semibold" : "text-gray-700"
                }`}
              >
                <FaHistory />
                Mis Pedidos (Historial)
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  router.push("/")
                }}
                className="px-6 py-4 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 font-semibold border-t"
              >
                <FaSignOutAlt />
                Salir
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!showHistory && (
          <div className="relative bg-gradient-to-br from-[#012840] via-[#0368A6] to-[#012840] rounded-2xl p-8 text-white mb-6 overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-4 py-1 rounded-full text-sm mb-3 font-semibold flex items-center gap-1">
                <FaStar />
                OFERTA ESPECIAL
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">20% de Descuento</h2>
              <p className="text-lg mb-6 opacity-90">En tu primer pedido premium</p>
              <div className="bg-white text-[#012840] px-6 py-3 rounded-xl inline-flex items-center gap-2 font-bold shadow-lg flex items-center gap-1">
                <FaTag />
                <span className="text-lg">Código: GIRO20</span>
                <FaCopy className="cursor-pointer hover:text-blue-600 transition" />
              </div>
            </div>
          </div>
        )}

        {!showHistory && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleNewOrder}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition transform hover:scale-105 flex flex-col items-center justify-center gap-2"
            >
              <div className="flex items-center justify-between mb-2">
                <FaPlusCircle className="text-3xl" />
                <FaArrowRight className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold">Nuevo Pedido</h3>
              <p className="text-sm opacity-90">Solicita tu servicio ahora</p>
            </button>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{activeOrders.length}</span>
                <FaTasks className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold">Pedidos Activos</h3>
              <p className="text-sm opacity-90">En proceso</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{orders.length}</span>
                <FaChartLine className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold">Total Pedidos</h3>
              <p className="text-sm opacity-90">Histórico completo</p>
            </div>
          </div>
        )}

        <div className="hidden md:flex gap-4 mb-6">
          <button
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              !showHistory
                ? "bg-[#012840] text-white"
                : "bg-white text-[#012840] border-2 border-[#012840] hover:bg-gray-50"
            }`}
          >
            <FaTasks />
            Pedidos Activos
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              showHistory
                ? "bg-[#012840] text-white"
                : "bg-white text-[#012840] border-2 border-[#012840] hover:bg-gray-50"
            }`}
          >
            <FaHistory />
            Mis Pedidos (Historial)
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#012840] mb-4 flex items-center gap-2">
            {showHistory ? <FaHistory /> : <FaBox />}
            {showHistory ? "Historial de Pedidos" : "Pedidos Activos"}
          </h2>
          {displayedOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-lg flex flex-col items-center justify-center gap-4">
              <FaShoppingBag className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg mb-6">
                {showHistory ? "No tienes pedidos completados aún" : "No tienes pedidos activos"}
              </p>
              {!showHistory && (
                <Button
                  onClick={handleNewOrder}
                  className="bg-[#012840] text-white hover:bg-[#0a1a2e] px-8 py-3 text-lg flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  Crear tu primer pedido
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition flex flex-col items-center justify-center gap-2"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#012840] text-xl mb-1 flex items-center gap-2">
                        <FaReceipt />#{order.numero_pedido}
                      </h3>
                      <p className="text-gray-700 font-medium flex items-center gap-2">
                        <FaTshirt className="text-sm" />
                        {order.tipo_servicio} - {order.peso_kg} kg
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <FaCalendarAlt className="text-xs" />
                        {new Date(order.creado_en).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#012840] text-2xl mb-2 flex items-center gap-1 justify-end">
                        <FaDollarSign className="text-lg" />
                        {Number.parseFloat(order.precio_total.toString()).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.estado)}`}
                      >
                        {order.estado.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedOrder(order)}
                    variant="outline"
                    className="w-full mt-4 text-[#012840] border-2 border-[#012840] hover:bg-[#012840] hover:text-white bg-transparent font-semibold py-3 flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#012840] to-[#0368A6] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Detalles del Pedido</h2>
                  <p className="text-sm opacity-90">#{selectedOrder.numero_pedido}</p>
                </div>
                <button
                  onClick={() => {
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
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Estado Actual</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.estado)}`}
                >
                  {selectedOrder.estado.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2">Información del Servicio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Servicio</p>
                    <p className="font-semibold text-[#012840] capitalize">
                      {selectedOrder.service_name || selectedOrder.tipo_servicio}
                    </p>
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
                    <p className="text-sm text-gray-600">Lavandería</p>
                    <p className="font-semibold text-[#012840]">{selectedOrder.nombre_local}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.extras && selectedOrder.extras.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                    <FaPlus />
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

              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                  <FaMapMarkedAlt />
                  Recogida y Entrega
                </h3>
                <div className="space-y-3">
                  {selectedOrder.requiere_recogida && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <FaBox className="text-orange-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-orange-800 mb-1">Requiere Recogida</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dirección:</span> {selectedOrder.direccion_recogida}
                          </p>
                          {selectedOrder.barrio_recogida && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Barrio:</span> {selectedOrder.barrio_recogida}
                            </p>
                          )}
                          {selectedOrder.referencia_recogida && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Referencia:</span> {selectedOrder.referencia_recogida}
                            </p>
                          )}
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
                        <FaTshirt className="text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold text-green-800 mb-1">Requiere Entrega a Domicilio</p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Dirección de entrega:</span>{" "}
                            {selectedOrder.direccion_recogida}
                          </p>
                          {selectedOrder.barrio_recogida && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Barrio:</span> {selectedOrder.barrio_recogida}
                            </p>
                          )}
                          {selectedOrder.referencia_recogida && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Referencia:</span> {selectedOrder.referencia_recogida}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-[#012840] text-lg border-b pb-2 flex items-center gap-2">
                  <FaDollarSign />
                  Información de Pago
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Método de Pago</p>
                    <p className="font-semibold text-[#012840] capitalize">{selectedOrder.metodo_pago || "Efectivo"}</p>
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

              {!showDetailedBreakdown ? (
                <div className="space-y-3">
                  <h3 className="font-bold text-[#012840] text-lg border-b pb-2">Precio</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Pagado</span>
                    <span className="font-bold text-2xl text-[#012840]">
                      ${Number.parseFloat(selectedOrder.precio_total.toString()).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowDetailedBreakdown(true)}
                    variant="outline"
                    className="w-full text-[#012840] border-2 border-[#012840] hover:bg-[#012840] hover:text-white"
                  >
                    Ver Desglose Detallado
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-[#012840] text-lg border-b pb-2">Desglose de Precios</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Precio Base ({selectedOrder.peso_kg} kg)</span>
                      <span className="font-semibold text-[#012840]">
                        ${Number.parseFloat(selectedOrder.precio_base.toString()).toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.precio_extras > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Extras</span>
                        <span className="font-semibold text-[#012840]">
                          ${Number.parseFloat(selectedOrder.precio_extras.toString()).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-[#012840]">
                        $
                        {(
                          Number.parseFloat(selectedOrder.precio_base.toString()) +
                          Number.parseFloat(selectedOrder.precio_extras.toString())
                        ).toFixed(2)}
                      </span>
                    </div>
                    {selectedOrder.cantidad_descuento > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Descuentos</span>
                          <span className="font-semibold">
                            -${Number.parseFloat(selectedOrder.cantidad_descuento.toString()).toFixed(2)}
                          </span>
                        </div>
                        {selectedOrder.codigo_descuento && (
                          <div className="text-xs text-gray-500 ml-4">Cupón: {selectedOrder.codigo_descuento}</div>
                        )}
                        {!selectedOrder.requiere_entrega && (
                          <div className="text-xs text-gray-500 ml-4">Descuento por recogida en local</div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between pt-3 border-t-2 border-[#012840]">
                      <span className="font-bold text-lg text-[#012840]">Total</span>
                      <span className="font-bold text-2xl text-[#012840]">
                        ${Number.parseFloat(selectedOrder.precio_total.toString()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowDetailedBreakdown(false)}
                    variant="outline"
                    className="w-full text-[#012840] border-2 border-[#012840] hover:bg-[#012840] hover:text-white mt-4"
                  >
                    Ocultar Desglose
                  </Button>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                <p className="font-semibold text-[#012840]">
                  {new Date(selectedOrder.creado_en).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <Button
                onClick={() => {
                  setSelectedOrder(null)
                  setShowDetailedBreakdown(false)
                }}
                className="w-full bg-[#012840] hover:bg-[#0a1a2e] text-white font-bold py-3"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
