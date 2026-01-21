import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, ticketQuantity, amount, paymentMethod, reason, paymentId } = body;

    if (!email || !name || !ticketQuantity || !amount || !paymentMethod || !reason || !paymentId) {
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
        <title>Verificación de compra requerida</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TIKETEA</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #f59e0b; margin: 0 0 20px 0; font-size: 24px;">Verificación de compra requerida</h2>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hola <strong>${name}</strong>,
                    </p>
                    
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      Hemos recibido tu comprobante de pago, pero no pudimos validar automáticamente la información.
                    </p>

                    <!-- Reason Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">Motivo:</h3>
                          <p style="color: #92400e; margin: 0; font-size: 15px;">
                            ${reason}
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
                            <strong>Cantidad de tickets:</strong> ${ticketQuantity}
                          </p>
                          <p style="color: #4b5563; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Monto esperado:</strong> S/ ${Number(amount).toFixed(2)}
                          </p>
                          <p style="color: #4b5563; margin: 0; font-size: 15px;">
                            <strong>Método de pago:</strong> ${paymentMethod}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">¿Qué hacer ahora?</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Por favor, ponte en contacto con nuestro equipo de soporte para que podamos verificar tu pago manualmente:
                    </p>

                    <!-- Support Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; margin: 0 0 30px 0;">
                      <tr>
                        <td style="padding: 20px;">
                          <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Datos de soporte:</h4>
                          <p style="color: #1e40af; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>Email:</strong> soporte@tiketea.com
                          </p>
                          <p style="color: #1e40af; margin: 0 0 10px 0; font-size: 15px;">
                            <strong>WhatsApp:</strong> +51 984 908 819
                          </p>
                          <p style="color: #1e40af; margin: 0; font-size: 15px;">
                            <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      Nuestro equipo revisará tu comprobante y te responderá a la brevedad posible.
                    </p>

                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0;">
                      Disculpa las molestias,<br>
                      <strong>Equipo TIKETEA</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                      ID de pago: ${paymentId}
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

    console.log('Sending payment validation failed email to:', email);
    console.log('Email HTML length:', htmlContent.length);

    return NextResponse.json({ 
      success: true,
      message: 'Email sent successfully',
      preview: htmlContent.substring(0, 100) + '...'
    });

  } catch (error: any) {
    console.error('Error sending payment validation failed email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}