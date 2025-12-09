'use client';

import Link from 'next/link';
import { FiPlay, FiLock, FiTarget, FiZap, FiAward, FiArrowRight, FiStar, FiLogIn, FiUserPlus } from 'react-icons/fi';
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
            La plataforma más segura para participar en sorteos online y ganar increíbles premios
          </p>
          <div className={styles.heroCTA}>
            <Link href="/sorteos">
              <button className={styles.primaryButton}>
                <FiPlay className={styles.buttonIcon} />
                Explorar Sorteos
              </button>
            </Link>
            {!isAuthenticated && (
              <>
                <Link href="/register">
                  <button className={styles.secondaryButton}>
                    <FiUserPlus className={styles.buttonIcon} />
                    Registrarse
                  </button>
                </Link>
                <Link href="/login">
                  <button className={styles.loginButton}>
                    <FiLogIn className={styles.buttonIcon} />
                    Iniciar Sesión
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
          <div className={styles.heroIcon}>
            <FiStar />
          </div>
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
              Transacciones encriptadas y verificación de identidad para tu protección.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiTarget />
            </div>
            <h3 className={styles.featureTitle}>Transparente</h3>
            <p className={styles.featureText}>
              Resultados verificables y públicos. Cada sorteo es completamente aleatorio.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiZap />
            </div>
            <h3 className={styles.featureTitle}>Rápido y Fácil</h3>
            <p className={styles.featureText}>
              Compra tickets en segundos y participa en sorteos con un solo clic.
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
            <h3 className={styles.stepTitle}>Explora sorteos</h3>
            <p className={styles.stepText}>Navega por nuestro catálogo de sorteos activos</p>
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
            <h3 className={styles.stepTitle}>Espera el sorteo</h3>
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
              Explorar Sorteos
            </button>
          </Link>
          {!isAuthenticated && (
            <>
              <Link href="/register">
                <button className={styles.ctaSecondaryButton}>
                  <FiUserPlus className={styles.buttonIcon} />
                  Registrarse
                </button>
              </Link>
              <Link href="/login">
                <button className={styles.ctaLoginButton}>
                  <FiLogIn className={styles.buttonIcon} />
                  Iniciar Sesión
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

      {/* Footer CTA for Shops */}
      <section className={styles.shopsCTA}>
        <h2 className={styles.shopsCTATitle}>¿Eres una tienda?</h2>
        <p className={styles.shopsCTAText}>
          Crea sorteos y llega a miles de clientes potenciales. Aumenta tu visibilidad y ventas.
        </p>
        <Link href="/register">
          <button className={styles.shopsCTAButton}>Registra tu tienda</button>
        </Link>
      </section>
    </main>
  );
}