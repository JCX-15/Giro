import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GIRO - Lavandería a Domicilio",
  description:
    "Servicio profesional de lavandería a domicilio. Recogemos, lavamos, planchamos y entregamos tu ropa limpia en 12-48 horas.",
  generator: "v0.app",
  icons: {
    icon: "/images/imagen-circular-recortada.png",
  },
  themeColor: "#012840",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/images/imagen-circular-recortada.png" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
