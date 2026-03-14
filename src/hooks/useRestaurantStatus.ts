import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export interface RestaurantStatus {
    status: 'OPEN' | 'CLOSED' | 'PAUSED';
    pauseUntil: string | null;
    isOperating: boolean; // Based on working hours AND manual status
}

export const useRestaurantStatus = () => {
    const [statusData, setStatusData] = useState<RestaurantStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/restaurant/status`);
            if (res.ok) {
                const data = await res.json();
                
                // Business Hours Logic (10:00 AM - 11:00 PM)
                const now = new Date();
                const hour = now.getHours();
                const isWorkingHour = hour >= 10 && hour < 23;
                
                const isOperating = isWorkingHour && data.status === 'OPEN';
                
                setStatusData({
                    ...data,
                    isOperating
                });
            }
        } catch (error) {
            console.error('Error fetching status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // 30s
        return () => clearInterval(interval);
    }, [checkStatus]);

    return { ...statusData, loading, checkStatus };
};
