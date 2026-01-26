'use client';

import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import styles from './testimonials.module.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    role: 'Usuario desde hace 6 meses',
    avatar: '👨‍💼',
    content: 'TIKETEA cambió mi forma de ver las oportunidades. Gané un laptop de $1500 con solo $50 invertidos. ¡Increíble!',
    rating: 5,
  },
  {
    id: 2,
    name: 'María García',
    role: 'Ganadora de 3 premios',
    avatar: '👩‍🎓',
    content: 'La plataforma es muy transparente y segura. He ganado múltiples veces y siempre recibí mis premios sin problemas.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Juan Rodríguez',
    role: 'Organizador activo',
    avatar: '👨‍💻',
    content: 'Como organizador, TIKETEA me ayudó a vender 500 productos en 2 meses. La plataforma es muy eficiente.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Ana López',
    role: 'Usuario frecuente',
    avatar: '👩‍🔬',
    content: 'Me encanta que pueda controlar cuántos tickets comprar. Las probabilidades son reales y justas.',
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.tag}>💬 Testimonios</span>
          <h2 className={styles.title}>Lo que dicen nuestros usuarios</h2>
          <p className={styles.subtitle}>
            Miles de usuarios confían en TIKETEA para sus oportunidades
          </p>
        </div>

        <div className={styles.carousel}>
          <div className={styles.carouselTrack}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
              >
                <div className={styles.card}>
                  <div className={styles.rating}>
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <FiStar key={i} className={styles.star} />
                    ))}
                  </div>

                  <p className={styles.content}>{testimonial.content}</p>

                  <div className={styles.author}>
                    <div className={styles.avatar}>{testimonial.avatar}</div>
                    <div className={styles.info}>
                      <div className={styles.name}>{testimonial.name}</div>
                      <div className={styles.role}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Anterior"
          >
            <FiChevronLeft />
          </button>

          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Siguiente"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir al testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;