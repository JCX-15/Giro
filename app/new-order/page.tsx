"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  faEye,
  faSpinner,
  faCheck,
  faShoppingCart,
  faFileInvoice,
  faArrowRight,
  faClock,
} from "@fortawesome/free-solid-svg-icons"

interface Service {
  id: number
  name: string
  price_per_kg: number
  description: string
  includes_drying: boolean
  includes_ironing: boolean
}

interface Laundry {
  id: number
  nombre: string
  ciudad: string
  capacidad_simultanea: number
  solicitudes_activas: number
  is24h: boolean
  horario_apertura: string
  horario_cierre: string
  direccion: string
}

interface DiscountResponse {
  valid: boolean
  discount?: {
    porcentaje_descuento?: number
    monto_descuento?: number
  }
  message: string
}

interface Pricing {
  basePrice: string
  extrasPrice: string
  subtotal: string
  pickupDiscount: string
  couponDiscount: string
  totalDiscount: string
  total: string
}

export default function NewOrderPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [laundries, setLaundries] = useState<Laundry[]>([])
  const [selectedLaundry, setSelectedLaundry] = useState<number | null>(null)
  const [selectedCity, setSelectedCity] = useState("")
  const [weight, setWeight] = useState<number>(5.0)
  const [manualWeightInput, setManualWeightInput] = useState<string>("5.0")
  const [extras, setExtras] = useState<any[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState("home")
  const [pickupAddress, setPickupAddress] = useState("")
  const [pickupNeighborhood, setPickupNeighborhood] = useState("")
  const [pickupReference, setPickupReference] = useState("")
  const [pickupTime, setPickupTime] = useState("8:00 - 10:00 AM")
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState<DiscountResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLaundries, setLoadingLaundries] = useState(false)
  const router = useRouter()
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    const city = localStorage.getItem("selectedCity")
    if (city) {
      setSelectedCity(city)
    }
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setServices([
        {
          id: 1,
          name: "Básico",
          price_per_kg: 9.5,
          description: "Perfecto para uso ocasional",
          includes_drying: false,
          includes_ironing: false,
        },
        {
          id: 2,
          name: "Premium",
          price_per_kg: 12.0,
          description: "El más solicitado",
          includes_drying: true,
          includes_ironing: true,
        },
        {
          id: 3,
          name: "Express",
          price_per_kg: 17.0,
          description: "Para cuando tienes prisa",
          includes_drying: true,
          includes_ironing: true,
        },
      ])
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchAvailableLaundries = async (serviceId: number) => {
    if (!selectedCity) {
      alert("Por favor selecciona una ciudad primero")
      return
    }

    setLoadingLaundries(true)
    try {
      const res = await fetch(
        `/api/laundries/available?serviceId=${serviceId}&ciudad=${encodeURIComponent(selectedCity)}`,
      )
      const data = await res.json()
      setLaundries(data.laundries || [])
    } catch (error) {
      console.error("Error fetching laundries:", error)
      setLaundries([])
    } finally {
      setLoadingLaundries(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!discountCode.trim()) return

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode }),
      })
      const data: DiscountResponse = await res.json()
      setDiscountApplied(data)
    } catch (error) {
      console.error("Error validating coupon:", error)
      setDiscountApplied({ valid: false, message: "Error al validar cupón" })
    }
  }

  const calculatePricing = () => {
    const basePrice = selectedService
      ? Number.parseFloat(selectedService.price_per_kg.toString()) * Number.parseFloat(weight.toString())
      : 0

    const extrasPrice = extras.reduce((sum, extra) => sum + Number.parseFloat(extra.price.toString()), 0)

    const subtotal = basePrice + extrasPrice

    // Apply pickup discount if delivery method is pickup (not home)
    const pickupDiscount = deliveryMethod === "pickup" ? subtotal * 0.1 : 0

    const couponDiscount = discountApplied?.valid
      ? discountApplied.discount?.porcentaje_descuento
        ? subtotal * (discountApplied.discount.porcentaje_descuento / 100)
        : discountApplied.discount?.monto_descuento || 0
      : 0

    const totalDiscount = pickupDiscount + couponDiscount
    const total = subtotal - totalDiscount

    console.log("[v0] Pricing calculation:", {
      basePrice,
      extrasPrice,
      subtotal,
      pickupDiscount,
      couponDiscount,
      totalDiscount,
      total,
      discountApplied,
    })

    return {
      basePrice: basePrice.toFixed(2),
      extrasPrice: extrasPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
      pickupDiscount: pickupDiscount.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const handleServiceSelect = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId)
    setSelectedService(service)
    setSelectedLaundry(null)
    fetchAvailableLaundries(serviceId)
  }

  const handleContinue = () => {
    if (step === 1 && (!selectedService || !selectedLaundry)) {
      alert("Por favor selecciona un servicio y una lavandería")
      return
    }
    if (step === 4) {
      setShowSummary(true)
    } else {
      setStep(step + 1)
    }
  }

  const handleCreateOrder = async () => {
    setLoading(true)

    const pricing = calculatePricing()
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    const serviceType = selectedService?.name
    const selectedExtras = extras

    try {
      const orderData = {
        usuarioClienteId: userId,
        idLocal: selectedLaundry,
        tipoServicio: serviceType,
        pesoKg: Number.parseFloat(weight),
        precioBase: Number.parseFloat(pricing.basePrice),
        precioExtras: Number.parseFloat(pricing.extrasPrice),
        descuentoRecogida: Number.parseFloat(pricing.pickupDiscount),
        descuentoCupon: Number.parseFloat(pricing.couponDiscount),
        precioTotal: Number.parseFloat(pricing.total),
        metodoEntrega: deliveryMethod,
        direccionRecogida: pickupAddress,
        coloniaRecogida: pickupNeighborhood,
        referenciasRecogida: pickupReference,
        horarioRecogida: pickupTime,
        extras: selectedExtras.map((extra: any) => ({
          id: extra.id,
          price: extra.price,
        })),
        codigoDescuento: discountApplied?.valid ? discountCode : null,
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const data = await res.json()
        // Store order details for payment page
        localStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            pedidoId: data.orderId,
            numeroPedido: data.orderNumber,
            precioTotal: Number.parseFloat(pricing.total),
            pesoKg: weight,
            servicioNombre: serviceType,
          }),
        )
        // Navigate to payment page
        router.push(`/payment/${data.orderId}`)
      } else {
        alert("Error al crear el pedido")
      }
    } catch (error) {
      console.error("[GIRO] Error creating order:", error)
      alert("Error al crear el pedido")
    } finally {
      setLoading(false)
    }
  }

  const handleWeightChange = (value: string) => {
    setManualWeightInput(value)
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setWeight(numValue)
    }
  }

  const stepLabels = [
    { number: 1, label: "Servicio", icon: faBox },
    { number: 2, label: "Peso", icon: faWeightHanging },
    { number: 3, label: "Extras", icon: faPlusCircle },
    { number: 4, label: "Entrega", icon: faTruck },
    { number: 5, label: "Pago", icon: faCreditCard },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#fdfdfd]">
      {/* Fixed Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/dashboard">
            <button className="text-[#012840] border-2 border-[#012840] px-4 py-2 rounded-lg hover:bg-[#012840] hover:text-white font-semibold transition-all">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Dashboard
            </button>
          </Link>
          <h1 className="text-xl font-bold text-[#012840]">
            <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
            Nuevo Pedido
          </h1>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Fixed Progress Bar with descriptive text and animations */}
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
                      s.number < (showSummary ? 5 : step) ? "bg-green-400 w-full" : "bg-gray-400 w-full"
                    }`}
                    style={{ zIndex: 0 }}
                  />
                )}

                {/* Step circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 transform relative z-10 ${
                    s.number === (showSummary ? 5 : step)
                      ? "bg-white text-[#012840] scale-110 shadow-lg animate-pulse"
                      : s.number < (showSummary ? 5 : step)
                        ? "bg-green-400 text-white shadow-md"
                        : "bg-gray-400 text-gray-200"
                  }`}
                >
                  {s.number < (showSummary ? 5 : step) ? (
                    <FontAwesomeIcon icon={faCheck} />
                  ) : (
                    <FontAwesomeIcon icon={s.icon} className="text-sm" />
                  )}
                </div>

                {/* Step label - hidden on mobile, visible on md+ */}
                <span
                  className={`hidden md:block text-xs mt-2 font-semibold transition-all duration-300 ${
                    s.number === (showSummary ? 5 : step)
                      ? "text-white scale-105"
                      : s.number < (showSummary ? 5 : step)
                        ? "text-green-200"
                        : "text-gray-300"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Current step description */}
          <div className="text-center mt-3">
            <p className="text-white font-semibold text-sm md:text-base">
              {showSummary
                ? "Paso 5: Proceder al pago"
                : `Paso ${step}: ${stepLabels[step - 1]?.label || "Configuración"}`}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
          {/* Step 1: Service & Laundry Selection */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#012840] mb-2">
                <FontAwesomeIcon icon={faBox} className="mr-2" />
                Selecciona tu servicio
              </h2>
              <p className="text-gray-600 mb-6">
                Elige el plan que mejor se adapte a tus necesidades en {selectedCity}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                      selectedService === service
                        ? "border-[#012840] bg-blue-50"
                        : "border-gray-300 bg-white hover:border-[#012840]"
                    }`}
                  >
                    <h3 className="text-xl font-bold text-[#012840] mb-2">{service.name}</h3>
                    <p className="text-3xl font-bold text-[#012840] mb-2">${service.price_per_kg}/kg</p>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <ul className="space-y-2 text-sm">
                      <li className="text-gray-700">✓ Lavado profesional</li>
                      {service.includes_drying && <li className="text-gray-700">✓ Secado incluido</li>}
                      {service.includes_ironing && <li className="text-gray-700">✓ Planchado premium</li>}
                      <li className="text-gray-700">✓ Recogida a domicilio</li>
                    </ul>
                  </div>
                ))}
              </div>

              {selectedService && (
                <div>
                  <h3 className="text-2xl font-bold text-[#012840] mb-4">Lavanderías disponibles en {selectedCity}</h3>
                  {loadingLaundries ? (
                    <p className="text-gray-600">Cargando lavanderías disponibles...</p>
                  ) : laundries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {laundries.map((laundry) => (
                        <div
                          key={laundry.id}
                          onClick={() => setSelectedLaundry(laundry.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                            selectedLaundry === laundry.id
                              ? "border-[#012840] bg-blue-50"
                              : "border-gray-300 bg-white hover:border-[#012840]"
                          }`}
                        >
                          <h4 className="font-bold text-[#012840] mb-2">{laundry.nombre}</h4>
                          <p className="text-sm text-gray-600 mb-2">{laundry.direccion}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {laundry.is24h ? "Abierto 24/7" : `${laundry.horario_apertura} - ${laundry.horario_cierre}`}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              Capacidad: {laundry.solicitudes_activas}/{laundry.capacidad_simultanea}
                            </span>
                            {laundry.solicitudes_activas < laundry.capacidad_simultanea && (
                              <span className="text-green-600 font-semibold">✓ Disponible</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-lg text-center">
                      <p className="text-gray-600">
                        No hay lavanderías disponibles para este servicio en {selectedCity}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Weight Selection */}
          {step === 2 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#012840] mb-2">
                <FontAwesomeIcon icon={faWeightHanging} className="mr-2" />
                ¿Cuántos kilos de ropa?
              </h2>
              <p className="text-gray-600 mb-6">Indica el peso aproximado de tu ropa</p>

              <div className="bg-white rounded-lg p-6 mb-6">
                <p className="text-gray-600 mb-4">Servicio {selectedService?.name}</p>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <button
                    onClick={() => {
                      const newWeight = Math.max(0.5, weight - 0.5)
                      setWeight(newWeight)
                      setManualWeightInput(newWeight.toFixed(1))
                    }}
                    className="w-12 h-12 rounded-lg bg-[#012840] text-white text-2xl flex items-center justify-center hover:bg-[#0a1a2e]"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={manualWeightInput}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      className="text-5xl font-bold text-[#012840] w-32 text-center border-2 border-gray-300 rounded-lg focus:border-[#012840] focus:outline-none"
                    />
                    <p className="text-gray-600 mt-2">kilogramos</p>
                  </div>
                  <button
                    onClick={() => {
                      const newWeight = weight + 0.5
                      setWeight(newWeight)
                      setManualWeightInput(newWeight.toFixed(1))
                    }}
                    className="w-12 h-12 rounded-lg bg-[#012840] text-white text-2xl flex items-center justify-center hover:bg-[#0a1a2e]"
                  >
                    +
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio por kg</span>
                    <span className="font-bold text-[#012840]">${selectedService?.price_per_kg || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso seleccionado</span>
                    <span className="font-bold text-[#012840]">{weight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Subtotal</span>
                    <span className="font-bold text-[#012840]">
                      ${((selectedService?.price_per_kg || 0) * weight).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Extras */}
          {step === 3 && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#012840] mb-2">
                <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                Servicios adicionales
              </h2>
              <p className="text-gray-600 mb-6">Selecciona los extras que desees agregar (opcional)</p>

              <div className="space-y-4 mb-6">
                {[
                  { id: 1, name: "Suavizante Premium", price: 5 },
                  { id: 2, name: "Tratamiento Anti-Manchas", price: 8 },
                  { id: 3, name: "Empaque Especial", price: 6 },
                  { id: 4, name: "Doblado Profesional", price: 10 },
                  { id: 5, name: "Desinfección Profunda", price: 7 },
                ].map((extra) => (
                  <div
                    key={extra.id}
                    className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={extras.some((e) => e.id === extra.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExtras([...extras, extra])
                          } else {
                            setExtras(extras.filter((e) => e.id !== extra.id))
                          }
                        }}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <span className="font-semibold text-[#012840]">{extra.name}</span>
                    </label>
                    <span className="font-bold text-[#012840]">+${extra.price}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal servicio</span>
                    <span className="font-bold text-[#012840]">${calculatePricing().subtotal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Delivery & Discounts */}
          {step === 4 && !showSummary && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#012840] mb-2">
                <FontAwesomeIcon icon={faTruck} className="mr-2" />
                Método de entrega
              </h2>

              {/* Delivery Method */}
              <div className="bg-white rounded-lg p-4 flex items-center justify-between border border-gray-200">
                <div className="space-y-2 w-full">
                  <h3 className="font-bold text-[#012840] mb-2">¿Cómo deseas recibir tu pedido?</h3>
                  {[
                    {
                      id: "home",
                      title: "Entrega a domicilio",
                      price: "Gratis",
                      features: ["Seguimiento en tiempo real", "Notificación de llegada"],
                    },
                    {
                      id: "pickup",
                      title: "Recoger en local",
                      price: "Descuento 10%",
                      features: ["Ahorra 10% en tu pedido", "Horario flexible"],
                    },
                  ].map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setDeliveryMethod(option.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer ${
                        deliveryMethod === option.id ? "border-[#012840] bg-blue-50" : "border-gray-300 bg-white"
                      }`}
                    >
                      <h3 className="font-bold text-[#012840] mb-1">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-6 space-y-4">
                <h3 className="font-bold text-[#012840] mb-3">
                  <FontAwesomeIcon icon={faTruck} className="mr-2" />
                  Dirección de recogida
                </h3>
                <p className="text-sm text-gray-600 mb-4">Ingresa la dirección donde recogeremos tu ropa.</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Ej: Av. Principal 123"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Colonia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pickupNeighborhood}
                    onChange={(e) => setPickupNeighborhood(e.target.value)}
                    placeholder="Nombre de la colonia"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Referencias adicionales</label>
                  <input
                    type="text"
                    value={pickupReference}
                    onChange={(e) => setPickupReference(e.target.value)}
                    placeholder="Casa color azul, portón negro, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                </div>
              </div>

              {deliveryMethod === "pickup" && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-bold text-[#012840] mb-2">
                    <FontAwesomeIcon icon={faBox} className="mr-2" />
                    Recoger en Local
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tu ropa será lavada y la podrás recoger en la lavandería seleccionada. Recibirás una notificación
                    cuando esté lista.
                  </p>
                </div>
              )}

              {deliveryMethod === "home" && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-[#012840] mb-2">
                    <FontAwesomeIcon icon={faTruck} className="mr-2" />
                    Entrega a Domicilio
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tu ropa será lavada y entregada en la misma dirección de recogida. Sin costo adicional.
                  </p>
                </div>
              )}

              {/* Pickup Time */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-2" />
                  Horario de recogida de tu ropa
                </label>
                <p className="text-sm text-gray-600 mb-3">Selecciona el horario en que pasaremos por tu ropa</p>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                >
                  <option>8:00 - 10:00 AM</option>
                  <option>10:00 - 12:00 PM</option>
                  <option>12:00 - 2:00 PM</option>
                  <option>2:00 - 4:00 PM</option>
                  <option>4:00 - 6:00 PM</option>
                </select>
              </div>

              {/* Discount Code */}
              <div className="bg-white rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código de descuento</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Ingrese el código"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#012840]"
                  />
                  <Button onClick={handleApplyCoupon} className="bg-[#012840] text-white hover:bg-[#0a1a2e]">
                    Aplicar
                  </Button>
                </div>
                {discountApplied && (
                  <p className={`mt-2 text-sm ${discountApplied.valid ? "text-green-600" : "text-red-600"}`}>
                    {discountApplied.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-[#012840]">${calculatePricing().subtotal}</span>
                  </div>
                  {Number.parseFloat(calculatePricing().pickupDiscount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento por recogida (10%)</span>
                      <span>-${calculatePricing().pickupDiscount}</span>
                    </div>
                  )}
                  {discountApplied?.valid && Number.parseFloat(calculatePricing().couponDiscount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Cupón ({discountCode})</span>
                      <span>-${calculatePricing().couponDiscount}</span>
                    </div>
                  )}
                  {Number.parseFloat(calculatePricing().totalDiscount) > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-green-600 pt-2 border-t">
                      <span>Total Descuentos</span>
                      <span>-${calculatePricing().totalDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[#012840] pt-3 border-t-2">
                    <span>Total a Pagar</span>
                    <span>${calculatePricing().total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {showSummary && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-[#012840] mb-4">
                <FontAwesomeIcon icon={faFileInvoice} className="mr-2" />
                Resumen de tu Pedido
              </h2>

              <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
                {/* Service Summary */}
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-[#012840] mb-2">Servicio</h3>
                  <div className="flex justify-between text-sm">
                    <span>{selectedService?.name}</span>
                    <span className="font-semibold">${selectedService?.price_per_kg}/kg</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Peso: {weight} kg</span>
                    <span>${calculatePricing().basePrice}</span>
                  </div>
                </div>

                {/* Laundry Info */}
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-[#012840] mb-2">Lavandería</h3>
                  <p className="text-sm">{laundries.find((l) => l.id === selectedLaundry)?.nombre}</p>
                </div>

                {/* Extras */}
                {extras.length > 0 && (
                  <div className="pb-4 border-b">
                    <h3 className="font-semibold text-[#012840] mb-2">Servicios Extras</h3>
                    {extras.map((extra, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{extra.name}</span>
                        <span>${Number.parseFloat(extra.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivery Method */}
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-[#012840] mb-2">Método de Entrega</h3>
                  <p className="text-sm">{deliveryMethod === "home" ? "Entrega a domicilio" : "Recoger en local"}</p>
                  {deliveryMethod === "home" && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p>{pickupAddress}</p>
                      <p>{pickupNeighborhood}</p>
                      <p>Horario: {pickupTime}</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${calculatePricing().subtotal}</span>
                  </div>

                  {Number.parseFloat(calculatePricing().pickupDiscount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento por recogida (10%)</span>
                      <span>-${calculatePricing().pickupDiscount}</span>
                    </div>
                  )}

                  {discountApplied?.valid && Number.parseFloat(calculatePricing().couponDiscount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Cupón ({discountCode})</span>
                      <span>-${calculatePricing().couponDiscount}</span>
                    </div>
                  )}

                  {Number.parseFloat(calculatePricing().totalDiscount) > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-green-600 pt-2 border-t">
                      <span>Total Descuentos</span>
                      <span>-${calculatePricing().totalDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold text-[#012840] pt-3 border-t-2">
                    <span>Total a Pagar</span>
                    <span>${calculatePricing().total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation Buttons */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          {(step > 1 || showSummary) && (
            <Button
              onClick={() => {
                if (showSummary) {
                  setShowSummary(false)
                } else {
                  setStep(step - 1)
                }
              }}
              variant="outline"
              className="flex-1 text-[#012840] border-2 border-[#012840] hover:bg-[#012840] hover:text-white font-semibold py-6 text-lg transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Atrás
            </Button>
          )}

          {!showSummary && step < 4 && (
            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-6 text-lg shadow-md transition-all"
            >
              Continuar
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Button>
          )}

          {!showSummary && step === 4 && (
            <Button
              onClick={() => setShowSummary(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-6 text-lg shadow-md transition-all"
            >
              Ver Resumen
              <FontAwesomeIcon icon={faEye} className="ml-2" />
            </Button>
          )}

          {showSummary && (
            <Button
              onClick={handleCreateOrder}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 text-lg shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                  Proceder al Pago
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
