export const isRestaurantOpen = (): boolean => {
    // Restaurant is now open 24/7
    return true;
};

export const isValidWorkingHour = (timeStr: string): boolean => {
    // All hours are valid for 24/7 operation
    return true;
};

export const getRestaurantStatus = () => {
    return {
        isOpen: true,
        openTime: 'Open 24/7',
        closeTime: 'Open 24/7',
        message: 'Open Now',
        subMessage: 'Open 24 hours a day'
    };
};
