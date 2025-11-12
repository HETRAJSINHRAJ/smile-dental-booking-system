import React, { useRef } from 'react';
import {
  Animated,
  RefreshControl,
  StyleSheet,
  View,
  Easing,
} from 'react-native';
import { colors } from '../theme';

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  tintColor?: string;
  backgroundColor?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  tintColor = colors.primary[500],
  backgroundColor = colors.background.default,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
          progressBackgroundColor={backgroundColor}
          progressViewOffset={0}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
