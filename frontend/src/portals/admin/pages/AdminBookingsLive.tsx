import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icons } from '@components/icons/IconSystem';
import Button from '@ui/Button';
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
import '@styles/portals/AdminBookingsLive.css';

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
            setError(null); // Clear error on successful fetch
        } catch (err: any) {
            // Only show error on initial load or if we have no data at all
            const hasData = pendingBookings.length > 0 || confirmedBookings.length > 0;
            if (isInitial || !hasData) {
                setError(err.response?.data?.message || err.message || 'Failed to load bookings.');
            }
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
                                    onCheckIn={handleCheckIn}
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

            {rejectModalOpen && createPortal(
                <motion.div
                    onClick={(e) => { if (e.target === e.currentTarget) setRejectModalOpen(false); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '460px', maxWidth: '92vw',
                            borderRadius: '20px', padding: '28px',
                            background: 'var(--card-bg)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.25)',
                            display: 'flex', flexDirection: 'column', gap: '20px',
                        }}
                    >
                        {/* ── Header ── */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <h2 style={{
                                    margin: 0, fontSize: '1.2rem', fontWeight: 700,
                                    letterSpacing: '-0.025em', color: 'var(--text-primary)',
                                    fontFamily: "'Montserrat', sans-serif",
                                }}>
                                    Reject Booking
                                </h2>
                                <p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', opacity: 0.75, letterSpacing: '0.01em' }}>
                                    {rejectTarget?.customerName}&nbsp;·&nbsp;{rejectTarget?.guests} {Number(rejectTarget?.guests) === 1 ? 'guest' : 'guests'}
                                </p>
                            </div>
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                style={{
                                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                    border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
                                    background: 'transparent', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)', transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color, rgba(0,0,0,0.1))'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <Icons.x size={14} />
                            </button>
                        </div>

                        {/* ── Thin divider ── */}
                        <div style={{ height: 1, background: 'var(--border-color, rgba(0,0,0,0.07))' }} />

                        {/* ── Alert Section ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(145deg, rgba(239,68,68,0.14), rgba(239,68,68,0.06))',
                                border: '1.5px solid rgba(239,68,68,0.22)',
                                boxShadow: '0 4px 16px rgba(239,68,68,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icons.alertCircle size={24} style={{ color: '#ef4444' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    This action will cancel the booking.
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.65, lineHeight: 1.5 }}>
                                    Please select a reason before continuing.
                                </p>
                            </div>
                        </div>

                        {/* ── Reason Dropdown ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                color: 'var(--text-secondary)', opacity: 0.6,
                            }}>
                                Reason for Rejection
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 42px 12px 16px',
                                        borderRadius: 12,
                                        border: rejectReason
                                            ? '1.5px solid #D4AF37'
                                            : '1px solid rgba(212,175,55,0.3)',
                                        background: 'var(--bg-primary, rgba(255,255,255,0.8))',
                                        color: rejectReason ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: rejectReason ? 500 : 400,
                                        cursor: 'pointer',
                                        outline: 'none',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        boxShadow: rejectReason
                                            ? '0 0 0 3px rgba(212,175,55,0.12)'
                                            : '0 1px 4px rgba(0,0,0,0.05)',
                                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#D4AF37';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = rejectReason ? '#D4AF37' : 'rgba(212,175,55,0.3)';
                                        e.currentTarget.style.boxShadow = rejectReason ? '0 0 0 3px rgba(212,175,55,0.12)' : '0 1px 4px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <option value="" disabled>Select a reason...</option>
                                    {REJECT_REASONS.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <div style={{
                                    position: 'absolute', right: 14, top: '50%',
                                    transform: 'translateY(-50%)', pointerEvents: 'none',
                                    color: rejectReason ? '#D4AF37' : 'var(--text-secondary)',
                                    opacity: rejectReason ? 1 : 0.5,
                                    transition: 'color 0.2s ease, opacity 0.2s ease',
                                }}>
                                    <Icons.chevronDown size={15} />
                                </div>
                            </div>
                            <p style={{
                                margin: 0, fontSize: '0.74rem',
                                color: rejectReason ? '#D4AF37' : 'var(--text-secondary)',
                                opacity: rejectReason ? 0.9 : 0.5,
                                transition: 'all 0.2s ease',
                            }}>
                                {rejectReason ? `✓ Reason selected` : 'A reason is required to reject.'}
                            </p>
                        </div>

                        {/* ── Divider ── */}
                        <div style={{ height: 1, background: 'var(--border-color, rgba(0,0,0,0.07))' }} />

                        {/* ── Action Buttons ── */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                disabled={rejecting}
                                style={{
                                    padding: '10px 20px', borderRadius: 12,
                                    border: '1px solid var(--border-color, rgba(0,0,0,0.1))',
                                    background: 'transparent', cursor: rejecting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem', fontWeight: 500,
                                    color: 'var(--text-secondary)', transition: 'all 0.15s ease',
                                    opacity: rejecting ? 0.5 : 1,
                                }}
                                onMouseEnter={e => { if (!rejecting) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-color, rgba(0,0,0,0.1))'; }}
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={rejecting || !rejectReason}
                                style={{
                                    padding: '10px 22px', borderRadius: 12,
                                    border: '1.5px solid rgba(239,68,68,0.4)',
                                    background: (rejecting || !rejectReason) ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.1)',
                                    color: '#ef4444',
                                    cursor: (rejecting || !rejectReason) ? 'not-allowed' : 'pointer',
                                    fontSize: '0.875rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    transition: 'all 0.15s ease',
                                    opacity: (rejecting || !rejectReason) ? 0.42 : 1,
                                    boxShadow: (rejecting || !rejectReason) ? 'none' : '0 2px 8px rgba(239,68,68,0.12)',
                                }}
                                onMouseEnter={e => { if (!rejecting && rejectReason) { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.2)'; } }}
                                onMouseLeave={e => { e.currentTarget.style.background = (rejecting || !rejectReason) ? 'rgba(239,68,68,0.04)' : 'rgba(239,68,68,0.1)'; e.currentTarget.style.boxShadow = (rejecting || !rejectReason) ? 'none' : '0 2px 8px rgba(239,68,68,0.12)'; }}
                            >
                                {rejecting
                                    ? <><Icons.loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Rejecting...</>
                                    : <><Icons.ban size={14} /> Confirm Reject</>
                                }
                            </button>
                        </div>
                    </motion.div>
                </motion.div>,
                document.body
            )}
        </>
    );
};

export default AdminBookingsLive;
