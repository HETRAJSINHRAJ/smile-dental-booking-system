import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getAllDocuments } from '../../lib/firestore';
import { Service } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMountedRef, useDebouncedValue } from '../../hooks/usePerformance';

type ServicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Memoized Service Card component
const ServiceCard = memo<{
  service: Service;
  index: number;
  onPress: () => void;
}>(({ service, index, onPress }) => {
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
      style={[styles.serviceCard, { backgroundColor: bgColor }]}
      onPress={onPress}
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

      <View style={[styles.arrowButton, isDark && styles.arrowButtonDark]}>
        <Icon
          name="arrow-forward"
          size={18}
          color={isDark ? colors.neutral.white : colors.text.primary}
        />
      </View>
    </TouchableOpacity>
  );
});

ServiceCard.displayName = 'ServiceCard';

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<ServicesScreenNavigationProp>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMounted = useMountedRef();
  
  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoize filtered services based on debounced search query
  const filteredServices = useMemo(() => {
    if (debouncedSearchQuery.trim() === '') {
      return services;
    }
    const query = debouncedSearchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
    );
  }, [debouncedSearchQuery, services]);

  const loadServices = useCallback(async () => {
    try {
      const data = await getAllDocuments<Service>('services', []);
      if (isMounted.current) {
        setServices(data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isMounted]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServices();
    if (isMounted.current) {
      setRefreshing(false);
    }
  }, [loadServices, isMounted]);

  const handleServicePress = useCallback(() => {
    navigation.navigate('SelectService');
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
            progressBackgroundColor={colors.background.paper}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Our Services</Text>
            <Text style={styles.headerSubtitle}>
              {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} available
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onPress={handleServicePress}
            />
          ))}
        </View>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No services found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery.trim() === '' 
                ? 'Pull down to refresh and load services'
                : 'Try adjusting your search to find what you\'re looking for'}
            </Text>
          </View>
        )}
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
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
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
  arrowButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonDark: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  iconContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  textWhite: {
    color: colors.neutral.white,
  },
  textWhiteOpacity: {
    color: colors.neutral.white,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default ServicesScreen;
