/**
 * Performance optimization hooks for React Native
 * 
 * These hooks help optimize rendering performance by:
 * - Memoizing expensive computations
 * - Providing stable callbacks
 * - Optimizing list operations
 */
import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Hook for memoized filtering operations
 * Prevents unnecessary re-computations when filter criteria haven't changed
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => {
    return items.filter(filterFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...deps]);
}

/**
 * Hook for memoized sorting operations
 * Prevents unnecessary re-computations when sort criteria haven't changed
 */
export function useMemoizedSort<T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => {
    return [...items].sort(sortFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...deps]);
}

/**
 * Hook for memoized filter and sort operations combined
 * Useful for list views that need both filtering and sorting
 */
export function useMemoizedFilterSort<T>(
  items: T[],
  filterFn: (item: T) => boolean,
  sortFn: (a: T, b: T) => number,
  deps: React.DependencyList = []
): T[] {
  return useMemo(() => {
    return items.filter(filterFn).sort(sortFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...deps]);
}

/**
 * Hook for memoized grouping operations
 * Useful for SectionList data preparation
 */
export function useMemoizedGroup<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
  deps: React.DependencyList = []
): Map<K, T[]> {
  return useMemo(() => {
    const groups = new Map<K, T[]>();
    items.forEach(item => {
      const key = keyFn(item);
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, item]);
    });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ...deps]);
}

/**
 * Hook for stable key extractor function
 * Prevents FlatList re-renders due to keyExtractor reference changes
 */
export function useStableKeyExtractor<T extends { id: string }>(
  keyField: keyof T = 'id'
): (item: T) => string {
  return useCallback((item: T) => String(item[keyField]), [keyField]);
}

/**
 * Hook for getItemLayout optimization
 * Use when list items have fixed heights
 */
export function useFixedItemLayout(
  itemHeight: number,
  separatorHeight: number = 0
) {
  return useCallback(
    (_data: unknown, index: number) => ({
      length: itemHeight,
      offset: (itemHeight + separatorHeight) * index,
      index,
    }),
    [itemHeight, separatorHeight]
  );
}

/**
 * Hook to detect and warn about memory leaks from unmounted state updates
 * Use this to wrap async operations that update state
 */
export function useMountedRef(): React.MutableRefObject<boolean> {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

/**
 * Hook for safe state updates that checks if component is mounted
 * Prevents "Can't perform a React state update on an unmounted component" warnings
 */
export function useSafeState<T>(
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const isMounted = useMountedRef();
  const [state, setState] = React.useState<T>(initialValue);

  const safeSetState = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (isMounted.current) {
        setState(value);
      }
    },
    [isMounted]
  );

  return [state, safeSetState];
}

/**
 * Hook for debounced values
 * Useful for search inputs to prevent excessive filtering
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 * Useful for scroll handlers and other frequent events
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}
