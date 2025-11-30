import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Header } from '../../components/Header';
import { ReviewForm } from '../../components/ReviewForm';
import { Card } from '../../components/Card';
import { reviewService } from '../../services/reviewService';
import { Review } from '../../types/shared';
import { useAuth } from '../../contexts/AuthContext';

type RootStackParamList = {
  ReviewScreen: {
    appointmentId: string;
    providerId: string;
    providerName: string;
    userName: string;
    userEmail: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ReviewScreen'>;

export const ReviewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId, providerId, providerName, userName, userEmail } = route.params;
  const { user } = useAuth();
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExistingReview();
  }, []);

  const loadExistingReview = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const review = await reviewService.getReviewByAppointment(user.uid, appointmentId);
      setExistingReview(review);
    } catch (error) {
      console.error('Error loading review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    loadExistingReview();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#F59E0B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Approval';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Review" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Review" onBack={() => navigation.goBack()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{providerName}</Text>
          <Text style={styles.subtitle}>Share your experience</Text>
        </View>

        {existingReview ? (
          <Card style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>Your Review</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColor(existingReview.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(existingReview.status)}</Text>
              </View>
            </View>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={star <= existingReview.rating ? 'star' : 'star-outline'}
                  size={24}
                  color={star <= existingReview.rating ? '#FFC107' : '#E0E0E0'}
                />
              ))}
            </View>

            <Text style={styles.reviewComment}>{existingReview.comment}</Text>

            <Text style={styles.reviewDate}>
              Submitted on {existingReview.createdAt.toDate().toLocaleDateString()}
            </Text>

            {existingReview.response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>
                  Response from {providerName}
                </Text>
                <Text style={styles.responseText}>{existingReview.response}</Text>
                {existingReview.respondedAt && (
                  <Text style={styles.responseDate}>
                    Responded on {existingReview.respondedAt.toDate().toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Share Your Experience</Text>
            <Text style={styles.formSubtitle}>
              Help others by sharing your experience with {providerName}
            </Text>
            
            {user && (
              <ReviewForm
                userId={user.uid}
                userName={userName}
                userEmail={userEmail}
                providerId={providerId}
                providerName={providerName}
                appointmentId={appointmentId}
                onSuccess={handleReviewSuccess}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  providerInfo: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  providerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  reviewCard: {
    margin: 16,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  responseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  formCard: {
    margin: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
