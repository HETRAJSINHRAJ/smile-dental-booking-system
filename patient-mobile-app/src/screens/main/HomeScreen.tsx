import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContextWithToast';
import { getAllDocuments } from '../../lib/firestore';
import { Service, Provider } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { userProfile } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesData, providersData] = await Promise.all([
        getAllDocuments<Service>('services', []),
        getAllDocuments<Provider>('providers', []),
      ]);
      setServices(servicesData);
      setProviders(providersData.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, ';
    if (hour < 17) return 'Good Afternoon, ';
    return 'Good Evening, ';
  };



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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {userProfile?.fullName.split(' ')[0] || 'There'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications-outline" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Let's find{'\n'}your doctor</Text>
          {services.length > 4 ? (
            <TouchableOpacity onPress={() => navigation.navigate('SelectService')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity>
              <Icon name="filter-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Services Grid */}
        <View style={styles.servicesGrid}>
          {services.slice(0, 4).map((service, index) => {
            const bgColors = [
              colors.primary[100],
              colors.primary[50],
              colors.accent.light,
              colors.secondary[500],
            ];
            const isLast = index === 3;
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: bgColors[index] || colors.primary[100] },
                ]}
                onPress={() => navigation.navigate('SelectService')}
              >
                <View style={styles.serviceHeader}>
                  <Icon
                    name="medical"
                    size={24}
                    color={isLast ? colors.neutral.white : colors.text.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.serviceTitle,
                    isLast && { color: colors.neutral.white },
                  ]}
                >
                  {service.name}
                </Text>
                <View style={styles.servicePriceContainer}>
                  <View>
                    <Text
                      style={[
                        styles.servicePrice,
                        isLast && { color: colors.neutral.white },
                      ]}
                    >
                      ₹{service.price}
                    </Text>
                    <Text
                      style={[
                        styles.serviceSubtitle,
                        isLast && { color: colors.neutral.white, opacity: 0.8 },
                      ]}
                    >
                      Per session
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.serviceArrow,
                      isLast && { backgroundColor: 'rgba(255,255,255,0.3)' },
                    ]}
                  >
                    <Icon
                      name="arrow-forward"
                      size={20}
                      color={isLast ? colors.neutral.white : colors.text.primary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Featured Doctors */}
        <View style={styles.doctorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Doctors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {providers.map((provider) => (
            <Card key={provider.id} style={styles.doctorCard}>
              <View style={styles.doctorContent}>
                {provider.imageUrl ? (
                  <Image
                    source={{ uri: provider.imageUrl }}
                    style={styles.doctorAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.doctorAvatarPlaceholder}>
                    <Icon name="person" size={32} color={colors.secondary[500]} />
                  </View>
                )}
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{provider.name}</Text>
                  <Text style={styles.doctorSpecialty}>{provider.specialty}</Text>
                  <View style={styles.doctorMeta}>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={14} color="#FCD34D" />
                      <Text style={styles.ratingText}>{provider.rating || 4.6}</Text>
                    </View>
                    <View style={styles.experienceContainer}>
                      <Icon name="time-outline" size={14} color={colors.text.secondary} />
                      <Text style={styles.experienceText}>
                        {provider.yearsOfExperience} Years
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.bookDoctorButton}>
                  <Icon name="arrow-forward" size={20} color={colors.secondary[500]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Promotional Banner */}
        <Card style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Get 20% Off</Text>
              <Text style={styles.promoSubtitle}>On your first appointment</Text>
              <TouchableOpacity
                style={styles.promoButton}
                onPress={() => navigation.navigate('SelectService')}
              >
                <Text style={styles.promoButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoIcon}>
              <Icon name="medical" size={80} color={colors.primary[200]} />
            </View>
          </View>
        </Card>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    ...typography.headlinevSmall,
    color: colors.text.secondary,
  },
  userName: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error.main,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
  },
  seeAllText: {
    ...typography.labelLarge,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '47%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    minHeight: 180,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  serviceHeader: {
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  servicePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  servicePrice: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '700',
  },
  serviceSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  serviceArrow: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorsSection: {
    marginTop: spacing.lg,
  },
  doctorCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  doctorAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
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
  ratingText: {
    ...typography.labelSmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experienceText: {
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
  promoBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.primary[50],
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    marginBottom: 4,
  },
  promoSubtitle: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  promoButton: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    ...typography.labelLarge,
    color: colors.neutral.white,
    fontWeight: '600',
  },
  promoIcon: {
    opacity: 0.3,
  },
});

export default HomeScreen;
