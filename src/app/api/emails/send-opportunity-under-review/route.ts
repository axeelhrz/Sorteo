import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/emails/send-opportunity-under-review
 * Envía al organizador un correo indicando que su solicitud de oportunidad está en revisión.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, organizerName, productName, raffleId } = body;

    if (!email || !organizerName || !productName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, organizerName, productName' },
        { status: 400 }
      );
    }

    const _htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu solicitud de oportunidad está en revisión</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #6366f1; margin: 0 0 20px 0; font-size: 24px;">Solicitud de oportunidad en revisión</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${organizerName}</strong>,
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Hemos recibido tu solicitud de oportunidad para el producto <strong>${productName}</strong>. 
                      Nuestro equipo la está revisando y te notificaremos cuando sea aprobada o si necesitamos más información.
                    </p>
                    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 0 0 30px 0;">
                      <p style="color: #1e40af; margin: 0; font-size: 15px; font-weight: 600;">
                        ✓ Tu solicitud está en revisión
                      </p>
                      <p style="color: #1e40af; margin: 8px 0 0 0; font-size: 14px;">
                        El administrador de TIKETEA validará la oportunidad (precio, cantidad de tickets, etc.) y se pondrá en contacto contigo si es necesario.
                      </p>
                    </div>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                      Gracias por usar TIKETEA,<br>
                      <strong>Equipo TIKETEA</strong>
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

    // TODO: Integrar con servicio de email real (SendGrid, AWS SES, etc.) usando _htmlContent
    console.log('Sending opportunity under review email to:', email, 'product:', productName, 'raffleId:', raffleId, 'body length:', _htmlContent.length);

    return NextResponse.json({
      success: true,
      message: 'Email enviado correctamente',
    });
  } catch (error: any) {
    console.error('Error sending opportunity under review email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: error.message },
      { status: 500 }
    );
  }
}
