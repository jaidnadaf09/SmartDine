"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRestaurantStatus = exports.isValidWorkingHour = exports.isRestaurantOpen = void 0;
const isRestaurantOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    // 10:00 AM (10) to 11:00 PM (23)
    return hour >= 10 && hour < 23;
};
exports.isRestaurantOpen = isRestaurantOpen;
const isValidWorkingHour = (timeStr) => {
    // Expecting "HH:mm" format
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours >= 10 && hours < 23;
};
exports.isValidWorkingHour = isValidWorkingHour;
const getRestaurantStatus = () => {
    const isOpen = (0, exports.isRestaurantOpen)();
    return {
        isOpen,
        openTime: '10:00 AM',
        closeTime: '11:00 PM',
        message: isOpen ? 'Open Now' : 'Restaurant is currently closed',
        subMessage: isOpen ? 'Closes at 11:00 PM' : 'Orders resume at 10:00 AM'
    };
};
exports.getRestaurantStatus = getRestaurantStatus;
