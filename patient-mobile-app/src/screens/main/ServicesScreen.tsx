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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getAllDocuments } from '../../lib/firestore';
import { Service } from '../../types/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';

type ServicesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<ServicesScreenNavigationProp>();
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

  const renderService = ({ item, index }: { item: Service; index: number }) => {
    const bgColors = [
      colors.primary[100],
      colors.primary[50],
      colors.accent.light,
      colors.secondary[500],
    ];
    const isLast = index % 4 === 3;
    const bgColor = bgColors[index % 4];
    
    return (
      <Card style={styles.serviceCard}>
        <TouchableOpacity
          style={[styles.serviceContent, { backgroundColor: bgColor }]}
          onPress={() => navigation.navigate('SelectService')}
        >
          <View style={[styles.serviceIcon, isLast && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Icon name="medical" size={32} color={isLast ? colors.neutral.white : colors.secondary[500]} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, isLast && { color: colors.neutral.white }]}>
              {item.name}
            </Text>
            <Text
              style={[styles.serviceDescription, isLast && { color: colors.neutral.white, opacity: 0.8 }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <View style={styles.serviceFooter}>
              <View style={styles.priceContainer}>
                <Text style={[styles.servicePrice, isLast && { color: colors.neutral.white }]}>
                  ₹{item.price}
                </Text>
                <Text style={[styles.priceLabel, isLast && { color: colors.neutral.white, opacity: 0.8 }]}>
                  Per session
                </Text>
              </View>
              <View style={styles.durationContainer}>
                <Icon
                  name="time-outline"
                  size={16}
                  color={isLast ? colors.neutral.white : colors.text.secondary}
                />
                <Text style={[styles.serviceDuration, isLast && { color: colors.neutral.white, opacity: 0.8 }]}>
                  {item.duration} min
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, isLast && { backgroundColor: 'rgba(255,255,255,0.3)' }]}
          >
            <Icon
              name="arrow-forward"
              size={20}
              color={isLast ? colors.neutral.white : colors.text.primary}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Card>
    );
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <Text style={styles.headerSubtitle}>Choose the service you need</Text>
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
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  serviceCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
    overflow: 'hidden',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  serviceIcon: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
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
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});

export default ServicesScreen;
