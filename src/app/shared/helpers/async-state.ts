import { signal } from '@angular/core';

/**
 * A lightweight state holder for async operations.
 * It does NOT execute the async work — it only stores the result.
 *
 * @template T The type of the data being loaded.
 */
export function createAsyncState<T>(initial: T) {
  const data = signal<T>(initial);
  const loading = signal<boolean>(false);
  const error = signal<string | null>(null);

  return {
    // Signals
    data,
    loading,
    error,

    // Methods to control state
    setData(value: T) {
      data.set(value);
      loading.set(false);
      error.set(null);
    },

    setLoading(isLoading: boolean = true) {
      loading.set(isLoading);
      if (isLoading) error.set(null);
    },

    setError(message: string) {
      error.set(message);
      loading.set(false);
    },

    reset() {
      data.set(initial);
      loading.set(false);
      error.set(null);
    },
  };
}
