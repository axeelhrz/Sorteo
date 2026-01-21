import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  WinnerInfo,
  ValidateWinnerCodeDto,
  UploadDeliveryEvidenceDto,
  ConfirmDeliveryDto,
} from '@/types/raffle';

/**
 * Servicio para gestionar el flujo de verificación y entrega del premio al ganador
 */
export const winnerVerificationService = {
  /**
   * Genera un código único de verificación para el ganador
   * Formato: XXXX-XXXX-XXXX (12 caracteres alfanuméricos)
   */
  generateVerificationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 3;
    const segmentLength = 4;
    
    const code = Array.from({ length: segments }, () => {
      return Array.from({ length: segmentLength }, () => 
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join('');
    }).join('-');
    
    return code;
  },

  /**
   * Obtiene la información del ganador de un sorteo
   */
  async getWinnerInfo(raffleId: string): Promise<WinnerInfo | null> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }
      
      const data = raffleDoc.data();
      return data.winnerInfo || null;
    } catch (error) {
      console.error('Error getting winner info:', error);
      throw error;
    }
  },

  /**
   * Valida el código de verificación del ganador
   * El organizador ingresa este código para validar al ganador
   */
  async validateWinnerCode(data: ValidateWinnerCodeDto): Promise<{
    valid: boolean;
    winnerInfo?: WinnerInfo;
    message: string;
  }> {
    try {
      const raffleRef = doc(db, 'raffles', data.raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        return {
          valid: false,
          message: 'Sorteo no encontrado',
        };
      }
      
      const raffleData = raffleDoc.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;
      
      if (!winnerInfo) {
        return {
          valid: false,
          message: 'Este sorteo no tiene un ganador asignado',
        };
      }
      
      // Validar código (sin distinguir mayúsculas/minúsculas y sin espacios)
      const normalizedInputCode = data.verificationCode.toUpperCase().replace(/\s/g, '');
      const normalizedStoredCode = winnerInfo.verificationCode.toUpperCase().replace(/\s/g, '');
      
      if (normalizedInputCode !== normalizedStoredCode) {
        return {
          valid: false,
          message: 'Código de verificación incorrecto',
        };
      }
      
      // Actualizar estado si es la primera validación
      if (!winnerInfo.claimedAt) {
        await updateDoc(raffleRef, {
          'winnerInfo.claimedAt': serverTimestamp(),
          'winnerInfo.deliveryStatus': 'contacted',
          updatedAt: serverTimestamp(),
        });
        
        winnerInfo.claimedAt = new Date();
        winnerInfo.deliveryStatus = 'contacted';
      }
      
      return {
        valid: true,
        winnerInfo,
        message: 'Código válido. Ganador verificado correctamente.',
      };
    } catch (error) {
      console.error('Error validating winner code:', error);
      throw error;
    }
  },

  /**
   * Sube la evidencia de entrega del premio
   * El organizador sube fotos y notas sobre la entrega
   */
  async uploadDeliveryEvidence(
    data: UploadDeliveryEvidenceDto,
    uploadedBy: string
  ): Promise<WinnerInfo> {
    try {
      const raffleRef = doc(db, 'raffles', data.raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }
      
      const raffleData = raffleDoc.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;
      
      if (!winnerInfo) {
        throw new Error('Este sorteo no tiene un ganador asignado');
      }
      
      // Calcular fecha límite de confirmación (7 días desde la subida de evidencia)
      const deliveryDeadline = new Date();
      deliveryDeadline.setDate(deliveryDeadline.getDate() + 7);
      
      const deliveryEvidence = {
        photoUrl: data.photoUrl,
        uploadedAt: new Date(),
        uploadedBy,
        notes: data.notes,
        additionalPhotos: data.additionalPhotos || [],
      };
      
      await updateDoc(raffleRef, {
        'winnerInfo.deliveryEvidence': deliveryEvidence,
        'winnerInfo.deliveryStatus': 'delivered',
        'winnerInfo.deliveryDeadline': deliveryDeadline,
        updatedAt: serverTimestamp(),
      });
      
      winnerInfo.deliveryEvidence = deliveryEvidence;
      winnerInfo.deliveryStatus = 'delivered';
      winnerInfo.deliveryDeadline = deliveryDeadline;
      
      return winnerInfo;
    } catch (error) {
      console.error('Error uploading delivery evidence:', error);
      throw error;
    }
  },

  /**
   * Confirma la recepción del premio por parte del ganador
   * El ganador tiene 7 días para confirmar, sino se confirma automáticamente
   */
  async confirmDelivery(
    data: ConfirmDeliveryDto,
    userId: string
  ): Promise<WinnerInfo> {
    try {
      const raffleRef = doc(db, 'raffles', data.raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }
      
      const raffleData = raffleDoc.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;
      
      if (!winnerInfo) {
        throw new Error('Este sorteo no tiene un ganador asignado');
      }
      
      if (winnerInfo.userId !== userId) {
        throw new Error('No tienes permiso para confirmar esta entrega');
      }
      
      if (winnerInfo.deliveryStatus === 'confirmed') {
        throw new Error('La entrega ya ha sido confirmada');
      }
      
      await updateDoc(raffleRef, {
        'winnerInfo.deliveryStatus': 'confirmed',
        'winnerInfo.deliveryConfirmedAt': serverTimestamp(),
        'winnerInfo.deliveryConfirmedBy': userId,
        updatedAt: serverTimestamp(),
      });
      
      winnerInfo.deliveryStatus = 'confirmed';
      winnerInfo.deliveryConfirmedAt = new Date();
      winnerInfo.deliveryConfirmedBy = userId;
      
      return winnerInfo;
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  },

  /**
   * Verifica si la fecha límite de confirmación ha expirado
   * Si han pasado 7 días sin confirmación, se confirma automáticamente
   */
  async checkAndAutoConfirmDelivery(raffleId: string): Promise<boolean> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        return false;
      }
      
      const raffleData = raffleDoc.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;
      
      if (!winnerInfo || !winnerInfo.deliveryDeadline) {
        return false;
      }
      
      // Si ya está confirmado, no hacer nada
      if (winnerInfo.deliveryStatus === 'confirmed') {
        return false;
      }
      
      const now = new Date();
      const deadline = winnerInfo.deliveryDeadline instanceof Date 
        ? winnerInfo.deliveryDeadline 
        : new Date(winnerInfo.deliveryDeadline);
      
      // Si la fecha límite ha pasado, confirmar automáticamente
      if (now > deadline) {
        await updateDoc(raffleRef, {
          'winnerInfo.deliveryStatus': 'confirmed',
          'winnerInfo.deliveryConfirmedAt': serverTimestamp(),
          'winnerInfo.deliveryConfirmedBy': 'system_auto_confirm',
          updatedAt: serverTimestamp(),
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking auto-confirm delivery:', error);
      return false;
    }
  },

  /**
   * Actualiza el estado de entrega
   * Permite al organizador actualizar el estado durante el proceso
   */
  async updateDeliveryStatus(
    raffleId: string,
    status: WinnerInfo['deliveryStatus']
  ): Promise<WinnerInfo> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      const raffleDoc = await getDoc(raffleRef);
      
      if (!raffleDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }
      
      const raffleData = raffleDoc.data();
      const winnerInfo = raffleData.winnerInfo as WinnerInfo;
      
      if (!winnerInfo) {
        throw new Error('Este sorteo no tiene un ganador asignado');
      }
      
      await updateDoc(raffleRef, {
        'winnerInfo.deliveryStatus': status,
        updatedAt: serverTimestamp(),
      });
      
      winnerInfo.deliveryStatus = status;
      
      return winnerInfo;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  },
};