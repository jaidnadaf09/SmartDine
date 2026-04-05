import api from '@utils/api';

// Fetch all active bookings (pending + confirmed), newest first
export const fetchAdminBookings = async () => {
    const res = await api.get('/admin/bookings');
    return Array.isArray(res.data) ? res.data : [];
};

// Fetch booking history (completed + cancelled)
export const fetchBookingHistory = async () => {
    const res = await api.get('/admin/bookings/history');
    return Array.isArray(res.data) ? res.data : [];
};

// Fetch all available tables
export const fetchAvailableTables = async () => {
    const res = await api.get('/admin/tables/available');
    return Array.isArray(res.data) ? res.data : [];
};

// Assign a table to a booking (with backend capacity validation)
export const assignTable = async (bookingId: number, tableId: number) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/assign-table`, { tableId });
    return res.data;
};

// Check in a booking
export const checkInBooking = async (bookingId: number) => {
    const response = await api.patch(`/admin/bookings/${bookingId}/check-in`);
    return response.data;
};

// Reject / cancel a booking with optional reason
export const rejectBooking = async (bookingId: number, reason: string = 'No show') => {
    const res = await api.put(`/admin/bookings/${bookingId}/cancel`, { reason });
    return res.data;
};

// Mark a booking as completed and release the table
export const completeBooking = async (bookingId: number) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/complete`);
    return res.data;
};

// Generic status update
export const updateBookingStatus = async (bookingId: number, status: string) => {
    const res = await api.put(`/admin/bookings/${bookingId}/status`, { status });
    return res.data;
};

// Unassign a table from a booking
export const unassignTable = async (bookingId: number) => {
    const res = await api.patch(`/admin/bookings/${bookingId}/unassign-table`);
    return res.data;
};
