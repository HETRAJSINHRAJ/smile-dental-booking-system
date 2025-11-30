/**
 * Optimized List Item Components
 * 
 * These components are wrapped with React.memo to prevent unnecessary re-renders
 * when parent components update but the item data hasn't changed.
 */
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { OptimizedImage } from './OptimizedImage';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Provider, Service } from '../types/firebase';

// ============================================
// Provider List Item
// ============================================
interface ProviderListItemProps {
  provider: Provider;
  onPress: (provider: Provider) => void;
  style?: StyleProp<ViewStyle>;
}

export const ProviderListItem = memo<ProviderListItemProps>(
  ({ provider, onPress, style }) => {
    return (
      <TouchableOpacity
        style={[styles.providerCard, style]}
        onPress={() => onPress(provider)}
        activeOpacity={0.7}
      >
        <View style={styles.providerImageContainer}>
          <OptimizedImage
            uri={provider.imageUrl}
            style={styles.providerImage}
            fallbackIcon="person"
            fallbackIconSize={48}
            fallbackIconColor={colors.secondary[500]}
          />
          {provider.rating && (
            <View style={styles.ratingBadge}>
              <Icon name="star" size={12} color="#FCD34D" />
              <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.providerDetails}>
          <Text style={styles.providerName} numberOfLines={1}>
            {provider.name}
          </Text>
          <Text style={styles.providerSpecialty} numberOfLines={1}>
            {provider.specialty}
          </Text>
          {provider.bio && (
            <Text style={styles.providerBio} numberOfLines={2}>
              {provider.bio}
            </Text>
          )}
          <View style={styles.providerFooter}>
            <View style={styles.experienceContainer}>
              <Icon name="time-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.experienceText}>
                {provider.yearsOfExperience}y exp
              </Text>
            </View>
            {provider.acceptingNewPatients && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.provider.id === nextProps.provider.id &&
      prevProps.provider.rating === nextProps.provider.rating &&
      prevProps.provider.imageUrl === nextProps.provider.imageUrl &&
      prevProps.provider.acceptingNewPatients === nextProps.provider.acceptingNewPatients
    );
  }
);

ProviderListItem.displayName = 'ProviderListItem';

// ============================================
// Service List Item
// ============================================
interface ServiceListItemProps {
  service: Service;
  onPress: (service: Service) => void;
  index: number;
  style?: StyleProp<ViewStyle>;
}

export const ServiceListItem = memo<ServiceListItemProps>(
  ({ service, onPress, index, style }) => {
    const bgColors = [
      colors.primary[100],
      colors.primary[50],
      colors.accent.light,
      colors.secondary[500],
    ];
    const isDark = index % 4 === 3;
    const bgColor = bgColors[index % 4];

    return (
      <TouchableOpacity
        style={[styles.serviceCard, { backgroundColor: bgColor }, style]}
        onPress={() => onPress(service)}
        activeOpacity={0.7}
      >
        <View style={styles.serviceHeader}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Icon
              name="medical"
              size={24}
              color={isDark ? colors.neutral.white : colors.secondary[500]}
            />
          </View>
        </View>
        <Text
          style={[styles.serviceName, isDark && styles.textWhite]}
          numberOfLines={2}
        >
          {service.name}
        </Text>
        <Text
          style={[styles.serviceDescription, isDark && styles.textWhiteOpacity]}
          numberOfLines={2}
        >
          {service.description}
        </Text>
        <View style={styles.serviceFooter}>
          <View style={styles.priceSection}>
            <Text style={[styles.servicePrice, isDark && styles.textWhite]}>
              ₹{service.price}
            </Text>
            <Text style={[styles.priceLabel, isDark && styles.textWhiteOpacity]}>
              Per session
            </Text>
          </View>
          <View style={styles.durationBadge}>
            <Icon
              name="time-outline"
              size={14}
              color={isDark ? colors.neutral.white : colors.text.secondary}
            />
            <Text style={[styles.durationText, isDark && styles.textWhiteOpacity]}>
              {service.duration}m
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.service.id === nextProps.service.id &&
      prevProps.service.price === nextProps.service.price &&
      prevProps.index === nextProps.index
    );
  }
);

ServiceListItem.displayName = 'ServiceListItem';

// ============================================
// Doctor Card Item (for Home Screen)
// ============================================
interface DoctorCardItemProps {
  provider: Provider;
  onPress: (provider: Provider) => void;
  style?: StyleProp<ViewStyle>;
}

export const DoctorCardItem = memo<DoctorCardItemProps>(
  ({ provider, onPress, style }) => {
    return (
      <TouchableOpacity
        style={[styles.doctorCard, style]}
        onPress={() => onPress(provider)}
        activeOpacity={0.7}
      >
        <View style={styles.doctorContent}>
          <OptimizedImage
            uri={provider.imageUrl}
            style={styles.doctorAvatar}
            fallbackIcon="person"
            fallbackIconSize={32}
            fallbackIconColor={colors.secondary[500]}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{provider.name}</Text>
            <Text style={styles.doctorSpecialty}>{provider.specialty}</Text>
            <View style={styles.doctorMeta}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FCD34D" />
                <Text style={styles.ratingTextSmall}>{provider.rating || 4.6}</Text>
              </View>
              <View style={styles.experienceContainerSmall}>
                <Icon name="time-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.experienceTextSmall}>
                  {provider.yearsOfExperience} Years
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.bookDoctorButton}>
            <Icon name="arrow-forward" size={20} color={colors.secondary[500]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.provider.id === nextProps.provider.id &&
      prevProps.provider.rating === nextProps.provider.rating &&
      prevProps.provider.imageUrl === nextProps.provider.imageUrl
    );
  }
);

DoctorCardItem.displayName = 'DoctorCardItem';

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  // Provider Card Styles
  providerCard: {
    width: '48%',
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.small,
  },
  providerImageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: colors.primary[50],
  },
  providerImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    ...shadows.small,
  },
  ratingText: {
    ...typography.labelSmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  providerDetails: {
    padding: spacing.md,
  },
  providerName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerSpecialty: {
    ...typography.labelMedium,
    color: colors.secondary[500],
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  providerBio: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
    minHeight: 36,
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    fontSize: 11,
  },
  availableBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  availableText: {
    ...typography.labelSmall,
    color: '#065F46',
    fontWeight: '600',
    fontSize: 10,
  },

  // Service Card Styles
  serviceCard: {
    width: '47.5%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    minHeight: 200,
    ...shadows.small,
    position: 'relative',
  },
  serviceHeader: {
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  serviceName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    minHeight: 44,
  },
  serviceDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
    minHeight: 36,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  priceSection: {
    flexDirection: 'column',
  },
  servicePrice: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '700',
  },
  priceLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontSize: 11,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  durationText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    fontSize: 11,
  },
  textWhite: {
    color: colors.neutral.white,
  },
  textWhiteOpacity: {
    color: colors.neutral.white,
    opacity: 0.7,
  },

  // Doctor Card Styles
  doctorCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  doctorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorSpecialty: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingTextSmall: {
    ...typography.labelSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  experienceContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceTextSmall: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  bookDoctorButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
