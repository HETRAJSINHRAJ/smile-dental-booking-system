import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightComponent,
  transparent = false,
}) => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={transparent ? 'transparent' : colors.background.default}
        translucent={transparent}
      />
      <SafeAreaView
        edges={['top']}
        style={[styles.container, transparent && styles.transparent]}
      >
        <View style={styles.content}>
          {showBack ? (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <Icon name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}

          {title && <Text style={styles.title}>{title}</Text>}

          {rightComponent ? (
            <View style={styles.rightComponent}>{rightComponent}</View>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.paper,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  title: {
    ...typography.titleLarge,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightComponent: {
    minWidth: 40,
  },
  placeholder: {
    width: 40,
  },
});
