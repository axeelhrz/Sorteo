export interface RegistrationEmailData {
  email: string;
  name: string;
  username: string;
  password: string;
  role: string;
}

export interface WinnerNotificationEmailData {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle: string;
  productName: string;
  productDescription: string;
  productValue: number;
  ticketNumber: number;
  verificationCode: string;
  shopName: string;
  shopEmail?: string;
  shopPhone?: string;
  shopSocialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  winDate: Date;
}

export interface WinnerCodeValidatedEmailData {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle: string;
  productName: string;
  organizerName: string;
}

export interface DeliveryEvidenceUploadedEmailData {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle: string;
  productName: string;
  organizerName: string;
  daysToConfirm: number;
}

export interface DeliveryConfirmedEmailData {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle: string;
  productName: string;
  winnerName: string;
}

export interface DeliveryReminderEmailData {
  email: string;
  name: string;
  raffleId: string;
  raffleTitle: string;
  productName: string;
  daysRemaining: number;
}

export interface OpportunityUnderReviewEmailData {
  email: string;
  organizerName: string;
  productName: string;
  raffleId?: string;
}

export interface OrganizerPaymentDoneEmailData {
  email: string;
  organizerName: string;
  raffleId: string;
  productName: string;
  amountPaid?: number;
  paymentEvidenceUrl?: string;
}

/**
 * Servicio de correos
 * Nota: Requiere configuración de Cloud Functions en Firebase
 * Para desarrollo, los correos se pueden simular o usar un servicio externo
 */
export const emailService = {
  /**
   * Envía correo de confirmación de registro
   */
  async sendRegistrationEmail(data: RegistrationEmailData): Promise<void> {
    try {
      // Llamar a API backend para enviar correo
      const response = await fetch('/api/emails/send-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          username: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      if (!response.ok) {
        console.warn('Error sending registration email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending registration email:', error);
      // No lanzar error para no bloquear el registro
    }
  },

  /**
   * Envía correo de recuperación de contraseña
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar correo de recuperación');
      }
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw new Error('Error al enviar correo de recuperación');
    }
  },

  /**
   * Envía correo de confirmación de cambio de contraseña
   */
  async sendPasswordChangeConfirmation(email: string, name: string): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        console.warn('Error sending password change confirmation:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending password change confirmation:', error);
      // No lanzar error para no bloquear el cambio de contraseña
    }
  },

  /**
   * Envía correo al organizador indicando que su solicitud de oportunidad está en revisión
   */
  async sendOpportunityUnderReviewEmail(data: OpportunityUnderReviewEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-opportunity-under-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          organizerName: data.organizerName,
          productName: data.productName,
          raffleId: data.raffleId,
        }),
      });

      if (!response.ok) {
        console.warn('Error sending opportunity under review email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending opportunity under review email:', error);
      // No lanzar error para no bloquear el flujo de creación
    }
  },

  /**
   * Envía correo al organizador indicando que se procedió con el pago del producto
   */
  async sendOrganizerPaymentDoneEmail(data: OrganizerPaymentDoneEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-organizer-payment-done', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          organizerName: data.organizerName,
          raffleId: data.raffleId,
          productName: data.productName,
          amountPaid: data.amountPaid,
          paymentEvidenceUrl: data.paymentEvidenceUrl,
        }),
      });

      if (!response.ok) {
        console.warn('Error sending organizer payment done email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending organizer payment done email:', error);
    }
  },

  /**
   * Envía correo de notificación al ganador del sorteo
   * Incluye toda la información relevante del sorteo, producto, organizador y código de verificación
   */
  async sendWinnerNotificationEmail(data: WinnerNotificationEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-winner-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          raffleId: data.raffleId,
          raffleTitle: data.raffleTitle,
          productName: data.productName,
          productDescription: data.productDescription,
          productValue: data.productValue,
          ticketNumber: data.ticketNumber,
          verificationCode: data.verificationCode,
          shopName: data.shopName,
          shopEmail: data.shopEmail,
          shopPhone: data.shopPhone,
          shopSocialMedia: data.shopSocialMedia,
          winDate: data.winDate.toISOString(),
        }),
      });

      if (!response.ok) {
        console.warn('Error sending winner notification email:', response.statusText);
        throw new Error('Error al enviar correo de notificación al ganador');
      }
    } catch (error: any) {
      console.error('Error sending winner notification email:', error);
      throw new Error('Error al enviar correo de notificación al ganador');
    }
  },

  /**
   * Envía correo al ganador cuando su código es validado por el organizador
   */
  async sendWinnerCodeValidatedEmail(data: WinnerCodeValidatedEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-winner-code-validated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending winner code validated email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending winner code validated email:', error);
      // No lanzar error para no bloquear el flujo
    }
  },

  /**
   * Envía correo al ganador cuando el organizador sube evidencia de entrega
   */
  async sendDeliveryEvidenceUploadedEmail(data: DeliveryEvidenceUploadedEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-delivery-evidence-uploaded', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending delivery evidence uploaded email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending delivery evidence uploaded email:', error);
      // No lanzar error para no bloquear el flujo
    }
  },

  /**
   * Envía correo al organizador cuando el ganador confirma la recepción
   */
  async sendDeliveryConfirmedEmail(data: DeliveryConfirmedEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-delivery-confirmed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending delivery confirmed email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending delivery confirmed email:', error);
      // No lanzar error para no bloquear el flujo
    }
  },

  /**
   * Envía correo de recordatorio al ganador si faltan 2 días para expirar
   */
  async sendDeliveryReminderEmail(data: DeliveryReminderEmailData): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-delivery-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending delivery reminder email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending delivery reminder email:', error);
      // No lanzar error para no bloquear el flujo
    }
  },

  /**
   * Envía correo cuando el pago está siendo validado
   */
  async sendPaymentValidationEmail(data: {
    email: string;
    name: string;
    ticketQuantity: number;
    amount: number;
    paymentMethod: string;
  }): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-payment-validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending payment validation email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending payment validation email:', error);
    }
  },

  /**
   * Envía correo cuando la validación OCR falla
   */
  async sendPaymentValidationFailedEmail(data: {
    email: string;
    name: string;
    ticketQuantity: number;
    amount: number;
    paymentMethod: string;
    reason: string;
    paymentId: string;
  }): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-payment-validation-failed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending payment validation failed email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending payment validation failed email:', error);
    }
  },

  /**
   * Envía correo cuando el pago es aprobado
   */
  async sendPaymentApprovedEmail(data: {
    email: string;
    name: string;
    raffleName: string;
    ticketQuantity: number;
    amount: number;
    paymentMethod: string;
  }): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-payment-approved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending payment approved email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending payment approved email:', error);
    }
  },

  /**
   * Envía correo cuando el pago es rechazado
   */
  async sendPaymentRejectedEmail(data: {
    email: string;
    name: string;
    amount: number;
    ticketQuantity: number;
    paymentMethod: string;
    rejectionReason: string;
    paymentId: string;
  }): Promise<void> {
    try {
      const response = await fetch('/api/emails/send-payment-rejected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Error sending payment rejected email:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error sending payment rejected email:', error);
    }
  },
};