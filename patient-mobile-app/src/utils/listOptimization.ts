/**
 * FlatList Optimization Utilities
 * 
 * These utilities help optimize FlatList performance by providing:
 * - Proper getItemLayout configurations for fixed-height items
 * - Optimized windowSize and other performance props
 * - Common list configurations
 */
import { FlatListProps } from 'react-native';

/**
 * Common item heights for different list types
 */
export const ITEM_HEIGHTS = {
  APPOINTMENT_CARD: 180,
  PROVIDER_CARD: 280,
  SERVICE_CARD: 200,
  DOCTOR_CARD: 100,
  REVIEW_CARD: 150,
  NOTIFICATION_ITEM: 80,
  CHAT_MESSAGE: 60,
} as const;

/**
 * Creates a getItemLayout function for fixed-height items
 * This significantly improves scroll performance by avoiding measurement
 */
export function createGetItemLayout(
  itemHeight: number,
  separatorHeight: number = 0
) {
  return (_data: unknown, index: number) => ({
    length: itemHeight,
    offset: (itemHeight + separatorHeight) * index,
    index,
  });
}

/**
 * Default optimized FlatList props for better performance
 * Apply these to any FlatList that doesn't need special configuration
 */
export const defaultFlatListOptimizations: Partial<FlatListProps<unknown>> = {
  // Reduce the number of items rendered outside the visible area
  windowSize: 5,
  // Initial number of items to render
  initialNumToRender: 10,
  // Maximum number of items to render per batch
  maxToRenderPerBatch: 10,
  // Time between batch renders
  updateCellsBatchingPeriod: 50,
  // Remove items that are far from the visible area
  removeClippedSubviews: true,
};

/**
 * Optimized props for lists with many items (100+)
 */
export const largeFlatListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  windowSize: 3,
  initialNumToRender: 5,
  maxToRenderPerBatch: 5,
  updateCellsBatchingPeriod: 100,
};

/**
 * Optimized props for horizontal lists (carousels, etc.)
 */
export const horizontalFlatListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  windowSize: 3,
  initialNumToRender: 5,
  maxToRenderPerBatch: 3,
  horizontal: true,
  showsHorizontalScrollIndicator: false,
};

/**
 * Creates a stable keyExtractor function
 * Using a stable reference prevents unnecessary re-renders
 */
export function createKeyExtractor<T extends { id: string }>(
  keyField: keyof T = 'id'
): (item: T, index: number) => string {
  return (item: T) => String(item[keyField]);
}

/**
 * Optimized props for appointment lists
 */
export const appointmentListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  getItemLayout: createGetItemLayout(ITEM_HEIGHTS.APPOINTMENT_CARD, 16),
};

/**
 * Optimized props for provider lists
 */
export const providerListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  getItemLayout: createGetItemLayout(ITEM_HEIGHTS.PROVIDER_CARD, 12),
};

/**
 * Optimized props for service lists
 */
export const serviceListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  getItemLayout: createGetItemLayout(ITEM_HEIGHTS.SERVICE_CARD, 12),
};

/**
 * Optimized props for chat message lists
 */
export const chatListOptimizations: Partial<FlatListProps<unknown>> = {
  ...defaultFlatListOptimizations,
  windowSize: 10,
  initialNumToRender: 20,
  maxToRenderPerBatch: 15,
  inverted: true,
  removeClippedSubviews: false, // Can cause issues with inverted lists
};

/**
 * Helper to merge optimization props with custom props
 */
export function mergeListProps<T>(
  optimizations: Partial<FlatListProps<T>>,
  customProps: Partial<FlatListProps<T>>
): Partial<FlatListProps<T>> {
  return {
    ...optimizations,
    ...customProps,
  };
}
