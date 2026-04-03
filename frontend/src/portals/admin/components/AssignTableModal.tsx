import React, { useState } from 'react';
import { Icons } from '../../../components/icons/IconSystem';
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

    // Prepare options for ModernSelect
    const tableOptions = sortedTables.map(t => ({
        label: `Table ${t.tableNumber} (${t.capacity} seats)${t.id === bestMatchId ? ' ⭐ Best Match' : ''}`,
        value: t.id
    }));

    return (
        <div className="assign-modal-overlay" onClick={handleOverlayClick}>
            <div className="assign-modal-box">
                {/* Header */}
                <div className="assign-modal-header">
                    <div>
                        <h2 className="assign-modal-title">Select a Table</h2>
                        <p className="assign-modal-sub">
                            {bookingCustomer ? `Booking for ${bookingCustomer} · ` : ''}
                            {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                        </p>
                    </div>
                    <button className="assign-modal-close" onClick={onClose}>
                        <Icons.close size={16} />
                    </button>
                </div>

                {/* Table selector */}
                <div className="assign-modal-body" style={{ minHeight: '140px' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Available Tables
                        </label>
                        <ModernSelect
                            value={selectedId || ''}
                            onChange={(id) => setSelectedId(id)}
                            options={tableOptions}
                            placeholder="Choose a table..."
                        />
                    </div>

                    {selectedId && (
                        <div className="fade-in" style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)', marginTop: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                Selected <strong>Table {tables.find(t => t.id === selectedId)?.tableNumber}</strong> for {guestCount} guests.
                            </p>
                        </div>
                    )}

                    {sortedTables.length === 0 && (
                        <div className="booking-empty-state">
                            <Icons.armchair size={32} className="booking-empty-state-icon" />
                            <p>No available tables at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="assign-modal-footer">
                    <Button variant="ghost" onClick={onClose} disabled={assigning}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => selectedId && handleAssign(selectedId)}
                        loading={assigning}
                        disabled={!selectedId}
                        style={{ minWidth: '140px' }}
                    >
                        Confirm Assignment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AssignTableModal;
