/**
 * Review Service for Admin Portal
 * Handle review moderation and provider rating updates
 */

import { db } from '../firebase/config';
import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { auditLogger } from '../audit';

class ReviewService {
  /**
   * Update provider rating based on approved reviews
   */
  async updateProviderRating(providerId: string): Promise<void> {
    try {
      // Get all approved reviews for the provider
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('providerId', '==', providerId),
        where('status', '==', 'approved')
      );

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data());

      if (reviews.length === 0) {
        // No approved reviews, set rating to 0
        const providerRef = doc(db, 'providers', providerId);
        await updateDoc(providerRef, {
          rating: 0,
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
          updatedAt: Timestamp.now(),
        });
        return;
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;

      // Calculate rating distribution
      const ratingDistribution = reviews.reduce(
        (dist, review) => {
          const rating = review.rating || 0;
          if (rating >= 1 && rating <= 5) {
            dist[rating as keyof typeof dist]++;
          }
          return dist;
        },
        { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      );

      // Update provider document
      const providerRef = doc(db, 'providers', providerId);
      await updateDoc(providerRef, {
        rating: Math.round(averageRating * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingDistribution,
        updatedAt: Timestamp.now(),
      });

      console.log(`Updated rating for provider ${providerId}: ${averageRating.toFixed(1)} (${reviews.length} reviews)`);
    } catch (error) {
      console.error('Error updating provider rating:', error);
      throw error;
    }
  }

  /**
   * Approve a review and update provider rating
   */
  async approveReview(
    reviewId: string, 
    providerId: string,
    adminUserId?: string,
    adminName?: string,
    adminEmail?: string
  ): Promise<void> {
    try {
      // Get review data before update for audit log
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      const beforeData = reviewSnap.data();
      
      await updateDoc(reviewRef, {
        status: 'approved',
        updatedAt: Timestamp.now(),
      });

      // Log review approval for audit trail
      if (adminUserId && adminName && adminEmail) {
        await auditLogger.logReviewAction(
          adminUserId,
          adminName,
          adminEmail,
          'admin',
          'review_approved',
          reviewId,
          beforeData as any,
          { ...beforeData, status: 'approved' } as any
        );
      }

      // Update provider rating
      await this.updateProviderRating(providerId);
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  }

  /**
   * Reject a review and update provider rating
   */
  async rejectReview(
    reviewId: string, 
    providerId: string,
    adminUserId?: string,
    adminName?: string,
    adminEmail?: string
  ): Promise<void> {
    try {
      // Get review data before update for audit log
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      const beforeData = reviewSnap.data();
      
      await updateDoc(reviewRef, {
        status: 'rejected',
        updatedAt: Timestamp.now(),
      });

      // Log review rejection for audit trail
      if (adminUserId && adminName && adminEmail) {
        await auditLogger.logReviewAction(
          adminUserId,
          adminName,
          adminEmail,
          'admin',
          'review_rejected',
          reviewId,
          beforeData as any,
          { ...beforeData, status: 'rejected' } as any
        );
      }

      // Update provider rating (in case this was previously approved)
      await this.updateProviderRating(providerId);
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }

  /**
   * Add admin response to a review
   */
  async addResponse(
    reviewId: string,
    response: string,
    adminName: string
  ): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        response: response.trim(),
        respondedBy: adminName,
        respondedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  }
}

export default new ReviewService();
