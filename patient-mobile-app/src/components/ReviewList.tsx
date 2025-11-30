import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from './Card';
import { reviewService, ReviewStats } from '../services/reviewService';
import { Review } from '../types/shared';
import { showToast } from './Toast';
import { colors, spacing, borderRadius } from '../theme';

interface ReviewListProps {
  providerId: string;
}

type SortOption = 'recent' | 'highest' | 'helpful';

export const ReviewList: React.FC<ReviewListProps> = ({ providerId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [providerId]);

  useEffect(() => {
    sortReviews(sortBy);
  }, [sortBy]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getProviderReviews(providerId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reviewService.getProviderReviewStats(providerId);
      setStats(data);
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const sortReviews = (option: SortOption) => {
    const sorted = [...reviews].sort((a, b) => {
      switch (option) {
        case 'highest':
          return b.rating - a.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        case 'recent':
        default:
          return b.createdAt.seconds - a.createdAt.seconds;
      }
    });
    setReviews(sorted);
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewService.markHelpful(reviewId);
      showToast('success', 'Thank you for your feedback!');
      loadReviews();
    } catch (error) {
      showToast('error', 'Failed to mark as helpful');
    }
  };

  const formatTimeAgo = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const renderRatingSummary = () => {
    if (!stats) return null;

    return (
      <Card style={styles.summaryCard}>
        <View style={styles.summaryContainer}>
          {/* Average Rating */}
          <View style={styles.averageSection}>
            <Text style={styles.averageRating}>{stats.averageRating.toFixed(1)}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= Math.round(stats.averageRating) ? 'star' : 'star-outline'}
                  size={24}
                  color={star <= Math.round(stats.averageRating) ? '#FFC107' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.totalReviews}>
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </Text>
          </View>

          {/* Rating Distribution */}
          <View style={styles.distributionSection}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

              return (
                <View key={rating} style={styles.distributionRow}>
                  <Text style={styles.ratingNumber}>{rating}</Text>
                  <Icon name="star" size={16} color="#FFC107" />
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Card>
    );
  };

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortTitle}>Customer Reviews</Text>
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'recent' && styles.sortButtonActive]}
          onPress={() => setSortBy('recent')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'recent' && styles.sortButtonTextActive]}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'highest' && styles.sortButtonActive]}
          onPress={() => setSortBy('highest')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'highest' && styles.sortButtonTextActive]}>
            Highest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'helpful' && styles.sortButtonActive]}
          onPress={() => setSortBy('helpful')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'helpful' && styles.sortButtonTextActive]}>
            Helpful
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.reviewHeaderContent}>
          <Text style={styles.userName}>{item.userName}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= item.rating ? 'star' : 'star-outline'}
                  size={16}
                  color={star <= item.rating ? '#FFC107' : '#E0E0E0'}
                />
              ))}
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>

      {item.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response from {item.providerName}</Text>
          <Text style={styles.responseText}>{item.response}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.helpfulButton}
        onPress={() => handleMarkHelpful(item.id)}
      >
        <Icon name="thumb-up-outline" size={16} color="#6B7280" />
        <Text style={styles.helpfulText}>Helpful ({item.helpful})</Text>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      {renderRatingSummary()}
      {renderSortOptions()}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  averageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  distributionSection: {
    flex: 1,
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    width: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC107',
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
    width: 24,
    textAlign: 'right',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  sortButtonActive: {
    backgroundColor: '#2563EB',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewHeaderContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
  },
  comment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  responseContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  responseTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  helpfulText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
