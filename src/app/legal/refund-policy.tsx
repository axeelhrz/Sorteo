'use client';

export default function RefundPolicyPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Política de Reembolsos</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Última actualización: {new Date().toLocaleDateString('es-ES')}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2>1. Cuándo Aplica Reembolso</h2>
        <p>
          Los reembolsos se aplican SOLO en los siguientes casos:
        </p>
        <ul>
          <li>El sorteo es cancelado por la tienda antes de ejecutarse</li>
          <li>Error técnico de la plataforma que impida participar</li>
          <li>Pago duplicado accidental</li>
          <li>Sorteo no ejecutado después de 60 días de vencimiento</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>2. Cuándo NO Aplica Reembolso</h2>
        <ul>
          <li>Cambio de opinión después de comprar tickets</li>
          <li>No ganaste el sorteo</li>
          <li>El sorteo fue ejecutado correctamente</li>
          <li>Tickets ganadores (no reembolsables)</li>
          <li>Cancelación de cuenta con saldo positivo</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>3. Proceso de Reembolso</h2>
        <ol>
          <li>Contacta a soporte con tu número de transacción</li>
          <li>Proporciona evidencia del motivo del reembolso</li>
          <li>Nuestro equipo revisa tu solicitud (máximo 48 horas)</li>
          <li>Si es aprobada, procesamos el reembolso</li>
          <li>El dinero regresa a tu cuenta en 5-7 días hábiles</li>
        </ol>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>4. Comisión de Reembolso</h2>
        <ul>
          <li>Reembolso por cancelación de sorteo: 0% comisión</li>
          <li>Reembolso por error técnico: 0% comisión</li>
          <li>Reembolso por pago duplicado: 0% comisión</li>
          <li>Otros reembolsos: 5% de comisión administrativa</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>5. Tiempos de Procesamiento</h2>
        <ul>
          <li>Revisión de solicitud: 24-48 horas</li>
          <li>Aprobación: 24 horas</li>
          <li>Transferencia bancaria: 5-7 días hábiles</li>
          <li>Billetera digital: 1-3 días hábiles</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>6. Reembolsos Parciales</h2>
        <p>
          Si compraste múltiples tickets en un sorteo:
        </p>
        <ul>
          <li>Puedes solicitar reembolso de tickets individuales</li>
          <li>Se procesa el reembolso de los tickets no ganadores</li>
          <li>Los tickets ganadores no son reembolsables</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>7. Disputas de Reembolso</h2>
        <p>
          Si no estás de acuerdo con nuestra decisión:
        </p>
        <ul>
          <li>Puedes apelar dentro de 30 días</li>
          <li>Proporciona documentación adicional</li>
          <li>Un equipo diferente revisará tu caso</li>
          <li>La decisión final es vinculante</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>8. Reembolsos a Terceros</h2>
        <p>
          Los reembolsos se procesan al método de pago original:
        </p>
        <ul>
          <li>Tarjeta de crédito: Regresa a la tarjeta</li>
          <li>Billetera digital: Regresa a la billetera</li>
          <li>Transferencia bancaria: Regresa a la cuenta</li>
        </ul>
        <p>
          No procesamos reembolsos a terceros. El titular de la cuenta debe ser quien solicita el reembolso.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>9. Contacto para Reembolsos</h2>
        <p>
          Para solicitar un reembolso:
        </p>
        <ul>
          <li>Email: <strong>refunds@sorteos.com</strong></li>
          <li>Teléfono: <strong>+51 1 XXXX-XXXX</strong></li>
          <li>Chat en vivo: Disponible en la plataforma</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2>10. Política de Reembolsos para Tiendas</h2>
        <p>
          Si eres tienda y necesitas reembolsar a usuarios:
        </p>
        <ul>
          <li>Contacta a soporte con justificación</li>
          <li>Proporciona lista de usuarios afectados</li>
          <li>Nosotros procesamos el reembolso</li>
          <li>La tienda asume el costo de comisión</li>
        </ul>
      </section>
    </div>
  );
}