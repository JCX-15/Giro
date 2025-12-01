"use client"

import { useState, useEffect } from "react"

interface Notification {
  id: string
  title: string
  message: string
  type: "success" | "info" | "warning" | "error"
  timestamp: Date
  read: boolean
}

export function OrderNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for order status changes
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      const { orderId, status, message } = event.detail

      const notification: Notification = {
        id: `${orderId}-${Date.now()}`,
        title: `Pedido ${orderId}`,
        message: message || `Estado actualizado a: ${status}`,
        type: getNotificationType(status),
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 10000)
    }

    window.addEventListener("orderUpdate", handleOrderUpdate as EventListener)

    return () => {
      window.removeEventListener("orderUpdate", handleOrderUpdate as EventListener)
    }
  }, [])

  const getNotificationType = (status: string): "success" | "info" | "warning" | "error" => {
    if (status === "delivered" || status === "completed") return "success"
    if (status === "cancelled") return "error"
    if (status === "ready") return "warning"
    return "info"
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white font-semibold animate-slide-in ${
            notification.type === "success"
              ? "bg-green-600"
              : notification.type === "error"
                ? "bg-red-600"
                : notification.type === "warning"
                  ? "bg-yellow-600"
                  : "bg-blue-600"
          }`}
          onClick={() => markAsRead(notification.id)}
        >
          <p className="font-bold text-sm">{notification.title}</p>
          <p className="text-sm mt-1">{notification.message}</p>
        </div>
      ))}
    </div>
  )
}
