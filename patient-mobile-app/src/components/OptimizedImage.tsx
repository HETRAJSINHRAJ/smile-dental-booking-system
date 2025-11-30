/**
 * OptimizedImage - A performance-optimized image component using FastImage
 * 
 * Features:
 * - Automatic caching with configurable priority
 * - Placeholder support during loading
 * - Error handling with fallback
 * - Memory-efficient image loading
 */
import React, { memo, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import FastImage, { FastImageProps, Priority, ResizeMode } from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme';

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  uri?: string | null;
  fallbackIcon?: string;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  showLoadingIndicator?: boolean;
  priority?: Priority;
  cacheControl?: 'immutable' | 'web' | 'cacheOnly';
}

const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  uri,
  style,
  fallbackIcon = 'person',
  fallbackIconSize = 32,
  fallbackIconColor = colors.secondary[500],
  containerStyle,
  showLoadingIndicator = true,
  priority = FastImage.priority.normal,
  cacheControl = 'immutable',
  resizeMode = FastImage.resizeMode.cover,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // If no URI or error occurred, show fallback
  if (!uri || hasError) {
    return (
      <View style={[styles.fallbackContainer, style, containerStyle]}>
        <Icon name={fallbackIcon} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  return (
    <View style={[containerStyle]}>
      <FastImage
        style={style}
        source={{
          uri,
          priority,
          cache: cacheControl === 'immutable' 
            ? FastImage.cacheControl.immutable 
            : cacheControl === 'cacheOnly'
            ? FastImage.cacheControl.cacheOnly
            : FastImage.cacheControl.web,
        }}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      {isLoading && showLoadingIndicator && (
        <View style={[styles.loadingOverlay, style]}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
        </View>
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export { OptimizedImage, FastImage };
export type { OptimizedImageProps };
