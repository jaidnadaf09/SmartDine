import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import Button from '../../../components/ui/Button';
import BookingCard from '../components/BookingCard';
import AssignTableModal from '../components/AssignTableModal';
import {
    fetchAdminBookings,
    fetchBookingHistory,
    fetchAvailableTables,
    assignTable,
    rejectBooking,
    completeBooking,
    unassignTable as unassignTableApi,
} from '../../../services/bookingService';
import '../../../styles/AdminBookingsLive.css';

const POLL_INTERVAL = 10_000; // 10 seconds

const REJECT_REASONS = ['Customer cancelled', 'No show', 'Restaurant issue', 'Full capacity'];

const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-line skeleton-header" />
        <div className="skeleton-line skeleton-meta" />
        <div className="skeleton-line skeleton-details" />
        <div className="skeleton-line skeleton-actions" />
    </div>
);

const AdminBookingsLive: React.FC = () => {
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
    const [completedToday, setCompletedToday] = useState<any[]>([]);
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Assign modal
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    // Reject modal
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<any | null>(null);
    const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
    const [rejecting, setRejecting] = useState(false);

    // Improvement #3: ref for auto-scroll
    const newRequestsRef = useRef<HTMLDivElement>(null);
    const prevPendingCount = useRef(0);

    // ── Core data fetch ──────────────────────────────────
    const loadData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        setError(null);
        try {
            const [active, history, tables] = await Promise.all([
                fetchAdminBookings(),
                fetchBookingHistory(),
                fetchAvailableTables(),
            ]);

            const pending = active.filter((b: any) => b.status === 'pending');
            const confirmed = active.filter((b: any) => ['confirmed', 'checked_in'].includes(b.status));

            // Today's completed bookings
            const today = new Date().toDateString();
            const todayCompleted = history.filter(
                (b: any) => b.status === 'completed' && new Date(b.updatedAt).toDateString() === today
            );

            // Improvement #3: auto-scroll when new pending arrives
            if (!isInitial && pending.length > prevPendingCount.current) {
                toast('🔔 New booking received!', {
                    duration: 4000,
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(245,158,11,0.3)',
                    },
                });
                newRequestsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            prevPendingCount.current = pending.length;
            setPendingBookings(pending);
            setConfirmedBookings(confirmed);
            setCompletedToday(todayCompleted);
            setAvailableTables(tables);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load bookings.');
        } finally {
            if (isInitial) setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadData(true);
    }, [loadData]);

    // Polling every 10 seconds
    useEffect(() => {
        const intervalId = setInterval(() => loadData(false), POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [loadData]);

    // ── Assign Table ─────────────────────────────────────
    const handleOpenAssign = (bookingId: number) => {
        const booking = [...pendingBookings, ...confirmedBookings].find(b => b.id === bookingId);
        setSelectedBooking(booking ?? null);
        setModalOpen(true);
    };

    const handleAssign = async (tableId: number) => {
        if (!selectedBooking) return;
        try {
            await assignTable(selectedBooking.id, tableId);
            toast.success('Table assigned successfully!');
            setModalOpen(false);
            await loadData(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign table');
            throw err; // bubble up to modal for UX reset
        }
    };

    // ── Reject / Cancel ───────────────────────────────────
    const handleOpenReject = (booking: any) => {
        setRejectTarget(booking);
        setRejectReason(REJECT_REASONS[0]);
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async () => {
        if (!rejectTarget) return;
        setRejecting(true);
        try {
            await rejectBooking(rejectTarget.id, rejectReason);
            toast.success('Booking rejected');
            setRejectModalOpen(false);
            await loadData(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reject booking');
        } finally {
            setRejecting(false);
        }
    };

    // ── Complete ──────────────────────────────────────────
    const handleComplete = async (bookingId: number) => {
        try {
            await completeBooking(bookingId);
            toast.success('Booking completed ✓');
            await loadData(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to complete booking');
        }
    };

    // ── Check-in ──────────────────────────────────────────
    const handleCheckIn = async (bookingId: number) => {
        try {
            const { checkInBooking } = await import('../../../services/bookingService');
            await checkInBooking(bookingId);
            toast.success('Customer checked in!');
            await loadData(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to check in');
        }
    };

    // ── Unassign ──────────────────────────────────────────
    const handleUnassign = async (bookingId: number) => {
        try {
            await unassignTableApi(bookingId);
            toast.success('Table unassigned');
            await loadData(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to unassign table');
        }
    };

    // ── Change Table ──────────────────────────────────────
    const handleChangeTable = (bookingId: number) => {
        handleOpenAssign(bookingId);
    };

    // ── Render helpers ────────────────────────────────────
    const SectionHeader = ({
        title,
        count,
        countClass,
        icon,
    }: {
        title: string;
        count: number;
        countClass: string;
        icon: React.ReactNode;
    }) => (
        <div className="booking-section-header">
            {icon}
            <span className="booking-section-title">{title}</span>
            <span className={`booking-section-count ${countClass}`}>{count}</span>
            <div className="booking-section-divider" />
            <div className="polling-indicator">
                <span className="polling-dot" />
                <span>Live</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="live-bookings-page">
                <div className="booking-section">
                    <div className="booking-section-header">
                        <div className="skeleton-line" style={{ width: 140, height: 18, borderRadius: 8 }} />
                    </div>
                    <div className="booking-cards-grid">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-empty-state">
                <Icons.alertCircle size={32} className="booking-empty-state-icon" />
                <p>{error}</p>
                <Button variant="primary" onClick={() => loadData(true)}>Retry</Button>
            </div>
        );
    }

    return (
        <>
            <div className="live-bookings-page">

                {/* ── SECTION: New Requests ─────────────────── */}
                <div className="booking-section" ref={newRequestsRef}>
                    <SectionHeader
                        title="New Requests"
                        count={pendingBookings.length}
                        countClass="section-count-pending"
                        icon={<Icons.bell size={18} style={{ color: '#f59e0b' }} />}
                    />
                    <AnimatePresence mode="popLayout">
                        {pendingBookings.length === 0 ? (
                            <motion.div
                                key="pending-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="booking-empty-state"
                            >
                                <Icons.calendar size={32} className="booking-empty-state-icon" />
                                <p>No pending booking requests</p>
                            </motion.div>
                        ) : (
                            <div className="booking-cards-grid">
                                {pendingBookings.map(booking => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onAssign={handleOpenAssign}
                                        onReject={handleOpenReject}
                                        onComplete={handleComplete}
                                        onCheckIn={handleCheckIn}
                                        onUnassign={handleUnassign}
                                        onChangeTable={handleChangeTable}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── SECTION: Confirmed ────────────────────── */}
                <div className="booking-section">
                    <SectionHeader
                        title="Confirmed Bookings"
                        count={confirmedBookings.length}
                        countClass="section-count-confirmed"
                        icon={<Icons.check size={18} style={{ color: '#10b981' }} />}
                    />
                    <AnimatePresence mode="popLayout">
                        {confirmedBookings.length === 0 ? (
                            <motion.div
                                key="confirmed-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="booking-empty-state"
                            >
                                <Icons.check size={32} className="booking-empty-state-icon" />
                                <p>No confirmed bookings right now</p>
                            </motion.div>
                        ) : (
                            <div className="booking-cards-grid">
                                {confirmedBookings.map(booking => (
                                    <BookingCard
                                        key={booking.id}
                                        booking={booking}
                                        onAssign={handleOpenAssign}
                                        onReject={handleOpenReject}
                                        onComplete={handleComplete}
                                        onCheckIn={handleCheckIn}
                                        onUnassign={handleUnassign}
                                        onChangeTable={handleChangeTable}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── SECTION: Completed Today ──────────────── */}
                {completedToday.length > 0 && (
                    <div className="booking-section">
                        <SectionHeader
                            title="Completed Today"
                            count={completedToday.length}
                            countClass="section-count-completed"
                            icon={<Icons.checkSquare size={18} style={{ color: '#3b82f6' }} />}
                        />
                        <div className="booking-cards-grid">
                            {completedToday.map(booking => (
                                <BookingCard
                                    key={booking.id}
                                    booking={booking}
                                    onAssign={handleOpenAssign}
                                    onReject={handleOpenReject}
                                    onComplete={handleComplete}
                                    onUnassign={handleUnassign}
                                    onChangeTable={handleChangeTable}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Assign Table Modal ───────────────────────── */}
            <AssignTableModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onAssign={handleAssign}
                tables={availableTables}
                guestCount={selectedBooking?.guests ?? 1}
                bookingCustomer={selectedBooking?.customerName}
            />

            {/* ── Reject Confirm Modal ─────────────────────── */}
            {rejectModalOpen && (
                <div className="assign-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRejectModalOpen(false); }}>
                    <motion.div
                        className="assign-modal-box"
                        initial={{ opacity: 0, scale: 0.93 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.18 }}
                    >
                        <div className="assign-modal-header">
                            <div>
                                <h2 className="assign-modal-title">Reject Booking</h2>
                                <p className="assign-modal-sub">{rejectTarget?.customerName} · {rejectTarget?.guests} guests</p>
                            </div>
                            <button className="assign-modal-close" onClick={() => setRejectModalOpen(false)}>
                                <Icons.x size={16} />
                            </button>
                        </div>

                        <div className="assign-modal-body">
                            <div className="reject-modal-icon">
                                <Icons.alertCircle size={28} />
                            </div>
                            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Select a reason for rejecting this booking.
                            </p>
                            <div className="reject-reason-grid">
                                {REJECT_REASONS.map(r => (
                                    <button
                                        key={r}
                                        className={`reject-reason-option ${rejectReason === r ? 'selected' : ''}`}
                                        onClick={() => setRejectReason(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="assign-modal-footer">
                            <Button variant="ghost" onClick={() => setRejectModalOpen(false)} disabled={rejecting}>
                                Keep Booking
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirmReject}
                                disabled={rejecting}
                            >
                                {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default AdminBookingsLive;
