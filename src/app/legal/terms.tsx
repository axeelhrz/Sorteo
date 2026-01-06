'use client';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '10px', color: '#333' }}>
        Términos y Condiciones
      </h1>
      <p style={{ color: '#666', marginBottom: '40px', fontSize: '14px' }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          1. Aceptación de Términos
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '10px' }}>
          Al acceder y utilizar TIKETEA ONLINE (en adelante "la Plataforma"), aceptas estar vinculado por estos 
          términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar el servicio.
        </p>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          La Plataforma se reserva el derecho de rechazar el acceso a cualquier usuario que viole estos términos.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          2. Descripción del Servicio
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          TIKETEA es una plataforma tecnológica que facilita la publicación y gestión de oportunidades ofrecidas por terceros. No organiza sorteos, no vende productos y no actúa como comerciante final.
        </p>
        <p style={{ color: '#555', lineHeight: '1.6', marginTop: '15px' }}>
          La Plataforma proporciona las herramientas tecnológicas para que terceros (tiendas y comerciantes) puedan:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px', marginTop: '10px' }}>
          <li>Publicar y gestionar sus propias oportunidades</li>
          <li>Procesar pagos de manera segura a través de pasarelas de pago integradas</li>
          <li>Ejecutar sorteos de forma aleatoria y verificable mediante algoritmos criptográficos</li>
          <li>Comunicarse con los participantes y coordinar entregas</li>
        </ul>
        <p style={{ color: '#555', lineHeight: '1.6', marginTop: '15px' }}>
          <strong>Importante:</strong> TIKETEA actúa únicamente como intermediario tecnológico. Los terceros que publican oportunidades son los únicos responsables de la veracidad de la información, la calidad de los productos y el cumplimiento de las entregas.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          3. Responsabilidades de las Tiendas
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
          Las tiendas que utilizan la Plataforma se comprometen a:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Garantizar que los productos descritos son reales, auténticos y están disponibles</li>
          <li>Proporcionar descripciones precisas y fotos de alta calidad</li>
          <li>Entregar el premio al ganador dentro de 30 días después de la ejecución de la oportunidad</li>
          <li>Mantener la integridad de la oportunidad y no manipular resultados</li>
          <li>Cumplir con todas las leyes y regulaciones aplicables</li>
          <li>No publicar contenido ilegal, ofensivo, discriminatorio o engañoso</li>
          <li>Asumir responsabilidad total por la calidad, descripción y entrega del producto</li>
          <li>Responder consultas de usuarios de manera profesional y oportuna</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          4. Responsabilidades de los Usuarios
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
          Los usuarios que participan en oportunidades se comprometen a:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Proporcionar información precisa, completa y actualizada en su perfil</li>
          <li>Mantener la confidencialidad de su contraseña y credenciales</li>
          <li>No participar en oportunidades de forma fraudulenta o engañosa</li>
          <li>Respetar los derechos de otros usuarios y tiendas</li>
          <li>No intentar manipular, interferir o sabotear las oportunidades</li>
          <li>No usar bots, scripts o herramientas automatizadas</li>
          <li>Aceptar los resultados de las oportunidades como finales e inapelables</li>
          <li>Cumplir con todas las leyes y regulaciones aplicables</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          5. Política de Reembolsos
        </h2>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong>Reembolso por cancelación:</strong> Si la tienda cancela la oportunidad antes de ejecutarse, 
          se reembolsa el 100% del monto pagado</li>
          <li><strong>Reembolso por error técnico:</strong> Si hay un error técnico de la Plataforma, se reembolsa el 100%</li>
          <li><strong>Reembolso por pago duplicado:</strong> Se reembolsa automáticamente dentro de 24 horas</li>
          <li><strong>Tiempo de procesamiento:</strong> Los reembolsos se procesan dentro de 5-7 días hábiles</li>
          <li><strong>Tickets ganadores:</strong> No se reembolsan bajo ninguna circunstancia</li>
          <li><strong>Cambio de opinión:</strong> No se aplican reembolsos por cambio de opinión del usuario</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          6. Limitación de Responsabilidad
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
          La Plataforma no es responsable por:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Incumplimiento de tiendas en la entrega de premios</li>
          <li>Calidad, descripción incorrecta o defectos de productos</li>
          <li>Pérdida, daño o robo de productos durante el envío</li>
          <li>Disputas, reclamos o conflictos entre usuarios y tiendas</li>
          <li>Errores técnicos, interrupciones o indisponibilidad del servicio</li>
          <li>Pérdida de datos o acceso no autorizado a cuentas</li>
          <li>Daños indirectos, incidentales o consecuentes</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          7. Política Anticorrupción y Fraude
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
          Está estrictamente prohibido:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Ofrecer o aceptar incentivos para manipular oportunidades</li>
          <li>Coordinar con otros vendedores para fijar precios o manipular resultados</li>
          <li>Usar bots, scripts o herramientas para comprar tickets automáticamente</li>
          <li>Crear múltiples cuentas para aumentar probabilidades de ganar</li>
          <li>Usar información privilegiada para obtener ventajas</li>
          <li>Realizar transacciones fraudulentas o con fondos robados</li>
        </ul>
        <p style={{ color: '#555', lineHeight: '1.6', marginTop: '15px' }}>
          <strong>Consecuencias:</strong> Las violaciones resultarán en bloqueo permanente de la cuenta, 
          confiscación de fondos y posible denuncia a autoridades competentes.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          8. Requisitos para Crear Oportunidades
        </h2>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li><strong>Valor mínimo del producto:</strong> S/. 50</li>
          <li><strong>Dimensiones mínimas:</strong> 15cm x 15cm x 15cm</li>
          <li><strong>Depósito de garantía:</strong> 10% del valor del producto (reembolsable)</li>
          <li><strong>Aprobación previa:</strong> Revisión manual antes de publicación</li>
          <li><strong>Documentación:</strong> Fotos claras y descripción detallada</li>
          <li><strong>Verificación de tienda:</strong> Tienda debe estar verificada y activa</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          9. Ejecución de Oportunidades
        </h2>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Las oportunidades se ejecutan automáticamente cuando se venden todos los tickets</li>
          <li>El ganador se selecciona mediante un algoritmo criptográfico verificable</li>
          <li>Los resultados son finales, inapelables e irreversibles</li>
          <li>Se genera un certificado de auditoría para cada ejecución</li>
          <li>El ganador es notificado por email inmediatamente</li>
          <li>La tienda tiene 30 días para entregar el premio</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          10. Privacidad y Protección de Datos
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          La Plataforma se compromete a proteger tu información personal de acuerdo con la Ley de Protección de Datos 
          Personales. Para más detalles, consulta nuestra <strong>Política de Privacidad</strong>.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          11. Modificación de Términos
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          La Plataforma se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán 
          en vigor inmediatamente después de su publicación. El uso continuado del servicio constituye aceptación de 
          los términos modificados. Te notificaremos de cambios significativos por email.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          12. Resolución de Disputas
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '15px' }}>
          En caso de disputa:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px' }}>
          <li>Contacta a nuestro equipo de soporte dentro de 30 días</li>
          <li>Proporciona evidencia y documentación relevante</li>
          <li>La Plataforma investigará y tomará una decisión final</li>
          <li>Las decisiones de la Plataforma son vinculantes</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '15px', color: '#333' }}>
          13. Contacto
        </h2>
        <p style={{ color: '#555', lineHeight: '1.6' }}>
          Para preguntas, reclamos o sugerencias sobre estos términos, contáctanos en:
        </p>
        <ul style={{ color: '#555', lineHeight: '1.8', marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Email:</strong> legal@tiketea.com</li>
          <li><strong>WhatsApp:</strong> +51 XXXXXXXXX</li>
          <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</li>
        </ul>
      </section>

      <div style={{ 
        backgroundColor: '#f5f7fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginTop: '40px',
        borderLeft: '4px solid #667eea'
      }}>
        <p style={{ color: '#555', margin: '0', fontSize: '13px', lineHeight: '1.6' }}>
          <strong>Aviso Legal:</strong> Estos términos y condiciones constituyen el acuerdo completo entre tú y 
          TIKETEA ONLINE. Si alguna disposición es inválida, las demás permanecerán en vigor. La Plataforma se 
          reserva todos los derechos no expresamente otorgados.
        </p>
      </div>
    </div>
  );
}