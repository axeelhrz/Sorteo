'use client';

import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiGlobe,
  FiLock,
  FiShoppingCart,
  FiAward,
  FiTruck,
  FiAlertCircle,
  FiEdit,
  FiX,
  FiBook,
  FiMail,
} from 'react-icons/fi';
import styles from '../legal.module.css';

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  items?: string[];
}

const sections: Section[] = [
  {
    id: 'aceptacion',
    number: '01',
    title: 'Aceptación de Términos',
    icon: <FiCheckCircle />,
    content: 'Al acceder y utilizar TIKETEA ONLINE, aceptas estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la plataforma.',
  },
  {
    id: 'descripcion',
    number: '02',
    title: 'Descripción del Servicio',
    icon: <FiGlobe />,
    content: 'TIKETEA es una plataforma tecnológica que facilita la publicación y gestión de oportunidades ofrecidas por terceros. No organiza sorteos, no vende productos y no actúa como comerciante final.',
  },
  {
    id: 'requisitos',
    number: '03',
    title: 'Requisitos de Uso',
    icon: <FiLock />,
    content: 'Para usar TIKETEA ONLINE, debes cumplir con los siguientes requisitos:',
    items: [
      'Debes tener al menos 18 años de edad',
      'Debes proporcionar información precisa y completa durante el registro',
      'Eres responsable de mantener la confidencialidad de tu contraseña',
      'No puedes usar la plataforma para actividades ilegales o fraudulentas',
      'No puedes interferir con el funcionamiento de la plataforma',
    ],
  },
  {
    id: 'compra',
    number: '04',
    title: 'Compra de Tickets',
    icon: <FiShoppingCart />,
    content: 'Al comprar tickets en TIKETEA ONLINE, aceptas los siguientes términos:',
    items: [
      'El precio del ticket es final y no reembolsable (excepto en casos especificados)',
      'Cada ticket te da una oportunidad igual de ganar',
      'El sorteo se ejecuta automáticamente cuando se venden todos los tickets',
      'Los resultados son criptográficamente verificables',
    ],
  },
  {
    id: 'sorteos',
    number: '05',
    title: 'Sorteos y Resultados',
    icon: <FiAward />,
    content: 'Los sorteos se ejecutan mediante un algoritmo criptográfico que selecciona aleatoriamente un ticket ganador. TIKETEA ONLINE no tiene control sobre quién gana. Los resultados son finales y vinculantes.',
  },
  {
    id: 'entrega',
    number: '06',
    title: 'Entrega de Premios',
    icon: <FiTruck />,
    content: 'Los organizadores tienen 30 días para entregar el premio después de que se ejecute el sorteo. TIKETEA ONLINE no es responsable de la entrega, pero garantiza que los organizadores cumplan o se toman acciones.',
  },
  {
    id: 'responsabilidad',
    number: '07',
    title: 'Limitación de Responsabilidad',
    icon: <FiAlertCircle />,
    content: 'TIKETEA ONLINE se proporciona "tal cual" sin garantías. No somos responsables por:',
    items: [
      'Pérdida de datos o información',
      'Daños indirectos o consecuentes',
      'Interrupciones del servicio',
      'Acciones de terceros',
    ],
  },
  {
    id: 'modificacion',
    number: '08',
    title: 'Modificación de Términos',
    icon: <FiEdit />,
    content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente. Tu uso continuado de la plataforma constituye aceptación de los términos modificados.',
  },
  {
    id: 'terminacion',
    number: '09',
    title: 'Terminación',
    icon: <FiX />,
    content: 'Podemos terminar tu acceso a la plataforma en cualquier momento si violas estos términos o por cualquier otra razón a nuestro criterio.',
  },
  {
    id: 'ley',
    number: '10',
    title: 'Ley Aplicable',
    icon: <FiBook />,
    content: 'Estos términos se rigen por las leyes de Perú. Cualquier disputa se resolverá en los tribunales de Lima, Perú.',
  },
  {
    id: 'contacto',
    number: '11',
    title: 'Contacto',
    icon: <FiMail />,
    content: 'Si tienes preguntas sobre estos términos, contáctanos en:',
    items: [
      'Email: support@tiketea.com',
      'Teléfono: +51 XXXXXXXXX',
      'WhatsApp: +51 XXXXXXXXX',
    ],
  },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('aceptacion');

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSection(section.getAttribute('data-section') || '');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTocClick = (id: string) => {
    setActiveSection(id);
    const element = document.querySelector(`[data-section="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Información Legal</span>
          <h1 className={styles.title}>Términos y Condiciones</h1>
          <p className={styles.lastUpdated}>
            Última actualización: {new Date().toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Table of Contents */}
        <aside className={styles.tableOfContents}>
          <h3 className={styles.tocTitle}>Contenido</h3>
          <ul className={styles.tocList}>
            {sections.map((section) => (
              <li key={section.id} className={styles.tocItem}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTocClick(section.id);
                  }}
                  className={`${styles.tocLink} ${
                    activeSection === section.id ? styles.active : ''
                  }`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <div className={styles.content}>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              data-section={section.id}
              className={styles.section}
            >
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>{section.icon}</div>
                <div className={styles.sectionTitleWrapper}>
                  <span className={styles.sectionNumber}>{section.number}</span>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                </div>
              </div>

              <p>{section.content}</p>

              {section.items && section.items.length > 0 && (
                <ul className={styles.list}>
                  {section.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}