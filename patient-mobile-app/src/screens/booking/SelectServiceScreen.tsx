import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllDocuments } from '../../lib/firestore';
import { Service } from '../../types/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type SelectServiceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectService'
>;

interface Props {
  navigation: SelectServiceScreenNavigationProp;
}

const SelectServiceScreen: React.FC<Props> = ({ navigation }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const loadServices = async () => {
    try {
      const data = await getAllDocuments<Service>('services', []);
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    setFilteredServices(filtered);
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'general', name: 'General' },
    { id: 'cosmetic', name: 'Cosmetic' },
    { id: 'restorative', name: 'Restorative' },
    { id: 'orthodontics', name: 'Orthodontics' },
  ];

  const handleSelectService = (serviceId: string) => {
    navigation.navigate('SelectProvider', { serviceId });
  };

  const getServiceColor = (index: number) => {
    const bgColors = [
      colors.primary[100],
      colors.primary[50],
      colors.accent.light,
      colors.secondary[100],
    ];
    return bgColors[index % bgColors.length];
  };

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
          
          <Text style={styles.headerTitle}>Select Service</Text>
          
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
              <Text style={styles.progressCircleTextActive}>1</Text>
            </View>
            <Text style={styles.progressLabelActive}>Service</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>2</Text>
            </View>
            <Text style={styles.progressLabel}>Provider</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Date & Time</Text>
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

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <View style={styles.servicesGrid}>
            {filteredServices.map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleSelectService(service.id)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceCardHeader}>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {service.name}
                  </Text>
                  <View style={[styles.serviceIconContainer, { backgroundColor: getServiceColor(index) }]}>
                    <Text style={styles.serviceEmoji}>🦷</Text>
                  </View>
                </View>

                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>

                <View style={styles.serviceFooter}>
                  <View style={styles.serviceMeta}>
                    <View style={styles.durationBadge}>
                      <Icon name="time-outline" size={14} color={colors.text.secondary} />
                      <Text style={styles.durationText}>{service.duration} min</Text>
                    </View>
                  </View>
                  <Text style={styles.servicePrice}>₹{service.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="search-outline" size={48} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filter
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={styles.emptyButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need help choosing a service?</Text>
          <Text style={styles.helpText}>
            Our team can help you determine the best treatment for your needs
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.border.light,
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
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    borderWidth: 0.5,
    borderColor: colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.secondary[500],
    borderColor: colors.secondary[500],
  },
  categoryChipText: {
    ...typography.labelMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.neutral.white,
  },
  servicesGrid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  serviceCard: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.xl,
    borderWidth: 0.5,
    borderColor: colors.border.light,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  serviceName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.md,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border.light,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  servicePrice: {
    ...typography.titleLarge,
    color: colors.secondary[500],
    fontWeight: '700',
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

export default SelectServiceScreen;
