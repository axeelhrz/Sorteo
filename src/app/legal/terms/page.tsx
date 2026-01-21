'use client';

import styles from '../legal.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Términos y Condiciones</h1>
        <p className={styles.lastUpdated}>Última actualización: {new Date().toLocaleDateString('es-PE')}</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Aceptación de Términos</h2>
          <p>
            Al acceder y utilizar TIKETEA ONLINE, aceptas estar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la plataforma.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Descripción del Servicio</h2>
          <p>
            TIKETEA es una plataforma tecnológica que facilita la publicación y gestión de oportunidades ofrecidas por terceros. No organiza sorteos, no vende productos y no actúa como comerciante final.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Requisitos de Uso</h2>
          <ul className={styles.list}>
            <li>Debes tener al menos 18 años de edad</li>
            <li>Debes proporcionar información precisa y completa durante el registro</li>
            <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
            <li>No puedes usar la plataforma para actividades ilegales o fraudulentas</li>
            <li>No puedes interferir con el funcionamiento de la plataforma</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Compra de Tickets</h2>
          <p>
            Al comprar tickets, aceptas que:
          </p>
          <ul className={styles.list}>
            <li>El precio del ticket es final y no reembolsable (excepto en casos especificados)</li>
            <li>Cada ticket te da una oportunidad igual de ganar</li>
            <li>El sorteo se ejecuta automáticamente cuando se venden todos los tickets</li>
            <li>Los resultados son criptográficamente verificables</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Sorteos y Resultados</h2>
          <p>
            Los sorteos se ejecutan mediante un algoritmo criptográfico que selecciona aleatoriamente un ticket ganador. TIKETEA ONLINE no tiene control sobre quién gana. Los resultados son finales y vinculantes.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Entrega de Premios</h2>
        <p>
          Los organizadores tienen 30 días para entregar el premio después de que se ejecute el sorteo. TIKETEA ONLINE no es responsable de la entrega, pero garantiza que los organizadores cumplan o se toman acciones.
        </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Limitación de Responsabilidad</h2>
          <p>
            TIKETEA ONLINE se proporciona "tal cual" sin garantías. No somos responsables por:
          </p>
          <ul className={styles.list}>
            <li>Pérdida de datos o información</li>
            <li>Daños indirectos o consecuentes</li>
            <li>Interrupciones del servicio</li>
            <li>Acciones de terceros</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Modificación de Términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente. Tu uso continuado de la plataforma constituye aceptación de los términos modificados.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Terminación</h2>
          <p>
            Podemos terminar tu acceso a la plataforma en cualquier momento si violas estos términos o por cualquier otra razón a nuestro criterio.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Ley Aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de Perú. Cualquier disputa se resolverá en los tribunales de Lima, Perú.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Contacto</h2>
          <p>
            Si tienes preguntas sobre estos términos, contáctanos en:
          </p>
          <ul className={styles.list}>
            <li>Email: support@tiketea.com</li>
            <li>Teléfono: +51 XXXXXXXXX</li>
            <li>WhatsApp: +51 XXXXXXXXX</li>
          </ul>
        </section>
      </div>
    </div>
  );
}