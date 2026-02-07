'use client';

import { useState } from 'react';
import { FiChevronDown, FiMail, FiMessageCircle } from 'react-icons/fi';
import styles from './faq.module.css';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  // General
  {
    id: '1',
    category: 'General',
    question: '¿Qué es TIKETEA ONLINE?',
    answer: 'TIKETEA ONLINE es una plataforma digital que conecta organizadores con usuarios para participar en oportunidades de compra de productos mediante un sistema de tickets. Los usuarios compran tickets y participan en un sorteo aleatorio para ganar el producto.'
  },
  {
    id: '2',
    category: 'General',
    question: '¿Es seguro usar TIKETEA ONLINE?',
    answer: 'Sí, TIKETEA ONLINE utiliza encriptación HTTPS, procesamiento seguro de pagos y verificación de identidad. Todos los sorteos son ejecutados por algoritmos criptográficos verificables y auditables.'
  },
  {
    id: '3',
    category: 'General',
    question: '¿Cuál es el costo de usar la plataforma?',
    answer: 'Para usuarios: No hay costo de registro. Solo pagas por los tickets que compres. Para organizadores: Se cobra una comisión del 10% sobre el monto total de tickets vendidos.'
  },
  {
    id: '4',
    category: 'General',
    question: '¿En qué países opera TIKETEA ONLINE?',
    answer: 'Actualmente operamos en Perú. Estamos expandiendo a otros países de Latinoamérica próximamente.'
  },

  // Participación
  {
    id: '5',
    category: 'Participación',
    question: '¿Cómo participo en una oportunidad?',
    answer: '1. Regístrate en la plataforma\n2. Explora las oportunidades disponibles\n3. Selecciona la que te interese\n4. Elige cuántos tickets deseas comprar\n5. Realiza el pago\n6. Espera a que se ejecute la oportunidad\n7. Si ganas, recibirás el premio'
  },
  {
    id: '6',
      category: 'Participación',
      question: '¿Cuál es el precio de cada ticket?',
      answer: 'El precio de cada ticket varía según la oportunidad y es establecido por el organizador. Puedes ver el precio antes de comprar. El precio del ticket se calcula automáticamente según el valor de ticket configurado por el organizador.'
    },
  {
    id: '7',
    category: 'Participación',
    question: '¿Puedo comprar múltiples tickets en la misma oportunidad?',
    answer: 'Sí, puedes comprar tantos tickets como desees en una oportunidad. Cada ticket que compres aumenta tus probabilidades de ganar.'
  },
  {
    id: '8',
    category: 'Participación',
    question: '¿Cuáles son mis probabilidades de ganar?',
    answer: 'Tus probabilidades de ganar son iguales al número de tickets que compres dividido entre el número total de tickets vendidos. Por ejemplo, si compras 5 tickets de 100 totales, tu probabilidad es 5/100 = 5%.'
  },
  {
    id: '9',
    category: 'Participación',
    question: '¿Cómo se ejecuta el sorteo?',
    answer: 'El sorteo se ejecuta automáticamente cuando se venden todos los tickets. Un algoritmo criptográfico selecciona aleatoriamente un ticket ganador. El resultado es verificable y auditable.'
  },
  {
    id: '10',
    category: 'Participación',
    question: '¿Qué pasa si no se venden todos los tickets?',
    answer: 'Si no se venden todos los tickets dentro del plazo establecido, la oportunidad se cancela y se reembolsa el 100% del dinero a todos los participantes.'
  },

  // Pagos y Reembolsos
  {
    id: '11',
    category: 'Pagos y Reembolsos',
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos: Tarjetas de crédito (Visa, Mastercard), Tarjetas de débito, Billeteras digitales (Yape, Plin), Transferencia bancaria.'
  },
  {
    id: '12',
    category: 'Pagos y Reembolsos',
    question: '¿Es seguro pagar en TIKETEA ONLINE?',
    answer: 'Sí, utilizamos procesadores de pago certificados y encriptación de nivel bancario. Nunca almacenamos datos de tarjeta en nuestros servidores.'
  },
  {
    id: '13',
    category: 'Pagos y Reembolsos',
    question: '¿Cuándo recibiré mi reembolso?',
    answer: 'Los reembolsos se procesan dentro de 5-7 días hábiles después de ser aprobados. El tiempo exacto depende de tu banco.'
  },
  {
    id: '14',
    category: 'Pagos y Reembolsos',
    question: '¿En qué casos me reembolsan?',
    answer: 'Se reembolsa en los siguientes casos:\n- El organizador cancela la oportunidad\n- Error técnico de la plataforma\n- Pago duplicado\n- Orden cancelada antes de ejecutarse'
  },
  {
    id: '15',
    category: 'Pagos y Reembolsos',
    question: '¿Se reembolsan los tickets ganadores?',
    answer: 'No, los tickets ganadores no se reembolsan bajo ninguna circunstancia. Al ganar, aceptas recibir el premio en lugar del dinero.'
  },

  // Premios y Entregas
  {
    id: '16',
    category: 'Premios y Entregas',
    question: '¿Cuándo recibiré mi premio si gano?',
    answer: 'El organizador tiene 30 días para entregar el premio después de que se ejecute la oportunidad. Recibirás instrucciones de entrega por email inmediatamente después de ganar.'
  },
  {
    id: '17',
    category: 'Premios y Entregas',
    question: '¿Cómo se entrega el premio?',
    answer: 'El organizador coordina directamente contigo para la entrega. Puede ser por:\n- Recojo en local\n- Envío a domicilio\n- Envío por courier\nEl organizador te contactará para coordinar.'
  },
  {
    id: '18',
    category: 'Premios y Entregas',
    question: '¿Qué pasa si el organizador no entrega el premio?',
    answer: 'Si el organizador no entrega el premio dentro de 30 días, puedes reportarlo a nuestro equipo de soporte. Investigaremos y tomaremos acciones, incluyendo bloqueo del organizador y reembolso si es necesario.'
  },
  {
    id: '19',
    category: 'Premios y Entregas',
    question: '¿Puedo cambiar el premio por dinero?',
    answer: 'No, los premios no se pueden cambiar por dinero. Sin embargo, puedes coordinar directamente con el organizador para negociar alternativas.'
  },
  {
    id: '20',
    category: 'Premios y Entregas',
    question: '¿Qué pasa si el premio llega dañado?',
    answer: 'Si el premio llega dañado, debes reportarlo al organizador dentro de 48 horas con fotos. El organizador es responsable de reemplazarlo o reembolsarte.'
  },

  // Cuenta y Seguridad
  {
    id: '21',
    category: 'Cuenta y Seguridad',
    question: '¿Cómo creo una cuenta?',
    answer: 'Haz clic en "Registrarse" en la página principal, completa el formulario con tus datos y verifica tu email. ¡Listo! Ya puedes participar en oportunidades.'
  },
  {
    id: '22',
    category: 'Cuenta y Seguridad',
    question: '¿Olvidé mi contraseña, qué hago?',
    answer: 'Haz clic en "Olvidé mi contraseña" en la página de login, ingresa tu email y recibirás un enlace para resetear tu contraseña.'
  },
  {
    id: '23',
    category: 'Cuenta y Seguridad',
    question: '¿Cómo cambio mi información personal?',
    answer: 'Ve a tu perfil, haz clic en "Editar perfil" y actualiza la información que desees cambiar. Guarda los cambios.'
  },
  {
    id: '24',
    category: 'Cuenta y Seguridad',
    question: '¿Cómo elimino mi cuenta?',
    answer: 'Ve a Configuración > Privacidad > Eliminar cuenta. Ten en cuenta que esto es irreversible y perderás acceso a tu historial.'
  },
  {
    id: '25',
    category: 'Cuenta y Seguridad',
    question: '¿Cómo protejo mi cuenta?',
    answer: 'Usa una contraseña fuerte, no la compartas con nadie, habilita autenticación de dos factores si está disponible, y no hagas clic en enlaces sospechosos.'
  },

  // Para Organizadores
  {
    id: '26',
    category: 'Para Organizadores',
    question: '¿Cómo registro mi organizador?',
    answer: 'Haz clic en "Registra tu organizador" en la página principal, completa el formulario con información de tu organizador, sube documentos de verificación y espera la aprobación manual.'
  },
  {
    id: '27',
      category: 'Para Organizadores',
      question: '¿Cuánto cuesta crear una oportunidad?',
      answer: 'Crear una oportunidad es gratis. Solo pagas una comisión del 10% sobre el monto total de tickets vendidos. Además, debes depositar un 10% del valor de ticket como garantía (reembolsable).'
    },
  {
    id: '28',
    category: 'Para Organizadores',
    question: '¿Cuáles son los requisitos para crear una oportunidad?',
    answer: 'Requisitos:\n- Valor mínimo del producto: S/. 50\n- Dimensiones mínimas: 15cm x 15cm x 15cm\n- Fotos claras y descripción detallada\n- Organizador verificado y activo\n- Depósito de garantía del 10%'
  },
  {
    id: '29',
    category: 'Para Organizadores',
    question: '¿Cuánto tiempo tarda la aprobación de una oportunidad?',
    answer: 'Las oportunidades se revisan manualmente y generalmente se aprueban dentro de 24-48 horas. Recibirás una notificación cuando sea aprobada.'
  },
  {
    id: '30',
    category: 'Para Organizadores',
    question: '¿Puedo cancelar una oportunidad?',
    answer: 'Sí, puedes cancelar una oportunidad antes de que se ejecute. Se reembolsará el 100% a todos los participantes y recuperarás tu depósito de garantía.'
  },

  // Soporte
  {
    id: '31',
    category: 'Soporte',
    question: '¿Cómo contacto al equipo de soporte?',
    answer: 'Puedes contactarnos por:\n- Email: support@tiketea.com\n- WhatsApp: +51 XXXXXXXXX\n- Chat en vivo en la plataforma\n- Horario: Lunes a Viernes, 9:00 AM - 6:00 PM'
  },
  {
    id: '32',
    category: 'Soporte',
    question: '¿Cuál es el tiempo de respuesta del soporte?',
    answer: 'Respondemos dentro de 24 horas en días hábiles. Para consultas urgentes, usa WhatsApp para una respuesta más rápida.'
  },
  {
    id: '33',
    category: 'Soporte',
    question: '¿Cómo reporto un problema?',
    answer: 'Haz clic en el icono de ayuda en la plataforma, selecciona "Reportar un problema", describe el problema con detalles y adjunta capturas de pantalla si es necesario.'
  },
];

const categories = ['Todos', ...Array.from(new Set(faqItems.map(item => item.category)))];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'Todos' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Soporte y ayuda</span>
          <h1 className={styles.heroTitle}>Preguntas Frecuentes</h1>
          <p className={styles.heroSubtitle}>
            Encuentra respuestas a las preguntas más comunes sobre TIKETEA ONLINE
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className={styles.faqContainer}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`${styles.faqItem} ${expandedId === item.id ? styles.expanded : ''}`}
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className={styles.faqQuestion}
              >
                <h3 className={styles.faqQuestionText}>
                  {item.question}
                </h3>
                <FiChevronDown className={styles.faqIcon} />
              </button>

              {expandedId === item.id && (
                <div className={styles.faqAnswer}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <section className={styles.contactSection}>
          <div className={styles.contactContent}>
            <h2 className={styles.contactTitle}>
              ¿No encontraste tu respuesta?
            </h2>
            <p className={styles.contactSubtitle}>
              Nuestro equipo de soporte está disponible para ayudarte
            </p>
            <div className={styles.contactButtons}>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@tiketea.com'}`}
                className={`${styles.contactButton} ${styles.primary}`}
              >
                <FiMail />
                <span>Enviar Email</span>
              </a>
              <a
                href={`https://wa.me/51${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '984908819').replace(/\D/g, '')}?text=Hola%20👋%0A%0AEstoy%20visitando%20TIKETEA%20y%20quiero%20más%20información%20sobre%20cómo%20funcionan%20las%20oportunidades%20y%20la%20compra%20de%20tickets.%0A%0A¿Podrían%20ayudarme,%20por%20favor?`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.contactButton} ${styles.secondary}`}
              >
                <FiMessageCircle />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}