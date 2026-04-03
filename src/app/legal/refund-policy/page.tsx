'use client';

import styles from '../legal.module.css';

export default function RefundPolicyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Política de Reembolsos</h1>
        <p className={styles.lastUpdated}>Última actualización: {new Date().toLocaleDateString('es-PE')}</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Política General de Reembolsos</h2>
          <p>
            TIKETEA ONLINE se compromete a procesar reembolsos de manera justa y transparente. Esta política explica cuándo y cómo se procesan los reembolsos.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Casos Elegibles para Reembolso</h2>
          <p>Se procesarán reembolsos en los siguientes casos:</p>
          <ul className={styles.list}>
          <li>El organizador cancela la oportunidad antes de ejecutarse</li>
          <li>Error técnico de la plataforma que afecte tu compra</li>
          <li>Pago duplicado o múltiple</li>
          <li>Orden cancelada antes de que se ejecute el sorteo</li>
          <li>El organizador no entrega el premio dentro de 30 días</li>
          <li>El premio llega dañado o defectuoso</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Casos NO Elegibles para Reembolso</h2>
          <p>NO se procesarán reembolsos en los siguientes casos:</p>
          <ul className={styles.list}>
            <li>Cambio de opinión después de comprar tickets</li>
            <li>No ganar el sorteo</li>
            <li>Arrepentimiento de la compra</li>
            <li>Tickets ganadores (se entrega el premio en su lugar)</li>
            <li>Problemas de conexión del usuario</li>
            <li>Información incorrecta proporcionada por el usuario</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Proceso de Solicitud de Reembolso</h2>
          <p>Para solicitar un reembolso:</p>
          <ul className={styles.list}>
            <li>Inicia sesión en tu cuenta</li>
            <li>Ve a "Historial de Compras"</li>
            <li>Selecciona la transacción</li>
            <li>Haz clic en "Solicitar Reembolso"</li>
            <li>Proporciona detalles y evidencia si es necesario</li>
            <li>Envía la solicitud</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Tiempo de Procesamiento</h2>
          <p>
            Los reembolsos se procesan dentro de 5-7 días hábiles después de ser aprobados. El tiempo exacto depende de tu banco o procesador de pago. Algunos bancos pueden tardar hasta 10 días hábiles en reflejar el reembolso.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Reembolsos Parciales</h2>
          <p>
            En algunos casos, se pueden procesar reembolsos parciales:
          </p>
          <ul className={styles.list}>
          <li>Si solo algunos de tus tickets son afectados</li>
          <li>Si el organizador entrega un premio parcialmente dañado</li>
          <li>Si hay un acuerdo mutuo entre tú y el organizador</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Depósito de Garantía</h2>
        <p>
          Si un organizador cancela una oportunidad, se reembolsa el 100% del depósito de garantía (10% del valor de ticket) a los participantes.
        </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Disputas de Pago</h2>
          <p>
            Si tienes una disputa con tu banco o procesador de pago, TIKETEA ONLINE cooperará plenamente para resolver el problema. Proporciona toda la documentación necesaria.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Reembolsos con criptomoneda</h2>
          <p>
            Los reembolsos aprobados se gestionan según el medio acordado con soporte. Los pagos de participación se realizan en criptomoneda; los plazos pueden variar según la red y la verificación de la transacción.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Reembolsos por Entrega Fallida</h2>
        <p>
          Si el organizador no entrega el premio dentro de 30 días:
        </p>
        <ul className={styles.list}>
          <li>Reporta el problema a nuestro equipo de soporte</li>
          <li>Proporcionamos 7 días adicionales para que el organizador entregue</li>
          <li>Si aún no se entrega, procesamos un reembolso completo</li>
          <li>El organizador es bloqueado de la plataforma</li>
        </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Contacto para Reembolsos</h2>
          <p>
            Si tienes preguntas sobre reembolsos, contáctanos en:
          </p>
          <ul className={styles.list}>
            <li>Email: refunds@tiketea.com</li>
            <li>Teléfono: +51 XXXXXXXXX</li>
            <li>WhatsApp: +51 XXXXXXXXX</li>
            <li>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</li>
          </ul>
        </section>
      </div>
    </div>
  );
}