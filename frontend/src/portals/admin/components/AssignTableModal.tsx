import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/ui/Button';
import ModernSelect from '../../../components/ui/ModernSelect';

interface Table {
    id: number;
    tableNumber: number;
    capacity: number;
    status?: string;
}

interface AssignTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (tableId: number) => Promise<void>;
    tables: Table[];
    guestCount: number;
    bookingCustomer?: string;
}

const AssignTableModal: React.FC<AssignTableModalProps> = ({
    isOpen,
    onClose,
    onAssign,
    tables,
    guestCount,
    bookingCustomer,
}) => {
    const [assigning, setAssigning] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    if (!isOpen) return null;

    // Improvement #5: Smart sort — exact match → closest larger → rest (disabled)
    const sortedTables = [...tables].sort((a, b) => {
        const aFit = a.capacity >= guestCount;
        const bFit = b.capacity >= guestCount;
        if (aFit && !bFit) return -1;
        if (!aFit && bFit) return 1;
        if (aFit && bFit) return a.capacity - b.capacity; // smallest fitting first
        return a.capacity - b.capacity;
    });

    // Best match: smallest capacity that still fits
    const bestMatchId = sortedTables.find(t => t.capacity >= guestCount)?.id ?? null;

    const handleAssign = async (tableId: number) => {
        setAssigning(true);
        try {
            await onAssign(tableId);
            onClose();
        } catch {
            // error handled by parent
        } finally {
            setAssigning(false);
            setSelectedId(null);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (typeof document === 'undefined') return null;

    // Prepare options for ModernSelect with Premium badging
    const tableOptions = sortedTables.map(t => ({
        label: `Table ${t.tableNumber} — ${t.capacity} seats 👥${t.id === bestMatchId ? ' ⭐ Recommended' : ''}`,
        value: t.id
    }));

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="assign-modal-overlay" 
                    onClick={handleOverlayClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)' }}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ width: '440px', borderRadius: '16px', padding: '28px', background: 'var(--card-bg)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', gap: '24px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                                Assign Table
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', opacity: 0.6, color: 'var(--text-primary)' }}>
                                Select the best table for this reservation
                            </p>
                        </div>

                        {/* Booking Info Card */}
                        <div style={{ borderRadius: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div style={{ fontSize: '0.875rem', opacity: 0.7, color: 'var(--text-primary)' }}>
                                Booking for
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--brand-primary)', margin: '2px 0' }}>
                                {bookingCustomer || 'Walk-in Customer'}
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '0.875rem', opacity: 0.7, color: 'var(--text-primary)' }}>
                                {guestCount} guests 👥
                            </div>
                        </div>

                        {/* Table selector */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', opacity: 0.7, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                Available Tables
                            </label>
                            
                            <ModernSelect
                                value={selectedId || ''}
                                onChange={(id) => setSelectedId(id)}
                                options={tableOptions}
                                placeholder="Choose a table..."
                            />
                            
                            {sortedTables.length === 0 && (
                                <div style={{ marginTop: '12px', textAlign: 'center', opacity: 0.6 }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>No available tables at the moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                            <Button 
                                variant="ghost" 
                                onClick={onClose} 
                                disabled={assigning}
                                style={{ padding: '8px 16px', opacity: 0.7, transition: 'opacity 0.2s', background: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => selectedId && handleAssign(selectedId)}
                                loading={assigning}
                                disabled={!selectedId}
                                style={{ padding: '10px 20px', borderRadius: '12px', background: '#3b82f6', color: 'white', fontWeight: 500, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)', transition: 'background 0.2s' }}
                            >
                                Confirm Assignment
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AssignTableModal;
