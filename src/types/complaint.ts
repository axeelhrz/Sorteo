export enum ComplaintType {
  PRIZE_NOT_DELIVERED = 'prize_not_delivered',
  DIFFERENT_PRODUCT = 'different_product',
  PURCHASE_PROBLEM = 'purchase_problem',
  ORGANIZER_BEHAVIOR = 'organizer_behavior',
  SHOP_BEHAVIOR = 'organizer_behavior', // Alias para compatibilidad
  RAFFLE_FRAUD = 'raffle_fraud',
  TECHNICAL_ISSUE = 'technical_issue',
  PAYMENT_ERROR = 'payment_error',
}

export enum ComplaintStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ComplaintResolution {
  RESOLVED_USER_FAVOR = 'resolved_user_favor',
  RESOLVED_ORGANIZER_FAVOR = 'resolved_organizer_favor',
  RESOLVED_SHOP_FAVOR = 'resolved_organizer_favor', // Alias para compatibilidad
  RESOLVED_PLATFORM_FAVOR = 'resolved_platform_favor',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  senderId: string;
  senderType: 'user' | 'admin' | 'organizer' | 'shop';
  message: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  uploader: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  userId: string;
  organizerId?: string;
  shopId?: string; // Alias para compatibilidad
  raffleId?: string;
  paymentId?: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  resolution?: ComplaintResolution;
  assignedAdminId?: string;
  resolutionNotes?: string;
  maxResponseDate: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  organizer?: {
    id: string;
    name: string;
  };
  shop?: { // Alias para compatibilidad
    id: string;
    name: string;
  };
  raffle?: {
    id: string;
  };
  assignedAdmin?: {
    id: string;
    name: string;
    email: string;
  };
  messages?: ComplaintMessage[];
  attachments?: ComplaintAttachment[];
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  rejected: number;
  byType: Array<{
    type: ComplaintType;
    count: number;
  }>;
}