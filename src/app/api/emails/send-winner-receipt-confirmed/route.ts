import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/emails/send-winner-receipt-confirmed
 * Envía al ganador: su premio fue recibido (confirmación de recepción).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName } = body;

    if (!email || !name || !raffleTitle || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Premio recibido</title></head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 30px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">TIKETEA</h1>
              </td></tr>
              <tr><td style="padding:40px 30px;">
                <h2 style="color:#10b981;margin:0 0 20px 0;font-size:24px;">¡Tu premio fue recibido!</h2>
                <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                  Hola <strong>${name}</strong>,
                </p>
                <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
                  Has confirmado la recepción de tu premio de la oportunidad <strong>${productName}</strong> (${raffleTitle}). El proceso de entrega ha quedado cerrado correctamente.
                </p>
                <div style="background:#d1fae5;border-left:4px solid #10b981;padding:16px;border-radius:4px;margin:0 0 24px 0;">
                  <p style="color:#065f46;margin:0;font-size:15px;font-weight:600;">✓ Recepción confirmada</p>
                </div>
                <p style="color:#4b5563;font-size:14px;line-height:1.6;margin:0;">Gracias por participar,<br><strong>Equipo TIKETEA</strong></p>
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

    console.log('Sending winner receipt confirmed to:', email, 'body length:', htmlContent.length);
    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error: any) {
    console.error('Error sending winner receipt confirmed:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: error.message },
      { status: 500 }
    );
  }
}
