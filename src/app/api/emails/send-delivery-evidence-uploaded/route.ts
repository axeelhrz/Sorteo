import { NextRequest, NextResponse } from 'next/server';
import { sendDeliveryEvidenceUploadedEmail } from '@/lib/emails/send-delivery-evidence-uploaded';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, raffleTitle, productName, organizerName, daysToConfirm } = body;

    if (!email || !name || !raffleTitle || !productName || !organizerName) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const messageId = await sendDeliveryEvidenceUploadedEmail({
      email,
      name,
      raffleTitle,
      productName,
      organizerName,
      daysToConfirm,
    });

    console.log('✅ Correo de evidencia subida enviado a:', email);
    return NextResponse.json({
      success: true,
      message: 'Correo enviado exitosamente',
      messageId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo';
    console.error('Error al enviar correo de evidencia subida:', error);
    return NextResponse.json(
      { error: 'Error al enviar el correo', details: message },
      { status: 500 }
    );
  }
}
