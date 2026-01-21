import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleName, ticketQuantity, amount, paymentMethod } = body;

    if (!email || !name || !raffleName || !ticketQuantity || !amount || !paymentMethod) {
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
        <title>¡Tu compra ha sido confirmada!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">¡Pago confirmado exitosamente!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      ¡Excelentes noticias! Tu pago ha sido verificado y aprobado. Tus tickets ya están asignados.
                    </p>

                    <!-- Success Badge -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">✓ Compra confirmada</h3>
                          <p style="color: #065f46; margin: 0; font-size: 15px;">
                            Tus tickets han sido asignados correctamente
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Purchase Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Detalles de tu compra:</h3>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Sorteo:</strong> ${raffleName}
                          </p>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Cantidad de tickets:</strong> ${ticketQuantity}
                          </p>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Monto pagado:</strong> S/ ${Number(amount).toFixed(2)}
                          </p>
                          <p style="color: #4b5563; margin: 0; font-size: 15px;">
                            <strong>Método de pago:</strong> ${paymentMethod}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Puedes ver tus tickets en tu panel de usuario en la sección "Mis Participaciones".
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://tiketea.com/user-panel/participations" 
                             style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                            Ver mis tickets
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                      ¡Mucha suerte en el sorteo!
                    </p>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                      Saludos,<br>
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

    console.log('Sending payment approved email to:', email);
    console.log('Email HTML length:', htmlContent.length);

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      preview: htmlContent.substring(0, 100) + '...'
    });

  } catch (error: any) {
    console.error('Error sending payment approved email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}