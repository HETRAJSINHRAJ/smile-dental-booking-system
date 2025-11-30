import { Timestamp } from 'firebase/firestore';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  providerId: string;
  providerName: string;
  appointmentId: string;
  rating: number; // 1-5
  comment: string;
  response?: string; // Admin response
  respondedBy?: string;
  respondedAt?: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number; // Count of helpful votes
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
