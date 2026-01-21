import { NextRequest, NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_SERVICE_ID = 'service_sovfqju';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || 'template_winner_notification';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      email,
      name,
      raffleId,
      raffleTitle,
      productName,
      productDescription,
      productValue,
      ticketNumber,
      verificationCode,
      shopName,
      shopEmail,
      shopPhone,
      shopSocialMedia,
      winDate,
    } = body;

    // Validar campos requeridos
    if (!email || !name || !raffleId || !productName || !ticketNumber || !verificationCode) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar configuración de EmailJS
    if (!EMAILJS_PUBLIC_KEY) {
      console.error('❌ EMAILJS_PUBLIC_KEY no está configurado');
      return NextResponse.json(
        { error: 'Servicio de correo no configurado' },
        { status: 500 }
      );
    }

    // Formatear fecha
    const formattedDate = new Date(winDate).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Preparar parámetros para EmailJS
    const templateParams = {
      to_email: email,
      to_name: name,
      raffle_title: raffleTitle || productName,
      product_name: productName,
      product_description: productDescription || 'Premio del sorteo',
      product_value: `S/. ${Number(productValue).toFixed(2)}`,
      ticket_number: ticketNumber,
      verification_code: verificationCode,
      shop_name: shopName,
      shop_email: shopEmail || 'No proporcionado',
      shop_phone: shopPhone || 'No proporcionado',
      shop_social_media: shopSocialMedia || 'No proporcionado',
      win_date: formattedDate,
      raffle_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sorteos/${raffleId}/winner`,
    };

    // Enviar correo usando EmailJS
    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('✅ Correo enviado exitosamente:', response);

      return NextResponse.json({
        success: true,
        message: 'Correo enviado exitosamente',
        messageId: response.text,
      });
    } catch (emailError: any) {
      console.error('❌ Error al enviar correo con EmailJS:', emailError);
      
      // Si EmailJS falla, generar HTML como fallback para logging
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Felicidades! Has ganado el sorteo</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .prize-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .verification-code {
              background: #fff3cd;
              border: 2px dashed #ffc107;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
            }
            .verification-code h2 {
              margin: 0 0 10px 0;
              color: #856404;
              font-size: 18px;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #856404;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
            }
            .contact-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 ¡FELICIDADES ${name.toUpperCase()}! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Has ganado el sorteo</p>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${name}</strong>,</p>
            
            <p>¡Tenemos excelentes noticias! Has sido seleccionado/a como el <strong>GANADOR</strong> del sorteo:</p>
            
            <div class="prize-box">
              <h2 style="margin-top: 0; color: #667eea;">🎁 Premio Ganado</h2>
              <p><strong>Producto:</strong> ${productName}</p>
              ${productDescription ? `<p><strong>Descripción:</strong> ${productDescription}</p>` : ''}
              <p><strong>Valor:</strong> S/ ${productValue.toFixed(2)}</p>
              <p><strong>Ticket Ganador:</strong> #${ticketNumber}</p>
              <p><strong>ID del Sorteo:</strong> ${raffleId}</p>
              <p><strong>Fecha del Sorteo:</strong> ${formattedDate}</p>
            </div>

            <div class="verification-code">
              <h2>🔐 Tu Código Único de Ganador</h2>
              <div class="code">${verificationCode}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
                <strong>¡IMPORTANTE!</strong> Guarda este código. Lo necesitarás para reclamar tu premio.
              </p>
            </div>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Instrucciones Importantes:</strong></p>
              <ol style="margin: 10px 0 0 0;">
                <li>Ponte en contacto con el organizador usando los datos de contacto proporcionados abajo</li>
                <li>Proporciona tu <strong>código único de ganador</strong> al organizador para validar tu premio</li>
                <li>Coordina con el organizador la entrega de tu premio</li>
                <li>Una vez recibido el premio, confirma la recepción en nuestra plataforma</li>
              </ol>
            </div>

            <div class="contact-box">
              <h3 style="margin-top: 0; color: #667eea;">📞 Datos de Contacto del Organizador</h3>
              <p><strong>Organizador:</strong> ${shopName}</p>
              ${shopEmail ? `<p><strong>Email:</strong> <a href="mailto:${shopEmail}">${shopEmail}</a></p>` : ''}
              ${shopPhone ? `<p><strong>Teléfono:</strong> ${shopPhone}</p>` : ''}
              ${shopSocialMedia ? '<p><strong>Redes Sociales:</strong></p><ul>' + 
                (shopSocialMedia.facebook ? `<li>Facebook: <a href="${shopSocialMedia.facebook}" target="_blank">${shopSocialMedia.facebook}</a></li>` : '') +
                (shopSocialMedia.instagram ? `<li>Instagram: <a href="${shopSocialMedia.instagram}" target="_blank">${shopSocialMedia.instagram}</a></li>` : '') +
                (shopSocialMedia.whatsapp ? `<li>WhatsApp: ${shopSocialMedia.whatsapp}</li>` : '') +
                (shopSocialMedia.twitter ? `<li>Twitter: <a href="${shopSocialMedia.twitter}" target="_blank">${shopSocialMedia.twitter}</a></li>` : '') +
                '</ul>' : ''}
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                Por favor, contacta al organizador lo antes posible para coordinar la entrega de tu premio.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sorteos/${raffleId}/winner" class="button">
                Ver Detalles del Premio
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Nota:</strong> Tienes 7 días desde que el organizador suba la evidencia de entrega para confirmar 
              la recepción del premio. Si no confirmas en ese plazo, se dará por confirmada automáticamente con la 
              evidencia del organizador.
            </p>
          </div>

          <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Si tienes alguna pregunta o problema, contacta directamente al organizador o abre un reclamo en nuestra plataforma.</p>
            <p style="margin-top: 20px;">
              © ${new Date().getFullYear()} Plataforma de Sorteos. Todos los derechos reservados.
            </p>
          </div>
        </body>
        </html>
      `;

      console.log('📧 Correo de ganador preparado para:', email);
      console.log('Código de verificación:', verificationCode);
      console.log('HTML del correo:', emailHtml.substring(0, 200) + '...');
      
      return NextResponse.json(
        { 
          error: 'Error al enviar el correo de notificación',
          fallbackHtml: emailHtml
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending winner notification email:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo de notificación' },
      { status: 500 }
    );
  }
}