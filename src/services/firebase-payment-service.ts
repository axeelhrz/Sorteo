import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export interface CreatePaymentData {
  raffleId: string;
  amount: number;
  ticketQuantity: number;
}

export interface Payment {
  id: string;
  raffleId: string;
  userId: string;
  amount: number;
  ticketQuantity: number;
  status: 'pending' | 'pending_validation' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'yape' | 'plin' | 'dale';
  voucherUrl?: string;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  voucherUploadedAt?: string;
  completedAt?: string;
  failedAt?: string;
  // OCR fields
  ocrProcessed?: boolean;
  ocrExtractedAmount?: number;
  ocrConfidence?: number;
  ocrValid?: boolean;
  ocrMessage?: string;
  ocrProcessedAt?: string;
  // Approval fields
  approvedBy?: string;
  rejectedBy?: string;
}

const convertTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

export const firebasePaymentService = {
  /**
   * Create a new payment
   */
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be authenticated');
      }

      const paymentsRef = collection(db, 'payments');
      const paymentData = {
        raffleId: data.raffleId,
        userId: user.uid,
        amount: data.amount,
        ticketQuantity: data.ticketQuantity,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(paymentsRef, paymentData);

      return {
        id: docRef.id,
        ...paymentData,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);

      if (!paymentSnap.exists()) {
        throw new Error('Payment not found');
      }

      const data = paymentSnap.data();
      return {
        id: paymentSnap.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        voucherUploadedAt: convertTimestamp(data.voucherUploadedAt),
        completedAt: convertTimestamp(data.completedAt),
        failedAt: convertTimestamp(data.failedAt),
        ocrProcessedAt: convertTimestamp(data.ocrProcessedAt),
      } as Payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Confirm payment with voucher upload
   */
  async confirmPaymentWithVoucher(
    paymentId: string,
    voucherFile: File,
    paymentMethod: 'yape' | 'plin' | 'dale'
  ): Promise<Payment> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Upload voucher to Firebase Storage
      const timestamp = Date.now();
      const fileName = `vouchers/${paymentId}_${timestamp}_${voucherFile.name}`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, voucherFile, {
        contentType: voucherFile.type,
      });

      // Get download URL
      const voucherUrl = await getDownloadURL(storageRef);

      // Update payment document
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: 'pending_validation',
        paymentMethod,
        voucherUrl,
        voucherUploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ocrProcessed: false,
      };

      await updateDoc(paymentRef, updateData);

      // Get updated payment
      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Error confirming payment with voucher:', error);
      throw error;
    }
  },

  /**
   * Get all payments (for admin history)
   */
  async getAllPayments(maxLimit = 500): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        orderBy('createdAt', 'desc'),
        firestoreLimit(maxLimit)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          voucherUploadedAt: convertTimestamp(data.voucherUploadedAt),
          completedAt: convertTimestamp(data.completedAt),
          failedAt: convertTimestamp(data.failedAt),
          ocrProcessedAt: convertTimestamp(data.ocrProcessedAt),
        } as Payment;
      });
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  },

  /**
   * Get all pending validation payments (for admin)
   */
  async getPendingValidationPayments(): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('status', '==', 'pending_validation')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          voucherUploadedAt: convertTimestamp(data.voucherUploadedAt),
          completedAt: convertTimestamp(data.completedAt),
          failedAt: convertTimestamp(data.failedAt),
          ocrProcessedAt: convertTimestamp(data.ocrProcessedAt),
        } as Payment;
      });
    } catch (error) {
      console.error('Error fetching pending validation payments:', error);
      throw error;
    }
  },

  /**
   * Approve payment (admin only)
   */
  async approvePayment(paymentId: string, adminId: string): Promise<Payment> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: 'completed',
        approvedBy: adminId,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(paymentRef, updateData);

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  },

  /**
   * Reject payment (admin only)
   */
  async rejectPayment(
    paymentId: string,
    adminId: string,
    reason: string
  ): Promise<Payment> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: 'failed',
        rejectedBy: adminId,
        failureReason: reason,
        failedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(paymentRef, updateData);

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Error rejecting payment:', error);
      throw error;
    }
  },

  /**
   * Update OCR validation result
   */
  async updateOCRValidation(
    paymentId: string,
    ocrResult: {
      extractedAmount?: number;
      confidence?: number;
      isValid: boolean;
      message: string;
    }
  ): Promise<void> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        ocrProcessed: true,
        ocrExtractedAmount: ocrResult.extractedAmount || null,
        ocrConfidence: ocrResult.confidence || null,
        ocrValid: ocrResult.isValid,
        ocrMessage: ocrResult.message,
        ocrProcessedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(paymentRef, updateData);
    } catch (error) {
      console.error('Error updating OCR validation:', error);
      throw error;
    }
  },

  /**
   * Confirm payment (direct)
   */
  async confirmPayment(paymentId: string, transactionId?: string): Promise<Payment> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: 'completed',
        transactionId: transactionId || null,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(paymentRef, updateData);

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Fail a payment
   */
  async failPayment(paymentId: string, failureReason: string): Promise<Payment> {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      const updateData = {
        status: 'failed',
        failureReason,
        failedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(paymentRef, updateData);

      return await this.getPaymentById(paymentId);
    } catch (error) {
      console.error('Error failing payment:', error);
      throw error;
    }
  },

  /**
   * Get user's payments
   */
  async getMyPayments(): Promise<Payment[]> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be authenticated');
      }

      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          voucherUploadedAt: convertTimestamp(data.voucherUploadedAt),
          completedAt: convertTimestamp(data.completedAt),
          failedAt: convertTimestamp(data.failedAt),
          ocrProcessedAt: convertTimestamp(data.ocrProcessedAt),
        } as Payment;
      });
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  },

  /**
   * Get payments by raffle ID
   */
  async getPaymentsByRaffleId(raffleId: string): Promise<Payment[]> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('raffleId', '==', raffleId),
        where('status', '==', 'completed')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          voucherUploadedAt: convertTimestamp(data.voucherUploadedAt),
          completedAt: convertTimestamp(data.completedAt),
          failedAt: convertTimestamp(data.failedAt),
          ocrProcessedAt: convertTimestamp(data.ocrProcessedAt),
        } as Payment;
      });
    } catch (error) {
      console.error('Error fetching raffle payments:', error);
      throw error;
    }
  },
};