import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getAllDocuments } from '../../lib/firestore';
import { Appointment } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';

const AppointmentsScreen: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      const data = await getAllDocuments<Appointment>('appointments', [
        { field: 'userId', operator: '==', value: user?.uid },
      ]);
      setAppointments(data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success.main;
      case 'pending':
        return colors.warning.main;
      case 'cancelled':
        return colors.error.main;
      case 'completed':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'ellipse';
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <Card style={styles.appointmentCard}>
      <TouchableOpacity style={styles.appointmentContent}>
        <View style={styles.appointmentHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <View style={styles.providerRow}>
              <Icon name="person" size={16} color={colors.text.secondary} />
              <Text style={styles.providerName}>{item.providerName}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Icon name={getStatusIcon(item.status)} size={14} color={colors.neutral.white} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="calendar" size={18} color={colors.primary[500]} />
            </View>
            <Text style={styles.detailText}>
              {new Date(item.appointmentDate.seconds * 1000).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="time" size={18} color={colors.primary[500]} />
            </View>
            <Text style={styles.detailText}>{item.startTime}</Text>
          </View>
        </View>

        <View style={styles.appointmentFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="information-circle-outline" size={20} color={colors.secondary[500]} />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          {item.status === 'confirmed' && (
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
              <Icon name="close-circle-outline" size={20} color={colors.error.main} />
              <Text style={[styles.actionButtonText, { color: colors.error.main }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="calendar-outline" size={80} color={colors.primary[300]} />
          </View>
          <Text style={styles.emptyTitle}>No Appointments</Text>
          <Text style={styles.emptyText}>
            You haven't booked any appointments yet.{'\n'}Start by booking your first appointment!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSubtitle}>{appointments.length} total bookings</Text>
      </View>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 160,
    height: 160,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  appointmentCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  appointmentContent: {
    gap: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  providerName: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    ...typography.labelSmall,
    color: colors.neutral.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  appointmentDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    ...typography.bodyMedium,
    color: colors.text.primary,
    flex: 1,
  },
  appointmentFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  cancelButton: {
    backgroundColor: colors.error.light,
  },
  actionButtonText: {
    ...typography.labelMedium,
    color: colors.secondary[500],
    fontWeight: '600',
  },
});

export default AppointmentsScreen;
