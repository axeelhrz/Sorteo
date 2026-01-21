import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, ticketQuantity, amount, paymentMethod } = body;

    if (!email || !name || !ticketQuantity || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu compra está siendo validada</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #6366f1; margin: 0 0 20px 0; font-size: 24px;">¡Hemos recibido tu comprobante!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Tu compra está siendo validada por nuestro equipo. Te notificaremos cuando se complete el proceso.
                    </p>

                    <!-- Purchase Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Detalles de tu compra:</h3>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Cantidad de tickets:</strong> ${ticketQuantity}
                          </p>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Monto:</strong> S/ ${Number(amount).toFixed(2)}
                          </p>
                          <p style="color: #4b5563; margin: 0; font-size: 15px;">
                            <strong>Método de pago:</strong> ${paymentMethod}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      El proceso de validación puede tomar hasta <strong>24 horas</strong>. Te enviaremos un correo de confirmación una vez que tu pago sea aprobado.
                    </p>

                    <!-- Success Badge -->
                    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 0 0 30px 0;">
                      <p style="color: #065f46; margin: 0; font-size: 15px; font-weight: 600;">
                        ✓ La validación automática fue exitosa
                      </p>
                    </div>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                      Gracias por tu compra,<br>
                      <strong>Equipo TIKETEA</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                      Si tienes alguna pregunta, contáctanos en
                    </p>
                    <p style="color: #6366f1; font-size: 14px; margin: 0; font-weight: 600;">
                      soporte@tiketea.com
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending payment validation email to:', email);
    console.log('Email HTML length:', htmlContent.length);

    // Mock success response
    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      preview: htmlContent.substring(0, 100) + '...'
    });

  } catch (error: any) {
    console.error('Error sending payment validation email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}