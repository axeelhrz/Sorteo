'use client';

import Link from 'next/link';
import { FiPlay, FiLock, FiTarget, FiZap, FiAward, FiArrowRight, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Logo from '@/components/Logo';
import { useAuthStore } from '@/store/auth-store';
import styles from './home.module.css';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Logo size="large" className={styles.heroLogo} />
          <h1 className={styles.heroTitle}>Bienvenido a TIKETEA ONLINE</h1>
          <p className={styles.heroSubtitle}>
            La plataforma más segura para participar online y ganar increíbles premios
          </p>
          <div className={styles.heroCTA}>
            <Link href="/sorteos">
              <button className={styles.primaryButton}>
                <FiPlay className={styles.buttonIcon} />
                Explorar Oportunidades
              </button>
            </Link>
            {!isAuthenticated && (
              <>
                <Link href="/login">
                  <button className={styles.loginButton}>
                    <FiLogIn className={styles.buttonIcon} />
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className={styles.secondaryButton}>
                    <FiUserPlus className={styles.buttonIcon} />
                    Registrarse
                  </button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link href="/dashboard">
                <button className={styles.secondaryButton}>
                  Ir a mi Cuenta
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroImage}>
          <Logo size="large" showText={false} imageSize={200} className={styles.heroIcon} />
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>¿Por qué elegirnos?</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiLock />
            </div>
            <h3 className={styles.featureTitle}>100% Seguro</h3>
            <p className={styles.featureText}>
              Resultados verificables y públicos. El ticket ganador es completamente aleatorio.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiTarget />
            </div>
            <h3 className={styles.featureTitle}>Transparente</h3>
            <p className={styles.featureText}>
              Resultados verificables y públicos. El ticket ganador es completamente aleatorio.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiZap />
            </div>
            <h3 className={styles.featureTitle}>Rápido y Fácil</h3>
            <p className={styles.featureText}>
              Compra tickets en segundos y participa con un solo clic.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiAward />
            </div>
            <h3 className={styles.featureTitle}>Premios Reales</h3>
            <p className={styles.featureText}>
              Gana productos de verdaderas tiendas verificadas con garantía de entrega.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <h2 className={styles.howItWorksTitle}>Cómo funciona</h2>
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Explora oportunidades</h3>
            <p className={styles.stepText}>Navega por nuestro catálogo de oportunidades activas</p>
          </div>
          <div className={styles.arrow}>
            <FiArrowRight />
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Compra tickets</h3>
            <p className={styles.stepText}>Elige cuántos tickets deseas comprar</p>
          </div>
          <div className={styles.arrow}>
            <FiArrowRight />
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>Espera el resultado</h3>
            <p className={styles.stepText}>Cuando se venden todos, se ejecuta automáticamente</p>
          </div>
          <div className={styles.arrow}>
            <FiArrowRight />
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <h3 className={styles.stepTitle}>¡Gana!</h3>
            <p className={styles.stepText}>Si eres el ganador, recibe tu premio</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>¿Listo para participar?</h2>
        <p className={styles.ctaText}>
          Únete a miles de usuarios que ya están ganando premios increíbles
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/sorteos">
            <button className={styles.ctaPrimaryButton}>
              <FiPlay className={styles.buttonIcon} />
              Explorar Oportunidades
            </button>
          </Link>
          {!isAuthenticated && (
            <>
              <Link href="/login">
                <button className={styles.ctaLoginButton}>
                  <FiLogIn className={styles.buttonIcon} />
                  Iniciar Sesión
                </button>
              </Link>
              <Link href="/register">
                <button className={styles.ctaSecondaryButton}>
                  <FiUserPlus className={styles.buttonIcon} />
                  Registrarse
                </button>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link href="/dashboard">
              <button className={styles.ctaSecondaryButton}>
                Ir a mi Cuenta
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* FAQs Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Preguntas Frecuentes</h2>
        <p className={styles.faqSubtitle}>Encuentra respuestas a las preguntas más comunes</p>
        <div className={styles.faqGrid}>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Qué es TIKETEA ONLINE?</h3>
            <p className={styles.faqCardText}>
              TIKETEA ONLINE es una plataforma digital que conecta tiendas con usuarios para participar en oportunidades de compra de productos mediante un sistema de tickets.
            </p>
          </div>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Cómo participo en una oportunidad?</h3>
            <p className={styles.faqCardText}>
              Regístrate, explora las oportunidades disponibles, selecciona una, compra tickets, realiza el pago y espera a que se ejecute el sorteo.
            </p>
          </div>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Es seguro usar TIKETEA ONLINE?</h3>
            <p className={styles.faqCardText}>
              Sí, utilizamos encriptación HTTPS, procesamiento seguro de pagos y verificación de identidad. Todos los sorteos son criptográficamente verificables.
            </p>
          </div>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Cuáles son mis probabilidades de ganar?</h3>
            <p className={styles.faqCardText}>
              Tus probabilidades son iguales al número de tickets que compres dividido entre el número total de tickets vendidos.
            </p>
          </div>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Qué métodos de pago aceptan?</h3>
            <p className={styles.faqCardText}>
              Aceptamos tarjetas de crédito, débito, billeteras digitales (Yape, Plin) y transferencias bancarias.
            </p>
          </div>
          <div className={styles.faqCard}>
            <h3 className={styles.faqCardTitle}>¿Cuándo recibiré mi premio si gano?</h3>
            <p className={styles.faqCardText}>
              La tienda tiene 30 días para entregar el premio después de que se ejecute la oportunidad. Te contactarán para coordinar.
            </p>
          </div>
        </div>
        <div className={styles.faqCTA}>
          <p className={styles.faqCTAText}>¿Tienes más preguntas?</p>
          <Link href="/faq">
            <button className={styles.faqCTAButton}>Ver todas las FAQs</button>
          </Link>
        </div>
      </section>

      {/* Footer CTA for Shops */}
      <section className={styles.shopsCTA}>
        <h2 className={styles.shopsCTATitle}>¿Eres una tienda?</h2>
        <p className={styles.shopsCTAText}>
          Crea oportunidades y llega a miles de clientes potenciales. Aumenta tu visibilidad y ventas.
        </p>
        <Link href="/register">
          <button className={styles.shopsCTAButton}>Registra tu tienda</button>
        </Link>
      </section>

      {/* WhatsApp Contact Button */}
      <a
        href="https://wa.me/51XXXXXXXXX?text=Hola%20👋%20TIKETEA%20ONLINE%0A%0AMe%20gustaría%20conocer%20más%20sobre%20cómo%20funciona%20la%20plataforma%20y%20participar%20en%20las%20oportunidades.%0A%0A¿Podrían%20ayudarme%20con%20más%20información%3F"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappButton}
      >
        <FaWhatsapp className={styles.whatsappIcon} />
        <span>Contactar por WhatsApp</span>
      </a>
    </main>
  );
}