'use client';

import { FiTarget, FiTag, FiPlay, FiAward } from 'react-icons/fi';
import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Elegís el sorteo',
      description: 'Explora nuestro catálogo y elige el sorteo que te interesa.',
      icon: FiTarget,
    },
    {
      number: 2,
      title: 'Comprás tickets',
      description: 'Adquiere la cantidad de tickets que desees. Cada ticket es una participación.',
      icon: FiTag,
    },
    {
      number: 3,
      title: 'Se realiza el sorteo',
      description: 'Cuando se venden todos los tickets, se ejecuta el sorteo automáticamente.',
      icon: FiPlay,
    },
    {
      number: 4,
      title: 'Se publica el ganador',
      description: 'El ticket ganador se elige de forma aleatoria y se publica en la plataforma.',
      icon: FiAward,
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>¿Cómo funciona este sorteo?</h2>
        <p className={styles.subtitle}>
          Entendé el mecanismo en 4 pasos simples
        </p>
      </div>

      <div className={styles.stepsContainer}>
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepIcon}>
                <IconComponent />
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>
                  Paso {step.number}: {step.title}
                </h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className={styles.connector} />}
            </div>
          );
        })}
      </div>

      <div className={styles.infoBox}>
        <h3 className={styles.infoTitle}>Información importante</h3>
        <ul className={styles.infoList}>
          <li>Cada ticket representa una participación en el sorteo.</li>
          <li>El ganador se elige de forma completamente aleatoria.</li>
          <li>El resultado es transparente y verificable.</li>
          <li>El ganador será notificado por email inmediatamente.</li>
          <li>Todos los sorteos cumplen con la normativa vigente.</li>
        </ul>
      </div>
    </section>
  );
}