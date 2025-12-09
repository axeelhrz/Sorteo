import { httpsCallable, getFunctions } from 'firebase/functions';

const functions = getFunctions();

/**
 * Servicio para operaciones de admin en sorteos
 * Requiere que el usuario sea administrador
 */
export const raffleAdminService = {
  /**
   * Valida si el usuario actual es administrador
   */
  async validateAdminPermission(): Promise<boolean> {
    try {
      const validateAdmin = httpsCallable(functions, 'validateAdminPermission');
      const result = await validateAdmin({});
      return (result.data as any).isAdmin === true;
    } catch (error: any) {
      console.error('Error validating admin permission:', error);
      throw new Error(error.message || 'No tienes permisos de administrador');
    }
  },

  /**
   * Pausa un sorteo (solo admin)
   */
  async pauseRaffle(raffleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const pauseRaffleFunc = httpsCallable(functions, 'pauseRaffle');
      const result = await pauseRaffleFunc({ raffleId });
      return result.data as any;
    } catch (error: any) {
      console.error('Error pausing raffle:', error);
      throw new Error(error.message || 'Error al pausar el sorteo');
    }
  },

  /**
   * Reanuda un sorteo (solo admin)
   */
  async resumeRaffle(raffleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const resumeRaffleFunc = httpsCallable(functions, 'resumeRaffle');
      const result = await resumeRaffleFunc({ raffleId });
      return result.data as any;
    } catch (error: any) {
      console.error('Error resuming raffle:', error);
      throw new Error(error.message || 'Error al reanudar el sorteo');
    }
  },
};