import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllDocuments } from '../../lib/firestore';
import { Provider, Service } from '../../types/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { OptimizedImage } from '../../components/OptimizedImage';
import { useMountedRef } from '../../hooks/usePerformance';

type SelectProviderScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectProvider'
>;
type SelectProviderScreenRouteProp = RouteProp<RootStackParamList, 'SelectProvider'>;

interface Props {
  navigation: SelectProviderScreenNavigationProp;
  route: SelectProviderScreenRouteProp;
}

const SPECIALTIES = [
  { id: 'all', name: 'All' },
  { id: 'General Dentistry', name: 'General' },
  { id: 'Orthodontics', name: 'Orthodontics' },
  { id: 'Periodontics', name: 'Periodontics' },
  { id: 'Endodontics', name: 'Endodontics' },
  { id: 'Oral Surgery', name: 'Surgery' },
  { id: 'Pediatric Dentistry', name: 'Pediatric' },
];

// Memoized Provider Card component
const ProviderCard = memo<{
  provider: Provider;
  onPress: (provider: Provider) => void;
}>(({ provider, onPress }) => (
  <TouchableOpacity
    style={styles.providerCard}
    onPress={() => onPress(provider)}
    activeOpacity={0.7}
  >
    {/* Provider Photo */}
    <View style={styles.providerImageContainer}>
      <OptimizedImage
        uri={provider.imageUrl}
        style={styles.providerImage}
        fallbackIcon="person"
        fallbackIconSize={48}
        fallbackIconColor={colors.secondary[500]}
      />
      
      {/* Rating Badge */}
      {provider.rating && (
        <View style={styles.ratingBadge}>
          <Icon name="star" size={12} color="#FCD34D" />
          <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
        </View>
      )}
    </View>

    {/* Provider Details */}
    <View style={styles.providerDetails}>
      <Text style={styles.providerName} numberOfLines={1}>
        {provider.name}
      </Text>
      <Text style={styles.providerSpecialty} numberOfLines={1}>
        {provider.specialty}
      </Text>
      
      <Text style={styles.providerBio} numberOfLines={2}>
        {provider.bio}
      </Text>

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
));

ProviderCard.displayName = 'ProviderCard';

const SelectProviderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { serviceId } = route.params;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const isMounted = useMountedRef();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const loadData = useCallback(async () => {
    try {
      const [providersData, servicesData] = await Promise.all([
        getAllDocuments<Provider>('providers', []),
        getAllDocuments<Service>('services', []),
      ]);
      
      if (isMounted.current) {
        const selectedService = servicesData.find(s => s.id === serviceId);
        setService(selectedService || null);
        setProviders(providersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [serviceId, isMounted]);

  const handleProviderSelect = useCallback((provider: Provider) => {
    navigation.navigate('SelectDateTime', {
      serviceId,
      providerId: provider.id,
    });
  }, [navigation, serviceId]);

  // Memoize filtered providers to prevent recalculation on every render
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const offersService = provider.serviceIds && provider.serviceIds.includes(serviceId);
      if (!offersService) return false;
      
      return filterSpecialty === 'all' || provider.specialty === filterSpecialty;
    });
  }, [providers, serviceId, filterSpecialty]);


  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Icon name="people-outline" size={48} color={colors.text.secondary} />
      </View>
      <Text style={styles.emptyTitle}>No providers found</Text>
      <Text style={styles.emptyText}>
        Try selecting a different specialty or contact us for assistance
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setFilterSpecialty('all')}
      >
        <Text style={styles.emptyButtonText}>Show All Providers</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
        <ActivityIndicator size="large" color={colors.secondary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Select Provider</Text>
          
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerBorder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Icon name="checkmark" size={16} color={colors.neutral.white} />
            </View>
            <Text style={styles.progressLabelActive}>Service</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Text style={styles.progressCircleTextActive}>2</Text>
            </View>
            <Text style={styles.progressLabelActive}>Provider</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Date & Time</Text>
          </View>
        </View>

        {/* Selected Service Info */}
        {service && (
          <View style={styles.serviceInfoContainer}>
            <Card style={styles.serviceInfoCard}>
              <View style={styles.serviceInfoContent}>
                <View style={styles.serviceInfoLeft}>
                  <Text style={styles.serviceInfoLabel}>Selected Service</Text>
                  <Text style={styles.serviceInfoName}>{service.name}</Text>
                </View>
                <View style={styles.serviceInfoRight}>
                  <View style={styles.serviceDurationBadge}>
                    <Icon name="time-outline" size={14} color={colors.text.secondary} />
                    <Text style={styles.serviceDurationText}>{service.duration} min</Text>
                  </View>
                  <Text style={styles.serviceInfoPrice}>₹{service.price}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Specialty Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {SPECIALTIES.map((specialty) => (
            <TouchableOpacity
              key={specialty.id}
              style={[
                styles.filterChip,
                filterSpecialty === specialty.id && styles.filterChipActive,
              ]}
              onPress={() => setFilterSpecialty(specialty.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterSpecialty === specialty.id && styles.filterChipTextActive,
                ]}
              >
                {specialty.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Providers Grid */}
        {filteredProviders.length > 0 ? (
          <View style={styles.providersGrid}>
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onPress={handleProviderSelect}
              />
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need help choosing a provider?</Text>
          <Text style={styles.helpText}>
            Our team can help you find the right dentist for your needs
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Us</Text>
            <Icon name="arrow-forward" size={16} color={colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    backgroundColor: colors.background.paper,
    paddingTop: spacing.xs,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -spacing.xs,
  },
  headerTitle: {
    flex: 1,
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 17,
    letterSpacing: -0.41,
  },
  headerSpacer: {
    width: 44,
  },
  headerBorder: {
    height: 0.5,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.paper,
    borderWidth: 1.5,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressCircleActive: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  progressCircleText: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressCircleTextActive: {
    ...typography.labelMedium,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  progressLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  progressLabelActive: {
    ...typography.labelSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  progressLine: {
    width: 32,
    height: 1.5,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xs,
  },
  serviceInfoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  serviceInfoCard: {
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  serviceInfoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfoLeft: {
    flex: 1,
  },
  serviceInfoLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  serviceInfoName: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  serviceInfoRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  serviceDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDurationText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  serviceInfoPrice: {
    ...typography.titleLarge,
    color: colors.secondary[500],
    fontWeight: '700',
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  filterChipActive: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  filterChipText: {
    ...typography.labelMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.neutral.white,
  },
  providersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
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
    backgroundColor: colors.primary[50],
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    marginHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    ...typography.labelMedium,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  helpTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  helpText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  helpButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default SelectProviderScreen;
