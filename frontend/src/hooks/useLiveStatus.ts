import { useEffect, useRef } from "react";

export const useLiveStatus = (fetchFn: () => void, deps: any[] = []) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchFn();

        intervalRef.current = setInterval(() => {
            fetchFn();
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, deps);
};
