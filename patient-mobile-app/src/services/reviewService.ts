/**
 * Review Service for Mobile App
 * Handle review submission, fetching, and management
 */

import firestore from '@react-native-firebase/firestore';
import { Review, ReviewFormData, ReviewStats } from '../types/shared';

class ReviewService {
  private reviewsCollection = firestore().collection('reviews');

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
    reviewData: { rating: number; comment: string }
  ): Promise<string> {
    try {
      // Check if user already reviewed this appointment
      const existingReview = await this.getReviewByAppointment(userId, appointmentId);
      if (existingReview) {
        throw new Error('You have already reviewed this appointment');
      }

      const reviewDoc = await this.reviewsCollection.add({
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
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

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
      const snapshot = await this.reviewsCollection
        .where('providerId', '==', providerId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();

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
      const snapshot = await this.reviewsCollection
        .where('userId', '==', userId)
        .where('appointmentId', '==', appointmentId)
        .get();

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
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    try {
      await this.reviewsCollection.doc(reviewId).update({
        helpful: firestore.FieldValue.increment(1),
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
      const snapshot = await this.reviewsCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

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

export const reviewService = new ReviewService();

// Type definitions for review form data and stats
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
