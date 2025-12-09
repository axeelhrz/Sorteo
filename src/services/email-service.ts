export interface RegistrationEmailData {
  email: string;
  name: string;
  username: string;
  password: string;
  role: string;
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
};