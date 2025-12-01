"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark-mode")
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove("dark-mode")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.classList.add("dark-mode")
      localStorage.setItem("theme", "dark")
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: #012840;
          --primary-light: #0368A6;
          --white: #ffffff;
          --light-bg: #fdfdfd;
          --text-dark: #1a1a1a;
          --text-light: #666666;
          --accent-green: #28a745;
        }

        html.dark-mode {
          --white: #1a1a1a;
          --light-bg: #0d0d0d;
          --text-dark: #ffffff;
          --text-light: #b0b0b0;
        }

        body {
          font-family: 'ITC Avant Garde Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--text-dark);
          background-color: var(--white);
          line-height: 1.6;
          transition: background-color 0.3s ease, color 0.3s ease;
          overflow-x: hidden;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: var(--white);
          padding: 1rem 2rem;
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          animation: fadeInDown 0.6s ease;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          text-decoration: none;
          color: var(--white);
          animation: slideInRight 0.6s ease;
        }

        .logo-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .nav {
          display: flex;
          gap: 2.5rem;
          align-items: center;
          flex: 1;
          justify-content: center;
        }

        .nav a {
          color: var(--white);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: opacity 0.3s ease;
          position: relative;
        }

        .nav a::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--white);
          transition: width 0.3s ease;
        }

        .nav a:hover::after {
          width: 100%;
        }

        .btn-login {
          background: transparent;
          border: 2px solid var(--white);
          color: var(--white);
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-login:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .theme-toggle, .mobile-menu-toggle {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: var(--white);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          display: none;
        }

        .theme-toggle:hover, .mobile-menu-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .hero {
          margin-top: 80px;
          padding: 5rem 2rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: var(--white);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -5%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite reverse;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          animation: fadeInUp 0.8s ease;
        }

        .hero h1 {
          font-size: clamp(2.2rem, 8vw, 3.2rem);
          font-weight: bold;
          margin-bottom: 1.5rem;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .hero p {
          font-size: clamp(0.95rem, 2.5vw, 1.1rem);
          margin-bottom: 2.5rem;
          opacity: 0.95;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-hero-primary, .btn-hero-secondary {
          padding: 0.9rem 2.2rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          cursor: pointer;
          font-size: 0.95rem;
          display: inline-block;
        }

        .btn-hero-primary {
          background: var(--white);
          color: var(--primary);
        }

        .btn-hero-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .btn-hero-secondary {
          background: transparent;
          color: var(--white);
          border-color: var(--white);
        }

        .btn-hero-secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-3px);
        }

        .why-choose {
          padding: 4rem 2rem;
          background-color: var(--white);
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          text-align: center;
          font-size: clamp(1.8rem, 5vw, 2.3rem);
          margin-bottom: 0.8rem;
          color: var(--text-dark);
          font-weight: bold;
          animation: fadeInUp 0.6s ease;
        }

        .section-subtitle {
          text-align: center;
          color: var(--text-light);
          margin-bottom: 3rem;
          font-size: clamp(0.9rem, 2vw, 1rem);
          animation: fadeInUp 0.7s ease;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .why-card {
          background: var(--light-bg);
          padding: 2.5rem;
          border-radius: 15px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          animation: fadeInUp 0.6s ease;
        }

        html.dark-mode .why-card {
          background: #1a1a1a;
          border-color: #333;
        }

        .why-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(1, 40, 64, 0.1);
          border-color: var(--primary-light);
        }

        .why-icon {
          width: 70px;
          height: 70px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--white);
        }

        .why-card h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: var(--text-dark);
          font-weight: 700;
        }

        .why-card p {
          color: var(--text-light);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .how-works {
          padding: 4rem 2rem;
          background-color: var(--white);
          max-width: 1400px;
          margin: 0 auto;
        }

        .steps-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .step-item {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          align-items: flex-start;
          animation: fadeInUp 0.6s ease;
          position: relative;
        }

        .step-number {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: var(--white);
          flex-shrink: 0;
          box-shadow: 0 8px 20px rgba(1, 40, 64, 0.2);
        }

        .step-content h3 {
          font-size: 1.3rem;
          margin-bottom: 0.8rem;
          color: var(--text-dark);
          font-weight: 700;
        }

        .step-content p {
          color: var(--text-light);
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .step-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 40px;
          top: 80px;
          width: 2px;
          height: 80px;
          background: linear-gradient(180deg, var(--primary-light) 0%, rgba(3, 104, 166, 0.3) 100%);
        }

        .pricing {
          padding: 4rem 2rem;
          background-color: var(--white);
          max-width: 1400px;
          margin: 0 auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .pricing-card {
          background: var(--light-bg);
          padding: 2.5rem;
          border-radius: 15px;
          text-align: center;
          position: relative;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          animation: fadeInUp 0.6s ease;
        }

        html.dark-mode .pricing-card {
          background: #1a1a1a;
        }

        .pricing-card.featured {
          border: 2px solid var(--primary-light);
          box-shadow: 0 20px 50px rgba(1, 40, 64, 0.15);
          transform: scale(1.05);
        }

        .pricing-card:hover:not(.featured) {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(1, 40, 64, 0.1);
        }

        .pricing-badge {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: var(--white);
          padding: 0.5rem 1.2rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .pricing-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.8rem;
          color: var(--text-dark);
        }

        .pricing-price {
          font-size: 2.2rem;
          font-weight: bold;
          color: var(--primary);
          margin: 1rem 0;
        }

        .pricing-price sup {
          font-size: 0.6em;
          color: var(--text-light);
        }

        .pricing-features {
          list-style: none;
          margin: 2rem 0;
          text-align: left;
        }

        .pricing-features li {
          padding: 0.7rem 0;
          border-bottom: 1px solid rgba(1, 40, 64, 0.1);
          color: var(--text-light);
          font-size: 0.9rem;
        }

        html.dark-mode .pricing-features li {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .pricing-features li::before {
          content: '✓ ';
          color: var(--accent-green);
          font-weight: bold;
          margin-right: 0.8rem;
        }

        .btn-pricing {
          width: 100%;
          background: var(--primary);
          color: var(--white);
          border: none;
          padding: 1rem;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 2rem;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .btn-pricing:hover {
          background: var(--primary-light);
          transform: translateY(-2px);
        }

        .cta {
          padding: 4rem 2rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          color: var(--white);
          text-align: center;
        }

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta h2 {
          font-size: clamp(1.8rem, 5vw, 2.5rem);
          margin-bottom: 1rem;
          font-weight: bold;
          animation: fadeInUp 0.6s ease;
        }

        .cta p {
          font-size: 1rem;
          margin-bottom: 2rem;
          opacity: 0.95;
          animation: fadeInUp 0.7s ease;
        }

        .btn-cta {
          background: var(--white);
          color: var(--primary);
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          display: inline-block;
        }

        .btn-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        footer {
          background-color: var(--primary);
          color: var(--white);
          padding: 3rem 2rem;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          font-weight: 700;
        }

        .footer-section a {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-section a:hover {
          color: var(--white);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .footer-socials {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .social-icon {
          width: 35px;
          height: 35px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 1rem;
        }

        .social-icon:hover {
          background: var(--white);
          color: var(--primary);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 2rem;
          text-align: center;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .mobile-nav {
          display: none;
          position: fixed;
          left: 0;
          top: 80px;
          width: 100%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
          flex-direction: column;
          gap: 1rem;
          padding: 2rem;
          animation: slideInRight 0.3s ease;
          z-index: 999;
        }

        .mobile-nav.active {
          display: flex;
        }

        .mobile-nav a {
          color: var(--white);
          text-decoration: none;
          padding: 0.8rem 0;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .nav {
            display: none;
          }

          .btn-login {
            display: none;
          }

          .theme-toggle, .mobile-menu-toggle {
            display: block;
          }

          .hero {
            padding: 2.5rem 1rem;
            margin-top: 70px;
          }

          .why-choose, .how-works, .pricing, .cta {
            padding: 2.5rem 1rem;
          }

          .why-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .step-item {
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .step-number {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn-hero-primary, .btn-hero-secondary {
            width: 100%;
            max-width: 300px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .pricing-card.featured {
            transform: scale(1);
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 0.8rem 1rem;
          }

          .logo {
            font-size: 1.2rem;
          }

          .logo-img {
            width: 30px;
            height: 30px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .section-subtitle {
            font-size: 0.85rem;
          }

          .why-grid {
            grid-template-columns: 1fr;
            gap: 1.2rem;
          }

          .why-card {
            padding: 1.5rem;
          }

          .step-number {
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }

          .step-item {
            gap: 1rem;
          }

          .step-item:not(:last-child)::after {
            left: 25px;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link href="/" className="logo">
            <img src="/images/imagen-circular-recortada.png" alt="GIRO Logo" className="logo-img" />
            GIRO
          </Link>

          <nav className="nav">
            <a href="#servicios">Servicios</a>
            <a href="#como-funciona">Cómo Funciona</a>
            <a href="#precios">Precios</a>
          </nav>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <Link href="/login" className="btn-login">
              Iniciar Sesión
            </Link>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              ☰
            </button>
          </div>
        </div>

        <nav className={`mobile-nav ${isMobileMenuOpen ? "active" : ""}`}>
          <a href="#servicios" onClick={() => setIsMobileMenuOpen(false)}>
            Servicios
          </a>
          <a href="#como-funciona" onClick={() => setIsMobileMenuOpen(false)}>
            Cómo Funciona
          </a>
          <a href="#precios" onClick={() => setIsMobileMenuOpen(false)}>
            Precios
          </a>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Lavandería a Domicilio en Minutos</h1>
          <p>Recogemos, lavamos, planchamos y entregamos tu ropa. Tu solo relájate y disfruta de más tiempo libre.</p>
          <div className="hero-buttons">
            <Link href="/dashboard" className="btn-hero-primary">
              Solicitar Servicio
            </Link>
            <a href="#como-funciona" className="btn-hero-secondary">
              Ver Cómo Funciona
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose GIRO */}
      <section className="why-choose" id="servicios">
        <h2 className="section-title">¿Por Qué Elegir GIRO?</h2>
        <p className="section-subtitle">
          Ofrecemos el mejor servicio de lavandería con tecnología de punta y atención personalizada.
        </p>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-truck"></i>
            </div>
            <h3>Recogida a Domicilio</h3>
            <p>Solicita el servicio desde tu app e ingresa a tu hogar a recoger tu ropa.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <h3>Servicio Express</h3>
            <p>Lavado, secado y planchado profesional en el menor tiempo posible.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-star"></i>
            </div>
            <h3>Calidad Premium</h3>
            <p>Productos de alta calidad y proceso garantizado para cuidar tu ropa.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>App Intuitiva</h3>
            <p>Gestiona tus pedidos, rastreo en tiempo real y soporte disponible.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h3>Pago Seguro</h3>
            <p>Múltiples métodos de pago seguro y encriptado en tu aplicación.</p>
          </div>
          <div className="why-card">
            <div className="why-icon">
              <i className="fas fa-smile"></i>
            </div>
            <h3>Satisfacción Garantizada</h3>
            <p>Si no estás satisfecho, repetimos el servicio sin costo adicional.</p>
          </div>
        </div>
      </section>

      {/* How Works */}
      <section className="how-works" id="como-funciona">
        <h2 className="section-title">Cómo Funciona</h2>
        <p className="section-subtitle">Cuatro simples pasos para tener tu ropa impecable.</p>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Solicita el Servicio</h3>
              <p>
                Descarga app e ingresa a nuestra plataforma, selecciona el tipo de servicio que necesites y programa tu
                recogida en horarios disponibles.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Recogemos tu Ropa</h3>
              <p>
                Nuestro motorista llega a tu domicilio en el horario acordado para recoger la ropa. Facilidad una
                notificación cuando este camino.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Lavamos y Planchamos</h3>
              <p>
                Tu ropa será procesada por nuestros profesionales con productos de alta calidad. Puedo seguir el proceso
                desde tu aplicación.
              </p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Entregamos a Domicilio</h3>
              <p>
                Recibe tu ropa lista, limpia y planchada. Puedes elegir que la dejen en casa o pasar por nuestro local.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="precios">
        <h2 className="section-title">Planes y Precios</h2>
        <p className="section-subtitle">Elige el plan que se adapte a tus necesidades.</p>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-name">Básico</h3>
            <div className="pricing-price">
              $9.50<sup>/kg</sup>
            </div>
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Perfecto para uso ocasional
            </p>
            <ul className="pricing-features">
              <li>Lavado profesional</li>
              <li>Recogida a domicilio</li>
              <li>Entrega en 48 horas</li>
              <li>Atención al cliente</li>
            </ul>
            <Link href="/dashboard">
              <button className="btn-pricing">Solicitar Ahora</button>
            </Link>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">RECOMENDADO</div>
            <h3 className="pricing-name">Premium</h3>
            <div className="pricing-price">
              $12.00<sup>/kg</sup>
            </div>
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>El más solicitado</p>
            <ul className="pricing-features">
              <li>Lavado profesional</li>
              <li>Secado incluido</li>
              <li>Planchado premium</li>
              <li>Recogida y entrega</li>
              <li>Entrega en 24 horas</li>
              <li>Productos premium</li>
              <li>Soporte prioritario</li>
            </ul>
            <Link href="/dashboard">
              <button className="btn-pricing">Solicitar Ahora</button>
            </Link>
          </div>

          <div className="pricing-card">
            <h3 className="pricing-name">Express</h3>
            <div className="pricing-price">
              $17.00<sup>/kg</sup>
            </div>
            <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Para cuando tienes prisa
            </p>
            <ul className="pricing-features">
              <li>Todo lo de Premium</li>
              <li>Servicio prioritario</li>
              <li>Entrega en 12 horas</li>
              <li>Atención 24/7</li>
              <li>Seguimiento en tiempo real</li>
              <li>Soporte VIP</li>
            </ul>
            <Link href="/dashboard">
              <button className="btn-pricing">Solicitar Ahora</button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>¿Listo para Empezar?</h2>
          <p>Únete a miles de usuarios que ya disfrutan de más tiempo libre.</p>
          <Link href="/register" className="btn-cta">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src="/images/imagen-circular-recortada.png"
                alt="GIRO"
                style={{ width: "30px", height: "30px", borderRadius: "50%" }}
              />
              <strong>GIRO</strong>
            </div>
            <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>La forma más inteligente de mantener limpia tu ropa.</p>
            <div className="footer-socials">
              <div className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="social-icon">
                <i className="fab fa-twitter"></i>
              </div>
              <div className="social-icon">
                <i className="fab fa-instagram"></i>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h3>Servicios</h3>
            <a href="#">Lavado y Secado</a>
            <a href="#">Planchado Premium</a>
            <a href="#">Servicio Express</a>
            <a href="#">Limpieza Especial</a>
          </div>

          <div className="footer-section">
            <h3>Empresas</h3>
            <a href="#">Planes B2B</a>
            <a href="#">Soluciones Corporativas</a>
            <a href="#">Blog Empresas</a>
          </div>

          <div className="footer-section">
            <h3>Soporte</h3>
            <a href="#">Centro de Ayuda</a>
            <a href="#">Contacto</a>
            <a href="#">Privacidad</a>
            <a href="#">Términos de Uso</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 GIRO - Todos los derechos reservados</p>
        </div>
      </footer>
    </>
  )
}
