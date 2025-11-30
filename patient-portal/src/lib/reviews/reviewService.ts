/**
 * Review Service
 * Handle review submission, fetching, and management
 */

import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { Review, ReviewFormData, ReviewStats } from '@/types/review';

class ReviewService {
  private reviewsCollection = collection(db, 'reviews');

  /**
   * Submit a new review
   */
  async submitReview(
    userId: string,
    userName: string,
    userEmail: string,
    providerId: string,
    providerName: string,
    appointmentId: string,
    reviewData: ReviewFormData
  ): Promise<string> {
    try {
      // Check if user already reviewed this appointment
      const existingReview = await this.getReviewByAppointment(userId, appointmentId);
      if (existingReview) {
        throw new Error('You have already reviewed this appointment');
      }

      const reviewDoc = await addDoc(this.reviewsCollection, {
        userId,
        userName,
        userEmail,
        providerId,
        providerName,
        appointmentId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: 'pending',
        helpful: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update provider rating
      await this.updateProviderRating(providerId);

      return reviewDoc.id;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a provider
   */
  async getProviderReviews(providerId: string, status: string = 'approved'): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where('providerId', '==', providerId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
    } catch (error) {
      console.error('Error fetching provider reviews:', error);
      return [];
    }
  }

  /**
   * Get review by appointment
   */
  async getReviewByAppointment(userId: string, appointmentId: string): Promise<Review | null> {
    try {
      const q = query(
        this.reviewsCollection,
        where('userId', '==', userId),
        where('appointmentId', '==', appointmentId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Review;
    } catch (error) {
      console.error('Error fetching review:', error);
      return null;
    }
  }

  /**
   * Get review statistics for a provider
   */
  async getProviderReviewStats(providerId: string): Promise<ReviewStats> {
    try {
      const reviews = await this.getProviderReviews(providerId);

      if (reviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = reviews.reduce(
        (dist, review) => {
          dist[review.rating as keyof typeof dist]++;
          return dist;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      );

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution,
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }

  /**
   * Update provider rating in providers collection
   */
  private async updateProviderRating(providerId: string): Promise<void> {
    try {
      const stats = await this.getProviderReviewStats(providerId);
      const providerRef = doc(db, 'providers', providerId);

      await updateDoc(providerRef, {
        rating: stats.averageRating,
        totalReviews: stats.totalReviews,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating provider rating:', error);
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        helpful: increment(1),
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const q = query(
        this.reviewsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }
}

export default new ReviewService();
