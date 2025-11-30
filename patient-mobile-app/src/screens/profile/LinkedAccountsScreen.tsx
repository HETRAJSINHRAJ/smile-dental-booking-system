import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContextWithToast';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const LinkedAccountsScreen: React.FC = () => {
  const { linkProvider, unlinkProvider, getLinkedProviders } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState<string | null>(null);

  const linkedProviders = getLinkedProviders();
  const hasPassword = linkedProviders.includes('password');
  const hasGoogle = linkedProviders.includes('google.com');
  const hasFacebook = linkedProviders.includes('facebook.com');
  const hasApple = linkedProviders.includes('apple.com');

  const handleLinkProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(provider);
    try {
      await linkProvider(provider);
    } catch (error) {
      console.error('Error linking provider:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    setLoading(providerId);
    try {
      await unlinkProvider(providerId);
    } catch (error) {
      console.error('Error unlinking provider:', error);
    } finally {
      setLoading(null);
    }
  };

  const renderProviderCard = (
    icon: string,
    title: string,
    description: string,
    providerId: string,
    isLinked: boolean,
    iconColor: string,
    iconBgColor: string,
    provider?: 'google' | 'facebook' | 'apple'
  ) => (
    <Card style={styles.providerCard}>
      <View style={styles.providerContent}>
        <View style={styles.providerLeft}>
          <View style={[styles.providerIcon, { backgroundColor: iconBgColor }]}>
            <Icon name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerTitle}>{title}</Text>
            <Text style={styles.providerDescription}>{description}</Text>
          </View>
        </View>
        <View style={styles.providerRight}>
          {isLinked ? (
            <View style={styles.linkedBadge}>
              <Icon name="checkmark-circle" size={16} color={colors.success.main} />
              <Text style={styles.linkedText}>Connected</Text>
            </View>
          ) : null}
          {provider && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isLinked ? styles.unlinkButton : styles.linkButton,
                loading !== null && styles.disabledButton,
              ]}
              onPress={() =>
                isLinked ? handleUnlinkProvider(providerId) : handleLinkProvider(provider)
              }
              disabled={loading !== null || (isLinked && linkedProviders.length <= 1)}
            >
              {loading === provider || loading === providerId ? (
                <ActivityIndicator size="small" color={isLinked ? colors.error.main : colors.primary[500]} />
              ) : (
                <Text
                  style={[
                    styles.actionButtonText,
                    isLinked ? styles.unlinkButtonText : styles.linkButtonText,
                  ]}
                >
                  {isLinked ? 'Unlink' : 'Link'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Accounts</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={20} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            Connect multiple sign-in methods to your account for easier access. You must have at
            least one sign-in method linked.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign-In Methods</Text>

          {renderProviderCard(
            'mail-outline',
            'Email & Password',
            'Sign in with your email',
            'password',
            hasPassword,
            colors.primary[500],
            colors.primary[50]
          )}

          {renderProviderCard(
            'logo-google',
            'Google',
            'Sign in with your Google account',
            'google.com',
            hasGoogle,
            '#4285F4',
            '#E8F0FE',
            'google'
          )}

          {renderProviderCard(
            'logo-facebook',
            'Facebook',
            'Sign in with your Facebook account',
            'facebook.com',
            hasFacebook,
            '#1877F2',
            '#E7F3FF',
            'facebook'
          )}

          {renderProviderCard(
            'logo-apple',
            'Apple',
            'Sign in with your Apple ID',
            'apple.com',
            hasApple,
            '#000000',
            '#F5F5F5',
            'apple'
          )}
        </View>

        {linkedProviders.length <= 1 && (
          <View style={styles.warningCard}>
            <Icon name="warning-outline" size={20} color={colors.warning.main} />
            <Text style={styles.warningText}>
              You must have at least one sign-in method linked to your account.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.primary[700],
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  providerCard: {
    marginBottom: spacing.md,
  },
  providerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flex: 1,
  },
  providerTitle: {
    ...typography.subtitle1,
    color: colors.text.primary,
    marginBottom: 2,
  },
  providerDescription: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  providerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkedText: {
    ...typography.caption,
    color: colors.success.main,
    fontWeight: '600',
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 70,
    alignItems: 'center',
  },
  linkButton: {
    backgroundColor: colors.primary[50],
  },
  unlinkButton: {
    backgroundColor: colors.error[50],
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    ...typography.button,
    fontSize: 13,
  },
  linkButtonText: {
    color: colors.primary[500],
  },
  unlinkButtonText: {
    color: colors.error.main,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.body2,
    color: colors.warning[700],
    flex: 1,
  },
});

export default LinkedAccountsScreen;
