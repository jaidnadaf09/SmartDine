import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Icons } from '../icons/IconSystem';
import '../../../src/styles/components/AvailabilitySidePanel.css';

interface DailyTableAvailabilityData {
  tableId: number;
  tableNumber: number | string;
  capacity: number;
  availableSlots: string[];
}

interface AvailabilitySidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  selectedTime?: string;
  selectedTableId?: number | null;
  onSelectTime: (slot: string, tableId: number) => void;
}

const AvailabilitySidePanel: React.FC<AvailabilitySidePanelProps> = ({ isOpen, onClose, date, selectedTime, selectedTableId, onSelectTime }) => {
  const [tables, setTables] = useState<DailyTableAvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const displayDate = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  useEffect(() => {
    if (!date || !isOpen) return;

    const fetchDailyAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/tables/daily-availability?date=${date}`);
        setTables(res.data);
      } catch (err: any) {
        setError('Failed to load table availability');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyAvailability();
  }, [date, isOpen]);

  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);

    return (
      today.getFullYear() === d.getFullYear() &&
      today.getMonth() === d.getMonth() &&
      today.getDate() === d.getDate()
    );
  };

  const getCurrentTime24 = () => {
    const now = new Date();
    return (
      now.getHours().toString().padStart(2, '0') +
      ':' +
      now.getMinutes().toString().padStart(2, '0')
    );
  };

  return (
    <div className={`availability-panel ${isOpen ? 'open' : ''}`}>
      <div className="availability-panel-header">
        <h3 className="availability-title">Available Tables</h3>
        <button className="availability-close-btn" onClick={onClose}>
          <Icons.x size={16} />
        </button>
      </div>

      <div className="panel-content availability-panel-content">
        {!date ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>Please select a date first.</div>
        ) : loading ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>Loading available slots...</div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>{error}</div>
        ) : tables.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>No tables found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="availability-subtext" style={{ fontSize: '14px', marginBottom: '16px' }}>
              Showing full schedule for <strong>{displayDate}</strong>
            </div>
            
            {tables.map(table => (
              <div key={table.tableId} className="availability-table-card">
                <div className="availability-table-header">
                  <strong className="availability-table-title">Table {table.tableNumber}</strong>
                  <span className="availability-seat-badge">{table.capacity} seats</span>
                </div>
                
                <div className="availability-slots">
                  {(() => {
                    const currentTime = getCurrentTime24();
                    const visibleSlots = isToday(date)
                      ? table.availableSlots.filter(slot => {
                          // convert "1:00 PM" → "13:00"
                          const [time, period] = slot.split(' ');
                          let [h, m] = time.split(':').map(Number);

                          if (period === 'PM' && h !== 12) h += 12;
                          if (period === 'AM' && h === 12) h = 0;

                          const slot24 =
                            h.toString().padStart(2, '0') +
                            ':' +
                            m.toString().padStart(2, '0');

                          return slot24 >= currentTime;
                        })
                      : table.availableSlots;

                    if (visibleSlots.length === 0) {
                      return <div style={{ fontSize: '13px', opacity: 0.5 }}>No upcoming slots</div>;
                    }

                    return visibleSlots.map(slot => (
                      <span
                        key={slot}
                        className={`slot-chip ${
                          selectedTableId === table.tableId && parse24To12(selectedTime || '') === slot
                            ? 'active'
                            : ''
                        }`}
                        onClick={() => {
                          onSelectTime(slot, table.tableId);
                          onClose();
                        }}
                      >
                        {slot}
                      </span>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const parse24To12 = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default AvailabilitySidePanel;
