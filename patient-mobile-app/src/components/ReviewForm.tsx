import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from './Button';
import { reviewService } from '../services/reviewService';
import { showToast } from './Toast';
import { trackReviewSubmitted } from '../lib/analytics';

interface ReviewFormProps {
  userId: string;
  userName: string;
  userEmail: string;
  providerId: string;
  providerName: string;
  appointmentId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  userId,
  userName,
  userEmail,
  providerId,
  providerName,
  appointmentId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('error', 'Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      showToast('error', 'Please write at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewService.submitReview(
        userId,
        userName,
        userEmail,
        providerId,
        providerName,
        appointmentId,
        { rating, comment }
      );

      showToast('success', 'Review submitted successfully! It will be visible after approval.');
      trackReviewSubmitted(providerId, rating);
      
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Rate your experience</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Icon
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#FFC107' : '#E0E0E0'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Share your experience</Text>
        <TextInput
          style={styles.textArea}
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us about your visit..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500 characters</Text>
      </View>

      <Button
        title={isSubmitting ? 'Submitting...' : 'Submit Review'}
        onPress={handleSubmit}
        disabled={isSubmitting || rating === 0}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 120,
    backgroundColor: '#FFFFFF',
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: 8,
  },
});
