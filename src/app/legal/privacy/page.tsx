'use client';

import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Política de Privacidad</h1>
        <p className={styles.lastUpdated}>Última actualización: {new Date().toLocaleDateString('es-PE')}</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Introducción</h2>
          <p>
            TIKETEA ONLINE respeta tu privacidad y se compromete a proteger tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Información que Recopilamos</h2>
          <p>Recopilamos información que proporcionas directamente:</p>
          <ul className={styles.list}>
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número de teléfono</li>
            <li>Dirección física</li>
            <li>Información de pago (procesada de forma segura)</li>
            <li>Información de perfil</li>
          </ul>
          <p style={{ marginTop: '16px' }}>También recopilamos información automáticamente:</p>
          <ul className={styles.list}>
            <li>Dirección IP</li>
            <li>Tipo de navegador</li>
            <li>Páginas visitadas</li>
            <li>Tiempo de permanencia</li>
            <li>Cookies y tecnologías similares</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Cómo Usamos tu Información</h2>
          <p>Usamos tu información para:</p>
          <ul className={styles.list}>
            <li>Procesar transacciones y pagos</li>
            <li>Crear y mantener tu cuenta</li>
            <li>Enviar notificaciones sobre sorteos</li>
            <li>Mejorar nuestros servicios</li>
            <li>Cumplir con obligaciones legales</li>
            <li>Prevenir fraude y actividades ilegales</li>
            <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Compartir tu Información</h2>
          <p>
            No vendemos tu información personal. Sin embargo, podemos compartirla con:
          </p>
          <ul className={styles.list}>
            <li>Procesadores de pago (para procesar pagos)</li>
            <li>Tiendas (para coordinar entrega de premios)</li>
            <li>Proveedores de servicios (hosting, análisis)</li>
            <li>Autoridades legales (cuando sea requerido por ley)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Seguridad de Datos</h2>
          <p>
            Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información:
          </p>
          <ul className={styles.list}>
            <li>Encriptación SSL/TLS</li>
            <li>Contraseñas hasheadas</li>
            <li>Acceso restringido a datos</li>
            <li>Auditorías de seguridad regulares</li>
            <li>Cumplimiento de estándares de seguridad</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Retención de Datos</h2>
          <p>
            Retenemos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionar servicios. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Tus Derechos</h2>
          <p>Tienes derecho a:</p>
          <ul className={styles.list}>
            <li>Acceder a tu información personal</li>
            <li>Corregir información inexacta</li>
            <li>Solicitar la eliminación de tu información</li>
            <li>Optar por no recibir comunicaciones de marketing</li>
            <li>Exportar tus datos</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Cookies</h2>
          <p>
            Usamos cookies para mejorar tu experiencia. Puedes controlar las cookies a través de la configuración de tu navegador. Algunas cookies son esenciales para el funcionamiento del sitio.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Enlaces Externos</h2>
          <p>
            Nuestro sitio puede contener enlaces a sitios externos. No somos responsables por sus políticas de privacidad. Te recomendamos revisar sus políticas antes de proporcionar información.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Cambios a esta Política</h2>
          <p>
            Podemos actualizar esta política en cualquier momento. Te notificaremos sobre cambios significativos. Tu uso continuado de la plataforma constituye aceptación de los cambios.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política o tus datos, contáctanos en:
          </p>
          <ul className={styles.list}>
            <li>Email: privacy@tiketea.com</li>
            <li>Teléfono: +51 XXXXXXXXX</li>
            <li>Dirección: Lima, Perú</li>
          </ul>
        </section>
      </div>
    </div>
  );
}