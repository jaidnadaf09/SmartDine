export const isRestaurantOpen = (): boolean => {
    const now = new Date();
    const hour = now.getHours();

    // 10:00 AM (10) to 11:00 PM (23)
    return hour >= 10 && hour < 23;
};

export const isValidWorkingHour = (timeStr: string): boolean => {
    // Expecting "HH:mm" format
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours >= 10 && hours < 23;
};

export const getRestaurantStatus = () => {
    const isOpen = isRestaurantOpen();
    return {
        isOpen,
        openTime: '10:00 AM',
        closeTime: '11:00 PM',
        message: isOpen ? 'Open Now' : 'Restaurant is currently closed',
        subMessage: isOpen ? 'Closes at 11:00 PM' : 'Orders resume at 10:00 AM'
    };
};
