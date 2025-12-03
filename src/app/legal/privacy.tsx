'use client';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Política de Privacidad</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2>1. Introducción</h2>
        <p>
          Respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. Esta política explica cómo
          recopilamos, usamos y protegemos tu información.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>2. Información que Recopilamos</h2>
        <ul>
          <li><strong>Información de Registro:</strong> Nombre, email, contraseña, teléfono</li>
          <li><strong>Información de Perfil:</strong> Dirección, ciudad, documento de identidad</li>
          <li><strong>Información de Pago:</strong> Referencia de transacción (NO guardamos datos de tarjeta)</li>
          <li><strong>Información de Actividad:</strong> Sorteos en los que participas, tickets comprados</li>
          <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, páginas visitadas</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>3. Cómo Usamos tu Información</h2>
        <ul>
          <li>Procesar tu registro y autenticación</li>
          <li>Facilitar transacciones de pago</li>
          <li>Ejecutar sorteos y notificar ganadores</li>
          <li>Enviar notificaciones sobre sorteos y actualizaciones</li>
          <li>Investigar fraude y cumplir con leyes</li>
          <li>Mejorar nuestro servicio</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>4. Protección de Datos</h2>
        <ul>
          <li>Usamos encriptación HTTPS para todas las comunicaciones</li>
          <li>Las contraseñas se almacenan con hash bcrypt</li>
          <li>Los datos de tarjeta NO se almacenan en nuestros servidores</li>
          <li>Acceso restringido a datos personales solo para personal autorizado</li>
          <li>Auditoría regular de seguridad</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>5. Conservación de Datos</h2>
        <ul>
          <li>Datos de cuenta: Mientras la cuenta esté activa</li>
          <li>Datos de transacciones: 7 años (requerido por ley)</li>
          <li>Logs de auditoría: 2 años</li>
          <li>Datos de cookies: Hasta 1 año</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>6. Compartir Información</h2>
        <p>
          No compartimos tu información personal con terceros excepto:
        </p>
        <ul>
          <li>Pasarela de pago (solo referencia de transacción)</li>
          <li>Proveedores de email (para notificaciones)</li>
          <li>Autoridades legales (si es requerido por ley)</li>
          <li>Tiendas (solo nombre y email si ganas un sorteo)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>7. Tus Derechos</h2>
        <ul>
          <li><strong>Acceso:</strong> Puedes solicitar una copia de tus datos</li>
          <li><strong>Rectificación:</strong> Puedes corregir información incorrecta</li>
          <li><strong>Eliminación:</strong> Puedes solicitar borrar tu cuenta</li>
          <li><strong>Portabilidad:</strong> Puedes descargar tus datos</li>
          <li><strong>Oposición:</strong> Puedes optar por no recibir marketing</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>8. Cookies</h2>
        <p>
          Usamos cookies para:
        </p>
        <ul>
          <li>Mantener tu sesión activa</li>
          <li>Recordar preferencias</li>
          <li>Analizar uso del sitio</li>
          <li>Prevenir fraude</li>
        </ul>
        <p>
          Puedes desactivar cookies en tu navegador, pero algunos servicios pueden no funcionar correctamente.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>9. Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta política en cualquier momento. Te notificaremos de cambios significativos por email.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>10. Contacto</h2>
        <p>
          Para preguntas sobre privacidad, contáctanos en: <strong>privacy@sorteos.com</strong>
        </p>
      </section>
    </div>
  );
}