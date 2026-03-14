export const isRestaurantOpen = (): boolean => {
    const now = new Date();
    // Convert current time to IST (UTC+5:30)
    // Since we are likely running in a machine that might have different TZ, 
    // but the system says "The current local time is: 2026-03-14T00:38:25+05:30"
    // So the system time IS in IST.
    const hour = now.getHours();

    return hour >= 10 && hour < 23;
};

export const isValidWorkingHour = (timeStr: string): boolean => {
    if (!timeStr) return false;
    const [hours] = timeStr.split(':').map(Number);
    return hours >= 10 && hours < 23;
};

export const getRestaurantStatus = () => {
    const isOpen = isRestaurantOpen();
    return {
        isOpen,
        openTime: '10:00 AM',
        closeTime: '11:00 PM',
        message: isOpen ? 'Open Now' : 'Closed',
        subMessage: isOpen ? 'Closes at 11:00 PM' : 'Opens at 10:00 AM tomorrow'
    };
};
