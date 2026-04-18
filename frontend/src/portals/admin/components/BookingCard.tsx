import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '@components/icons/IconSystem';
import { formatDate, formatTime } from '@utils/dateFormatter';

interface BookingCardProps {
    booking: any;
    onComplete: (bookingId: number) => void;
    onCheckIn: (bookingId: number) => void;
    onReject: (booking: any) => void;
    onAssign: (bookingId: number) => void;
    onNoShow: (bookingId: number) => void;
    onUnassign?: (bookingId: number) => void;
    onChangeTable?: (bookingId: number) => void;
}

const isNewBooking = (createdAt?: string | Date): boolean => {
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 2 * 60 * 1000;
};

const getTimeAgo = (date?: string | Date): string => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

// Map internal status to Premium CSS classes
const statusConfig: Record<string, { label: string; className: string; tooltip?: string }> = {
    pending: { label: 'Pending', className: 'badge-pending', tooltip: 'Waiting for table assignment' },
    confirmed: { label: 'Confirmed', className: 'badge-success', tooltip: 'Table assigned and guest expected' },
    checked_in: { label: 'Checked-in', className: 'badge-success', tooltip: 'Guest has arrived and is seated' },
    completed: { label: 'Completed', className: 'badge-premium', tooltip: 'Dining experience finished and table released' },
    cancelled: { label: 'Cancelled', className: 'badge-danger', tooltip: 'Booking was cancelled by user or staff' },
    no_show: { label: 'No Show', className: 'badge-no-show', tooltip: 'Customer did not arrive for the reserved time slot. Table has been released automatically.' },
};

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    onComplete,
    onCheckIn,
    onReject,
    onAssign,
    onNoShow,
    onUnassign: _onUnassign,
    onChangeTable: _onChangeTable,
}) => {
    const [assigning, setAssigning] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [checkingIn, setCheckingIn] = useState(false);
    const [markingNoShow, setMarkingNoShow] = useState(false);

    const isNew = isNewBooking(booking.createdAt);
    const status = booking.status || 'pending';
    const badge = statusConfig[status] || statusConfig.pending;

    const handleAssign = () => {
        if (assigning) return;
        setAssigning(true);
        setTimeout(() => setAssigning(false), 800);
        onAssign(booking.id);
    };

    const handleComplete = async () => {
        if (completing) return;
        setCompleting(true);
        try { await onComplete(booking.id); } finally { setCompleting(false); }
    };

    const handleCheckIn = async () => {
        if (checkingIn) return;
        setCheckingIn(true);
        try { await onCheckIn(booking.id); } finally { setCheckingIn(false); }
    };

    const handleNoShow = async () => {
        if (markingNoShow) return;
        setMarkingNoShow(true);
        try { await onNoShow(booking.id); } finally { setMarkingNoShow(false); }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`booking-card status-${status} ${isNew ? 'is-new' : ''}`}
        >
            {isNew && <span className="booking-new-badge">NEW</span>}

            {/* ── Premium Header ── */}
            <div className="booking-header">
                <div>
                    <h3 className="customer-name">{booking.customerName}</h3>
                    <div className="customer-phone">
                        <Icons.phone size={12} strokeWidth={1.5} />
                        {booking.phone || booking.email || '—'}
                    </div>
                </div>

                <div className="status-group">
                    {booking.table && (
                        <div className="badge badge-table">
                            Table No - {booking.table.tableNumber}
                        </div>
                    )}
                    <div className={`badge ${badge.className}`} title={badge.tooltip}>
                        {badge.label}
                    </div>
                </div>
            </div>

            {/* ── Premium Info Row (Dashed T-Border) ── */}
            <div className="booking-info">
                <div className="booking-info-item">
                    <span>👥 Guests</span>
                    <strong>{booking.guests} {Number(booking.guests) === 1 ? 'Guest' : 'Guests'}</strong>
                </div>
                <div className="booking-info-item">
                    <span>📅 Date</span>
                    <strong>{formatDate(booking.date)}</strong>
                </div>
                <div className="booking-info-item">
                    <span>🕒 Time</span>
                    <strong>{formatTime(booking.time)}</strong>
                </div>
            </div>

            {/* ── Modern Tag Row ── */}
            {(booking.occasion || booking.preference) && (
                <div className="booking-tags">
                    {booking.occasion && (
                        <div className="tag-chip">✨ {booking.occasion}</div>
                    )}
                    {booking.preference && (
                        <div className="tag-chip">🌿 {booking.preference}</div>
                    )}
                </div>
            )}

            {/* ── Premium Glass Actions ── */}
            {/* Premium Glass Actions */}
            <div className="booking-actions">
                {/* 1. SEED STATE: Pending */}
                {status === 'pending' && (
                    <>
                        <button 
                            className="primary-btn" 
                            onClick={handleAssign}
                            disabled={assigning}
                        >
                            {assigning ? 'Opening...' : (booking.tableId ? 'Confirm' : 'Assign Table')}
                        </button>
                        <button 
                            className="danger-text-btn" 
                            onClick={() => onReject(booking)}
                        >
                            Reject
                        </button>
                    </>
                )}

                {/* 2. ENGAGED STATE: Confirmed */}
                {status === 'confirmed' && (
                    <>
                        <button 
                            className="primary-btn" 
                            onClick={handleCheckIn}
                            disabled={checkingIn}
                        >
                            {checkingIn ? '...' : 'Check-in'}
                        </button>
                        <button 
                            className="no-show-btn" 
                            onClick={handleNoShow}
                            disabled={markingNoShow}
                        >
                            {markingNoShow ? '...' : 'No-show'}
                        </button>
                    </>
                )}

                {/* 3. ACTIVE STATE: Checked-in */}
                {status === 'checked_in' && (
                    <button 
                        className="secondary-btn" 
                        onClick={handleComplete}
                        disabled={completing}
                        style={{ width: '100%' }}
                    >
                        {completing ? 'Completing...' : 'Complete Visit'}
                    </button>
                )}
            </div>

            <div className="footer-text">
                <Icons.clock size={11} strokeWidth={1.5} />
                Received {getTimeAgo(booking.createdAt)}
            </div>
        </motion.div>
    );
};

export default BookingCard;
