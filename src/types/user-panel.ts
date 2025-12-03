export interface UserParticipation {
  id: string;
  raffleId: string;
  ticketNumbers: number[];
  purchaseDate: Date;
  ticketCount: number;
  raffleTitle: string;
  raffleImage?: string;
  shopName: string;
  raffleStatus: 'active' | 'sold_out' | 'finished' | 'cancelled';
  ticketsRemaining?: number;
  totalTickets?: number;
  soldTickets?: number;
  isWinner?: boolean;
  winnerTicketNumber?: number;
}

export interface UserWonRaffle {
  id: string;
  raffleId: string;
  raffleTitle: string;
  raffleImage?: string;
  productDescription?: string;
  ticketNumber: number;
  winDate: Date;
  shopName: string;
  shopEmail?: string;
  shopPhone?: string;
  deliveryStatus: 'pending' | 'in_process' | 'delivered';
  deliveryEvidence?: {
    photoUrl?: string;
    conversationScreenshot?: string;
    notes?: string;
  };
  canCreateComplaint: boolean;
}

export interface UserPurchaseHistory {
  id: string;
  purchaseDate: Date;
  raffleTitle: string;
  raffleId: string;
  ticketQuantity: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'failed' | 'refunded' | 'pending';
  paymentMethod?: string;
  transactionReference?: string;
  ticketNumbers?: number[];
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'raffle_won' | 'tickets_purchased' | 'raffle_finished' | 'complaint_response' | 'account_change' | 'system';
  relatedEntityId?: string;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  emailNotifications: boolean;
  emailPromotions: boolean;
  language: 'es' | 'en' | 'pt';
  timezone: string;
  privacyShowInitials: boolean;
  privacyHideTicketList: boolean;
}

export interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  activeSessions: number;
}

export interface UserPanelDashboard {
  totalParticipations: number;
  ticketsPurchasedThisMonth: number;
  activeRafflesNearEnd: UserParticipation[];
  newNotifications: number;
  wonRaffles: number;
  pendingDeliveries: number;
}

export interface UserComplaintSummary {
  id: string;
  complaintNumber: string;
  type: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  raffleTitle?: string;
}