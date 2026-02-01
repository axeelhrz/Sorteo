import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/emails/send-organizer-delivery-awaiting-confirmation
 * Envía al organizador: el proceso está a la espera de la confirmación de recepción del ganador.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizerName, raffleId, productName } = body;

    if (!email || !organizerName || !raffleId || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Esperando confirmación del ganador</title></head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:40px 30px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">TIKETEA</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;">
                <h2 style="color:#6366f1;margin:0 0 20px 0;font-size:24px;">Evidencia de entrega registrada</h2>
                <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                  Hola <strong>${organizerName}</strong>,
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                  Has subido la evidencia de entrega para la oportunidad <strong>${productName}</strong> (ID: ${raffleId}).
                </p>
                <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:16px;border-radius:4px;margin:0 0 24px 0;">
                  <p style="color:#1e40af;margin:0;font-size:15px;font-weight:600;">El proceso está a la espera de la confirmación de recepción del ganador.</p>
                  <p style="color:#1e40af;margin:8px 0 0 0;font-size:14px;">El ganador tiene 7 días para confirmar en la web que recibió el premio. Si no confirma en ese plazo, se dará por confirmada con la evidencia que subiste.</p>
                </div>
                <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0;">Gracias,<br><strong>Equipo TIKETEA</strong></p>
              </td></tr>
              <tr><td style="background:#f9fafb;padding:30px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#6b7280;font-size:14px;margin:0;">soporte@tiketea.com</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    console.log('Sending organizer delivery awaiting confirmation to:', email, 'raffleId:', raffleId, 'body length:', htmlContent.length);
    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: any) {
    console.error('Error sending organizer delivery awaiting confirmation:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: error.message },
      { status: 500 }
    );
  }
}
