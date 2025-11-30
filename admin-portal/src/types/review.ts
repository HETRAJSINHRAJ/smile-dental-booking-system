import { Timestamp } from 'firebase/firestore';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  response?: string;
  respondedBy?: string;
  respondedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
