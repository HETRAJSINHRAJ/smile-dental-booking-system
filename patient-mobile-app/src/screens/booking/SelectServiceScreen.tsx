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
import { getAllDocuments } from '../../lib/firestore';
import { Service } from '../../types/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';

type SelectServiceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SelectService'
>;

interface Props {
  navigation: SelectServiceScreenNavigationProp;
}

const SelectServiceScreen: React.FC<Props> = ({ navigation }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await getAllDocuments<Service>('services', []);
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (serviceId: string) => {
    navigation.navigate('SelectProvider', { serviceId });
  };

  const getServiceIcon = (index: number) => {
    const icons = ['medical', 'fitness', 'heart', 'eye', 'body', 'bandage'];
    return icons[index % icons.length];
  };

  const getServiceColor = (index: number) => {
    const bgColors = [
      colors.primary[100],
      colors.primary[50],
      colors.accent.light,
      colors.secondary[100],
      colors.primary[100],
      colors.accent.light,
    ];
    return bgColors[index % bgColors.length];
  };

  const renderService = ({ item, index }: { item: Service; index: number }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleSelectService(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.cardInner}>
        <View style={styles.serviceContent}>
          <View style={[styles.serviceIcon, { backgroundColor: getServiceColor(index) }]}>
            <Icon name={getServiceIcon(index)} size={32} color={colors.secondary[500]} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.servicePrice}>₹{item.price}</Text>
            <Text style={styles.priceLabel}>per session</Text>
          </View>
          <View style={styles.durationContainer}>
            <Icon name="time-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.serviceDuration}>{item.duration} min</Text>
          </View>
          <View style={styles.arrowButton}>
            <Icon name="arrow-forward" size={20} color={colors.secondary[100]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          Choose the service you need
        </Text>
        <Text style={styles.serviceCount}>
          {services.length} {services.length === 1 ? 'service' : 'services'} available
        </Text>
      </View>

      <FlatList
        data={services}
        renderItem={renderService}
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
  subHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  subHeaderText: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  serviceCount: {
    ...typography.labelLarge,
    color: colors.secondary[500],
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  serviceCard: {
    marginBottom: spacing.lg,
  },
  cardInner: {
    padding: spacing.lg,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  serviceIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  serviceInfo: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  serviceName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  serviceDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary[50],
  },
  priceContainer: {
    flexDirection: 'column',
    gap: 2,
  },
  servicePrice: {
    ...typography.headlineSmall,
    color: colors.secondary[500],
    fontWeight: '700',
  },
  priceLabel: {
    ...typography.labelSmall,
    color: colors.text.secondary,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  serviceDuration: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
});

export default SelectServiceScreen;
