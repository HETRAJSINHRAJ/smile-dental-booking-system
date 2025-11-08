import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContextWithToast';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Card } from '../../components/Card';
import Icon from 'react-native-vector-icons/Ionicons';

const ProfileScreen: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: signOut, style: 'destructive' },
    ]);
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your information',
      color: colors.primary[500],
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your alerts',
      color: colors.secondary[500],
      onPress: () => {},
    },
    {
      icon: 'lock-closed-outline',
      title: 'Privacy & Security',
      subtitle: 'Control your privacy',
      color: colors.primary[600],
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      color: colors.accent.main,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.default} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Icon name="person" size={18} color={colors.primary[500]} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userProfile?.fullName || 'User'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="create-outline" size={20} color={colors.secondary[500]} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="mail" size={20} color={colors.primary[500]} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Icon name="call" size={20} color={colors.primary[500]} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{userProfile?.phone || 'Not set'}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {menuItems.map((item, index) => (
            <Card key={index} style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </Card>
          ))}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Card style={styles.signOutCard}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <View style={styles.signOutIcon}>
                <Icon name="log-out-outline" size={24} color={colors.error.main} />
              </View>
              <Text style={styles.signOutText}>Sign Out</Text>
              <Icon name="chevron-forward" size={20} color={colors.error.main} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  profileCard: {
    margin: spacing.lg,
    ...shadows.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.headlineSmall,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoCard: {
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginVertical: spacing.xs,
  },
  menuCard: {
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.titleMedium,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  signOutCard: {
    backgroundColor: colors.error.light,
    ...shadows.small,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  signOutText: {
    ...typography.titleMedium,
    color: colors.error.main,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  versionText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default ProfileScreen;
