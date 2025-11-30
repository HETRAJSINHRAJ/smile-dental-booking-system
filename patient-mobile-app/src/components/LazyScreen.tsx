/**
 * LazyScreen - A wrapper component for lazy loading screens
 * 
 * React Native doesn't support React.lazy() directly, so we use a custom
 * implementation that defers screen mounting until needed.
 * 
 * This component provides:
 * - Deferred loading of screen components
 * - Loading indicator during screen initialization
 * - Error boundary for failed screen loads
 */
import React, { Suspense, ComponentType, memo } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface LazyScreenProps {
  children: React.ReactNode;
}

/**
 * Loading fallback component shown while lazy screens are loading
 */
export const ScreenLoadingFallback: React.FC = memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary[500]} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
));

ScreenLoadingFallback.displayName = 'ScreenLoadingFallback';

/**
 * Error fallback component shown when lazy screen fails to load
 */
interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export const ScreenErrorFallback: React.FC<ErrorFallbackProps> = memo(({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error?.message || 'Failed to load screen'}</Text>
    {onRetry && (
      <Text style={styles.retryButton} onPress={onRetry}>
        Tap to retry
      </Text>
    )}
  </View>
));

ScreenErrorFallback.displayName = 'ScreenErrorFallback';

/**
 * Wrapper component that provides Suspense boundary for lazy loaded screens
 */
export const LazyScreen: React.FC<LazyScreenProps> = ({ children }) => (
  <Suspense fallback={<ScreenLoadingFallback />}>
    {children}
  </Suspense>
);

/**
 * Higher-order component to wrap a screen component with lazy loading capabilities
 * 
 * Usage:
 * const LazyProfileScreen = withLazyLoading(ProfileScreen);
 */
export function withLazyLoading<P extends object>(
  WrappedComponent: ComponentType<P>,
  LoadingComponent: ComponentType = ScreenLoadingFallback
): ComponentType<P> {
  const LazyWrappedComponent: React.FC<P> = (props) => (
    <Suspense fallback={<LoadingComponent />}>
      <WrappedComponent {...props} />
    </Suspense>
  );

  LazyWrappedComponent.displayName = `LazyLoaded(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return LazyWrappedComponent;
}

/**
 * Creates a deferred screen component that only renders when first accessed
 * This is useful for screens that are rarely visited
 * 
 * Usage:
 * const DeferredReviewScreen = createDeferredScreen(() => import('./ReviewScreen'));
 */
export function createDeferredScreen<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  let Component: ComponentType<P> | null = null;
  let loadPromise: Promise<void> | null = null;

  const DeferredScreen: React.FC<P> = (props) => {
    const [isLoaded, setIsLoaded] = React.useState(Component !== null);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
      if (!Component && !loadPromise) {
        loadPromise = importFn()
          .then((module) => {
            Component = module.default;
            setIsLoaded(true);
          })
          .catch((err) => {
            setError(err);
          });
      } else if (Component) {
        setIsLoaded(true);
      }
    }, []);

    if (error) {
      return <ScreenErrorFallback error={error} />;
    }

    if (!isLoaded || !Component) {
      return <ScreenLoadingFallback />;
    }

    return <Component {...props} />;
  };

  DeferredScreen.displayName = 'DeferredScreen';

  return DeferredScreen;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.default,
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.titleLarge,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.bodyMedium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    ...typography.labelLarge,
    color: colors.primary[500],
    fontWeight: '600',
  },
});
