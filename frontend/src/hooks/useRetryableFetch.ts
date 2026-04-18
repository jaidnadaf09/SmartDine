import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook to easily manage loading, error, and retry states for API calls.
 * This pairs perfectly with the GlobalErrorState component.
 * 
 * @example
 * const { data, error, loading, retry } = useRetryableFetch(fetchMenu);
 */
export function useRetryableFetch<T>(
    fetchFn: () => Promise<T>,
    immediate: boolean = true
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(immediate);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
            return result;
        } catch (err: any) {
            console.error("Fetch failed:", err);
            setError(err.response?.data?.message || err.message || "Failed to load data.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (immediate) {
            execute().catch(() => { /* Error caught in state */ });
        }
    }, [execute, immediate]);

    return {
        data,
        loading,
        error,
        retry: execute,
        setData // Exposed in case local optimistic updates are needed
    };
}
