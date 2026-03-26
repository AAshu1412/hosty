import { useEffect, useEffectEvent, useState } from "react";

interface MockResourceState<T> {
  data: T | null;
  loadedKey: string | null;
  error: string | null;
}

export function useMockResource<T>(cacheKey: string, loader: () => Promise<T>) {
  const [state, setState] = useState<MockResourceState<T>>({
    data: null,
    loadedKey: null,
    error: null,
  });

  const runLoader = useEffectEvent(loader);

  useEffect(() => {
    let isActive = true;

    runLoader()
      .then((data) => {
        if (!isActive) {
          return;
        }

        setState({
          data,
          loadedKey: cacheKey,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setState({
          data: null,
          loadedKey: cacheKey,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      isActive = false;
    };
  }, [cacheKey]);

  const hasLoadedCurrentKey = state.loadedKey === cacheKey;

  return {
    data: hasLoadedCurrentKey ? state.data : null,
    error: hasLoadedCurrentKey ? state.error : null,
    isLoading: !hasLoadedCurrentKey,
  };
}
