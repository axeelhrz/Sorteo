'use client';

import { FiSearch, FiShoppingCart, FiZap, FiTrendingUp } from 'react-icons/fi';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Explora',
      description: 'Descubre oportunidades únicas en nuestro catálogo curado',
      icon: FiSearch,
    },
    {
      number: '02',
      title: 'Participa',
      description: 'Adquiere tickets y aumenta tus probabilidades de ganar',
      icon: FiShoppingCart,
    },
    {
      number: '03',
      title: 'Sorteo',
      description: 'El sistema ejecuta el sorteo automáticamente al completarse',
      icon: FiZap,
    },
    {
      number: '04',
      title: 'Gana',
      description: 'El ganador se elige aleatoriamente y recibe notificación',
      icon: FiTrendingUp,
    },
  ];

  const features = [
    'Sistema de selección completamente aleatorio',
    'Resultados transparentes y verificables',
    'Notificación inmediata por email',
    'Cumplimiento normativo garantizado',
  ];

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Proceso</span>
          <h2 className={styles.title}>Cómo funciona</h2>
          <p className={styles.subtitle}>
            Un proceso simple y transparente en 4 pasos
          </p>
        </div>

        {/* Steps Grid */}
        <div className={styles.stepsGrid}>
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepIconWrapper}>
                  <IconComponent className={styles.stepIcon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Features List */}
        <div className={styles.featuresSection}>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureCheck}>✓</div>
                <span className={styles.featureText}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}