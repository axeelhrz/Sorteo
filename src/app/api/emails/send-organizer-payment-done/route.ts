import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/emails/send-organizer-payment-done
 * Envía al organizador: se procedió con el pago del producto (evidencia subida por admin).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      organizerName,
      raffleId,
      productName,
      amountPaid,
      paymentEvidenceUrl,
    } = body;

    if (!email || !organizerName || !raffleId || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const _htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago realizado</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">Pago realizado</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${organizerName}</strong>,
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                      Te informamos que se ha procedido con el <strong>pago del producto</strong> correspondiente a la oportunidad <strong>${productName}</strong> (ID: ${raffleId}).
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; margin: 0 0 24px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="color: #065f46; margin: 0 0 8px 0; font-size: 15px;"><strong>Oportunidad:</strong> ${productName}</p>
                          <p style="color: #065f46; margin: 0 0 8px 0; font-size: 15px;"><strong>ID:</strong> ${raffleId}</p>
                          ${amountPaid != null ? `<p style="color: #065f46; margin: 0 0 8px 0; font-size: 15px;"><strong>Monto pagado:</strong> S/. ${Number(amountPaid).toFixed(2)}</p>` : ''}
                          ${paymentEvidenceUrl ? `<p style="color: #065f46; margin: 12px 0 0 0; font-size: 14px;"><a href="${paymentEvidenceUrl}" style="color: #059669; font-weight: 600;">Ver evidencia de pago</a></p>` : ''}
                        </td>
                      </tr>
                    </table>
                    <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                      <a href="${appUrl}/dashboard/store" style="color: #059669; font-weight: 600;">Ir al panel del organizador</a>
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
                      Gracias,<br><strong>Equipo TIKETEA</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Si tienes dudas, contáctanos en soporte@tiketea.com</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    console.log('Sending organizer payment done email to:', email, 'raffleId:', raffleId, 'body length:', _htmlContent.length);

    return NextResponse.json({
      success: true,
      message: 'Correo enviado correctamente',
    });
  } catch (error: any) {
    console.error('Error sending organizer payment done email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: error.message },
      { status: 500 }
    );
  }
}
