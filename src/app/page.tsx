'use client';

import Link from 'next/link';
import { FiArrowRight, FiZap, FiDollarSign, FiShare2, FiTrendingUp, FiShield } from 'react-icons/fi';
import Logo from '@/components/Logo';
import Testimonials from '@/components/Testimonials';
import { useAuthStore } from '@/store/auth-store';
import styles from './home.module.css';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  return (
    <main className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Plataforma de oportunidades</span>
            
            <h1 className={styles.heroTitle}>
              Ganar nunca fue tan fácil
            </h1>
            
            <p className={styles.heroSubtitle}>
              Accede a oportunidades reales para obtener productos de alto valor con tickets de costo muy bajo.
            </p>
            
            <p className={styles.heroDescription}>
              En TIKETEA no compras productos ni participas en rifas. Adquieres oportunidades limitadas, donde tú decides cuántos tickets tomar y cuánto aumentar tus probabilidades.
            </p>
            
            <div className={styles.heroCTA}>
              <Link href="/sorteos" className={styles.primaryButton}>
                Explorar oportunidades
                <FiArrowRight className={styles.buttonIconRight} />
              </Link>
              <Link href="#como-funciona" className={styles.secondaryButton}>
                Cómo funciona
              </Link>
            </div>
          </div>

          <div className={styles.heroLogoContainer}>
            <Logo size="large" showText={false} imageSize={420} className={styles.heroLogo} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Ventajas</span>
          <h2 className={styles.sectionTitle}>¿Por qué elegirnos?</h2>
          <p className={styles.sectionSubtitle}>
            No es una lotería. Son oportunidades reales con probabilidades que tú controlas.
          </p>
        </div>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiShield />
            </div>
            <h3 className={styles.featureTitle}>Transparente y claro</h3>
            <p className={styles.featureText}>
              Cada oportunidad muestra su producto, valor y número total de tickets desde el inicio. Sin letras pequeñas.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiTrendingUp />
            </div>
            <h3 className={styles.featureTitle}>Más probabilidades reales</h3>
            <p className={styles.featureText}>
              Los tickets son limitados, no infinitos como en una lotería. Menos participantes, más chances de ganar.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiZap />
            </div>
            <h3 className={styles.featureTitle}>Tú decides cuánto participar</h3>
            <p className={styles.featureText}>
              Puedes adquirir uno o varios tickets y aumentar tus probabilidades según tu decisión.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FiDollarSign />
            </div>
            <h3 className={styles.featureTitle}>Bajo costo, alto valor</h3>
            <p className={styles.featureText}>
              Accede a productos de alto valor invirtiendo montos mínimos por ticket.
            </p>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className={styles.shareSection}>
        <div className={styles.shareSectionContent}>
          <div className={styles.shareIcon}>
            <FiShare2 />
          </div>
          <h3 className={styles.shareTitle}>
            ¿Quieres que tu oportunidad se ejecute más rápido?
          </h3>
          <p className={styles.shareText}>
            Compártela con tus amigos y familia. Cada persona que participa acerca el momento en que se completan los tickets. Tú tienes el poder de acelerar lo que puede pasar.
          </p>
          <div className={styles.shareHighlight}>
            <FiZap className={styles.shareHighlightIcon} />
            <span>Tickets limitados = Resultado más rápido cuando se completan</span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* How It Works Section */}
      <section id="como-funciona" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Proceso simple</span>
          <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
          <p className={styles.sectionSubtitle}>
            Participa en 4 pasos simples y aumenta tus probabilidades de ganar
          </p>
        </div>
        
        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>01</div>
            <h3 className={styles.stepTitle}>Explora oportunidades</h3>
            <p className={styles.stepText}>
              Revisa los productos disponibles y cuántos tickets tiene cada oportunidad.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>02</div>
            <h3 className={styles.stepTitle}>Adquiere tus tickets</h3>
            <p className={styles.stepText}>
              Cada ticket representa una oportunidad real. Puedes adquirir más de uno si deseas aumentar tus probabilidades.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>03</div>
            <h3 className={styles.stepTitle}>Comparte y acelera</h3>
            <p className={styles.stepText}>
              Las oportunidades tienen tickets limitados. Cuando se completan, el proceso avanza. Compartir ayuda a que se active más rápido.
            </p>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>04</div>
            <h3 className={styles.stepTitle}>Resultado</h3>
            <p className={styles.stepText}>
              Una vez completadas las oportunidades, el resultado se define de forma automática, clara y verificable. Si eres el ganador, recibe tu premio.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Comienza a ganar hoy
          </h2>
          <p className={styles.ctaText}>
            Únete a miles de usuarios que ya están aprovechando oportunidades únicas
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/sorteos" className={styles.ctaPrimaryButton}>
              Ver oportunidades
              <FiArrowRight className={styles.buttonIconRight} />
            </Link>
            {!isAuthenticated && (
              <Link href="/register" className={styles.ctaSecondaryButton}>
                Crear cuenta gratis
              </Link>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}