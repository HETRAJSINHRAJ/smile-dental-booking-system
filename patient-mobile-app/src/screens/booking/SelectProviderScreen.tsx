import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  ScrollView,
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

const SelectProviderScreen: React.FC<Props> = ({ navigation, route }) => {
  const { serviceId } = route.params;
  const [providers, setProviders] = useState<Provider[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  useEffect(() => {
    loadData();
  }, [serviceId]);

  const loadData = async () => {
    try {
      const [providersData, servicesData] = await Promise.all([
        getAllDocuments<Provider>('providers', []),
        getAllDocuments<Service>('services', []),
      ]);
      
      const selectedService = servicesData.find(s => s.id === serviceId);
      setService(selectedService || null);
      setProviders(providersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider: Provider) => {
    navigation.navigate('SelectDateTime', {
      serviceId,
      providerId: provider.id,
    });
  };

  const filteredProviders = providers.filter((provider) => {
    const offersService = provider.serviceIds && provider.serviceIds.includes(serviceId);
    if (!offersService) return false;
    
    return filterSpecialty === 'all' || provider.specialty === filterSpecialty;
  });

  const renderProvider = ({ item, index }: { item: Provider; index: number }) => (
    <TouchableOpacity
      style={styles.providerCard}
      onPress={() => handleProviderSelect(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.cardInner}>
        <View style={styles.providerHeader}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.providerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.providerImagePlaceholder}>
              <Icon name="person" size={40} color={colors.secondary[500]} />
            </View>
          )}
        </View>

        <View style={styles.providerInfo}>
          <View style={styles.providerNameRow}>
            <Text style={styles.providerName}>{item.name}</Text>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color="#FCD34D" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.providerSpecialty}>{item.specialty}</Text>
          
          <Text style={styles.providerBio} numberOfLines={2}>
            {item.bio}
          </Text>

          <View style={styles.providerFooter}>
            <View style={styles.experienceContainer}>
              <Icon name="time-outline" size={16} color={colors.text.secondary} />
              <Text style={styles.experienceText}>
                {item.yearsOfExperience} years
              </Text>
            </View>
            
            {item.acceptingNewPatients && (
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.arrowButton}>
          <Icon name="arrow-forward" size={20} color={colors.secondary[500]} />
        </View>
      </Card>
    </TouchableOpacity>
  );

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Provider</Text>
        <View style={styles.headerRight} />
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
      <View style={styles.filterContainer}>
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
      </View>

      {/* Providers List */}
      <FlatList
        data={filteredProviders}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background.default,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
  },
  headerRight: {
    width: 44,
  },
  serviceInfoContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  serviceInfoCard: {
    padding: spacing.md,
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
  filterContainer: {
    paddingBottom: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.primary[100],
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  providerCard: {
    marginBottom: spacing.lg,
  },
  cardInner: {
    padding: spacing.lg,
    flexDirection: 'row',
  },
  providerHeader: {
    position: 'relative',
    marginRight: spacing.md,
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
  },
  providerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  providerName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    ...shadows.small,
    marginLeft: spacing.sm,
  },
  ratingText: {
    ...typography.labelSmall,
    color: colors.text.primary,
    fontWeight: '700',
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
    marginBottom: spacing.md,
  },
  providerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  experienceText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  availableBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  availableText: {
    ...typography.labelSmall,
    color: '#065F46',
    fontWeight: '600',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  emptyButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
});

export default SelectProviderScreen;
