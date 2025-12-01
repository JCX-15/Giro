"use client"

import { useEffect, useState, useCallback } from "react"

interface OrderUpdate {
  status: string
  message: string
  timestamp: string
  type: string
}

export function useOrderUpdates(orderId: number) {
  const [updates, setUpdates] = useState<OrderUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Set up polling for order updates (alternative to WebSocket)
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`/api/orders/${orderId}/status-history`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()

          // Convert history to updates
          const newUpdates = data.history.map((log: any) => ({
            status: log.new_status,
            message: `Estado cambió a ${log.new_status}`,
            timestamp: log.created_at,
            type: "status_change",
          }))

          setUpdates(newUpdates)
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error fetching updates:", error)
        setIsConnected(false)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [orderId])

  const sendNotification = useCallback(
    async (message: string, type: string) => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`/api/orders/${orderId}/notify-update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message,
            notificationType: type,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setUpdates((prev) => [
            ...prev,
            {
              status: data.notification.status,
              message,
              timestamp: data.notification.timestamp,
              type,
            },
          ])
        }
      } catch (error) {
        console.error("Error sending notification:", error)
      }
    },
    [orderId],
  )

  return { updates, isConnected, sendNotification }
}
