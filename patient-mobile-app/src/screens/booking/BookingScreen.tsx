import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';

type BookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BookingScreen: React.FC = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();

  const quickActions = [
    {
      icon: 'calendar-outline',
      title: 'Book Appointment',
      subtitle: 'Schedule a new visit',
      color: colors.primary[500],
      bgColor: colors.primary[50],
      onPress: () => navigation.navigate('SelectService'),
    },
    {
      icon: 'time-outline',
      title: 'View Appointments',
      subtitle: 'Check your bookings',
      color: colors.secondary[500],
      bgColor: colors.accent.light,
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      icon: 'medical-outline',
      title: 'Browse Services',
      subtitle: 'Explore our services',
      color: colors.primary[600],
      bgColor: colors.primary[100],
      onPress: () => navigation.navigate('Services'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="calendar" size={80} color={colors.primary[500]} />
          </View>
          <Text style={styles.title}>Book an Appointment</Text>
          <Text style={styles.subtitle}>
            Schedule your dental appointment in just a few simple steps
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <Card key={index} style={styles.actionCard}>
              <TouchableOpacity style={styles.actionContent} onPress={action.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: action.bgColor }]}>
                  <Icon name={action.icon} size={32} color={action.color} />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SelectService')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Icon name="arrow-forward" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  actionsContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  actionCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  primaryButton: {
    backgroundColor: colors.secondary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.medium,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default BookingScreen;
