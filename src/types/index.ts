export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "ONLINE"
  | "CASH";

export type ProviderVerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type KycDocumentType =
  | "AADHAAR"
  | "PAN"
  | "DRIVING_LICENSE"
  | "POLICE_VERIFICATION";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface UserProfile {
  id: string;
  authId: string;
  name: string;
  email?: string | null;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string | null; // e.g. "Home", "Office"
  streetAddress: string;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears: number;
  verificationStatus: ProviderVerificationStatus;
  rejectionReason?: string | null;
  serviceRadiusKm: number;
  latitude: number;
  longitude: number;
  currentAddress: string;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  totalCompletedJobs: number;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankAccountName?: string | null;
  upiId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  imageUrl?: string | null;
  isActive: boolean;
  category?: ServiceCategory;
}

export interface ProviderService {
  id: string;
  providerId: string;
  serviceId: string;
  customPrice?: number | null;
  isAvailable: boolean;
  service?: ServiceItem;
}

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: string; // HH:mm format e.g. "09:00"
  endTime: string;   // HH:mm format e.g. "18:00"
  isBooked: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  addressId: string;
  status: BookingStatus;
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: string;      // e.g. "10:00 AM - 12:00 PM"
  customerNotes?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: UserRole | null;
  
  // Financial breakdown
  servicePrice: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  
  // Relations
  customer?: UserProfile;
  provider?: ProviderProfile & { user: UserProfile };
  service?: ServiceItem;
  address?: Address;
  payment?: Payment;
  review?: Review;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface Payout {
  id: string;
  providerId: string;
  bookingId: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  payoutReference?: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1 to 5
  comment?: string | null;
  providerReply?: string | null;
  createdAt: string;
  customer?: UserProfile;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "BOOKING" | "PAYMENT" | "SYSTEM" | "PROMOTION";
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: UserProfile;
}

export interface KycDocument {
  id: string;
  providerId: string;
  documentType: KycDocumentType;
  documentNumber: string;
  fileUrl: string;
  verificationStatus: ProviderVerificationStatus;
  notes?: string | null;
  uploadedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
