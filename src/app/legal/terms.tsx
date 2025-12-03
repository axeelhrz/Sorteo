'use client';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Términos y Condiciones</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2>1. Aceptación de Términos</h2>
        <p>
          Al acceder y utilizar esta plataforma de sorteos, aceptas estar vinculado por estos términos y condiciones.
          Si no estás de acuerdo con alguna parte de estos términos, no debes usar el servicio.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>2. Descripción del Servicio</h2>
        <p>
          Somos una plataforma que conecta a tiendas (vendedores) con usuarios (compradores) para participar en sorteos
          de productos. No somos propietarios de los productos rifados ni responsables de su entrega.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>3. Responsabilidades de las Tiendas</h2>
        <ul>
          <li>Garantizar que los productos descritos son reales y están disponibles</li>
          <li>Entregar el premio al ganador dentro de 30 días después de la ejecución del sorteo</li>
          <li>Mantener la integridad del sorteo y no manipular resultados</li>
          <li>Cumplir con todas las leyes y regulaciones aplicables</li>
          <li>No publicar contenido ilegal, ofensivo o engañoso</li>
          <li>Asumir responsabilidad total por la calidad y descripción del producto</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>4. Responsabilidades de los Usuarios</h2>
        <ul>
          <li>Proporcionar información precisa y actualizada en tu perfil</li>
          <li>No participar en sorteos de forma fraudulenta</li>
          <li>Respetar los derechos de otros usuarios y tiendas</li>
          <li>No intentar manipular o interferir con los sorteos</li>
          <li>Aceptar los resultados de los sorteos como finales</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>5. Política de Reembolsos</h2>
        <ul>
          <li>Los reembolsos se aplican solo si el sorteo es cancelado por la tienda</li>
          <li>Los reembolsos se procesan dentro de 5-7 días hábiles</li>
          <li>No se reembolsan tickets ganadores</li>
          <li>La plataforma retiene una comisión del 5% en caso de reembolso</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>6. Limitación de Responsabilidad</h2>
        <p>
          La plataforma no es responsable por:
        </p>
        <ul>
          <li>Incumplimiento de tiendas en la entrega de premios</li>
          <li>Calidad o descripción incorrecta de productos</li>
          <li>Pérdida o daño de productos durante el envío</li>
          <li>Disputas entre usuarios y tiendas</li>
          <li>Errores técnicos o interrupciones del servicio</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>7. Política Anticorrupción</h2>
        <p>
          Las tiendas no pueden:
        </p>
        <ul>
          <li>Ofrecer incentivos a usuarios para manipular sorteos</li>
          <li>Coordinar con otros vendedores para fijar precios</li>
          <li>Usar bots o scripts para comprar tickets automáticamente</li>
          <li>Crear múltiples cuentas para aumentar probabilidades</li>
        </ul>
        <p>
          Violaciones resultarán en bloqueo permanente de la cuenta y confiscación de fondos.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>8. Requisitos Mínimos para Sorteos</h2>
        <ul>
          <li>Valor mínimo del producto: S/. 50</li>
          <li>Dimensiones mínimas: 15cm x 15cm x 15cm</li>
          <li>Depósito de garantía: 10% del valor del producto</li>
          <li>Aprobación manual previa antes de publicación</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>9. Ejecución de Sorteos</h2>
        <ul>
          <li>Los sorteos se ejecutan automáticamente cuando se venden todos los tickets</li>
          <li>El ganador se selecciona de forma aleatoria y verificable</li>
          <li>Los resultados son finales e inapelables</li>
          <li>Se registra un log de auditoría de cada ejecución</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>10. Modificación de Términos</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor
          inmediatamente. El uso continuado del servicio constituye aceptación de los términos modificados.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>11. Contacto</h2>
        <p>
          Para preguntas sobre estos términos, contáctanos en: <strong>legal@sorteos.com</strong>
        </p>
      </section>
    </div>
  );
}