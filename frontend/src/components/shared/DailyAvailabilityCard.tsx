import React, { useState, useEffect } from 'react';
import { Icons } from '../icons/IconSystem';
import api from '../../utils/api';

interface DailyTableAvailabilityData {
  tableId: number;
  tableNumber: number | string;
  capacity: number;
  availableSlots: string[];
}

interface DailyAvailabilityCardProps {
  date: string;
  onSelectTime: (slot: string) => void;
}

const DailyAvailabilityCard: React.FC<DailyAvailabilityCardProps> = ({ date, onSelectTime }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tables, setTables] = useState<DailyTableAvailabilityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format date for display: "15 April"
  const displayDate = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

  useEffect(() => {
    const fetchDailyAvailability = async () => {
      if (!date) {
        setTables([]);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/tables/daily-availability?date=${date}`);
        setTables(res.data);
      } catch (err: any) {
        setError('Failed to load daily availability');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyAvailability();
  }, [date]);

  if (!date) return null;

  return (
    <div className="premium-card daily-availability-wrapper" style={{ margin: '16px 0', border: '1px solid rgba(224, 185, 122, 0.15)', borderRadius: '12px', background: 'var(--pf-card-bg, rgba(23, 23, 23, 0.6))', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
      <div 
        className="available-tables-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="icon-box" style={{ background: 'rgba(224, 185, 122, 0.1)', padding: '6px', borderRadius: '8px' }}>
            <Icons.calendar size={16} color="var(--primary, #e0b97a)" />
          </span>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>View Availability for Selected Date</span>
        </div>
        <Icons.chevronDown size={18} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
      </div>

      {isExpanded && (
        <div className="available-tables-content popup-animation" style={{ padding: '0 16px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {loading ? (
             <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>Loading available slots...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>{error}</div>
          ) : tables.length === 0 ? (
             <div style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>No tables found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', opacity: 0.9 }}>
                Available Tables for {displayDate}
              </div>
              
              {tables.map(table => (
                <div key={table.tableId} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 600 }}>Table {table.tableNumber}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>{table.capacity} seats</span>
                  </div>
                  
                  {table.availableSlots.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {table.availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            onSelectTime(slot);
                            setIsExpanded(false);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            background: 'rgba(224,185,122,0.12)',
                            border: '1px solid rgba(224,185,122,0.25)',
                            color: 'var(--text, #f5efe7)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s',
                            fontWeight: 500
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(224,185,122,0.25)'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(224,185,122,0.12)'}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', opacity: 0.6 }}>Fully booked</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyAvailabilityCard;
