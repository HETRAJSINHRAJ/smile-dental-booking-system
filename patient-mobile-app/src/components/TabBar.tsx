import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getIconName = (routeName: string, focused: boolean) => {
    const icons: Record<string, { focused: string; unfocused: string }> = {
      Home: { focused: 'home', unfocused: 'home-outline' },
      Services: { focused: 'list', unfocused: 'list-outline' },
      Booking: { focused: 'calendar', unfocused: 'calendar-outline' },
      Appointments: { focused: 'time', unfocused: 'time-outline' },
      Profile: { focused: 'person', unfocused: 'person-outline' },
    };

    return focused ? icons[routeName]?.focused : icons[routeName]?.unfocused;
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerFocused,
                ]}
              >
                <Icon
                  name={getIconName(route.name, isFocused) || 'ellipse-outline'}
                  size={24}
                  color={isFocused ? colors.secondary[500] : colors.text.secondary}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  isFocused ? styles.labelFocused : styles.labelUnfocused,
                ]}
              >
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    paddingTop: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.paper,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  iconContainerFocused: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  label: {
    ...typography.labelSmall,
    marginTop: 4,
  },
  labelFocused: {
    color: colors.secondary[500],
    fontWeight: '600',
  },
  labelUnfocused: {
    color: colors.text.secondary,
  },
});
