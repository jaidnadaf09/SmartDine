import { useState, useEffect } from 'react';

/**
 * A custom hook that returns a debounced value after a specified delay.
 * Useful for preventing rapid re-renders or API calls during fast input changes.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cancel the timeout if the value changes (cleanup)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
