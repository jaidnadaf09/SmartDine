import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAuthModal } from '@context/AuthModalContext';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import { formatDate, formatTime } from '@utils/dateFormatter';
import '@styles/portals/Portals.css';
import '@styles/portals/CustomerPortal.css';
import GlobalErrorState from '@components/ui/GlobalErrorState';
import { DateRange, type RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

interface WalletTransaction {
  id: number;
  amount: string;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
}

const WalletHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  
  // Staged filtering: tempRange for picker, dateRange for active filter
  const [dateRange, setDateRange] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    key: 'selection'
  });
  
  const [tempRange, setTempRange] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    key: 'selection'
  });

  const pickerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const res = await api.get('/wallet/transactions');
      setTransactions(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Could not load wallet history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle outside click to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPicker && pickerRef.current && !pickerRef.current.contains(event.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
        // Reset tempRange to active dateRange when closing without applying
        setTempRange(dateRange);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker, dateRange]);

  const filteredTransactions = transactions.filter(tx => {
    if (!dateRange.startDate || !dateRange.endDate) return true;
    
    const txDate = new Date(tx.createdAt);
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return txDate >= start && txDate <= end;
  });

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);

  const handleRangeChange = (ranges: RangeKeyDict) => {
    setTempRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: 'selection'
    });
  };

  const applyFilter = () => {
    setDateRange(tempRange);
    setVisibleCount(5);
    setShowPicker(false);
  };

  const clearFilter = () => {
    const emptyRange = { startDate: undefined, endDate: undefined, key: 'selection' };
    setTempRange(emptyRange);
    setDateRange(emptyRange);
    setVisibleCount(5);
    setShowPicker(false);
  };

  const togglePicker = (e: React.MouseEvent) => {
    if (!showPicker) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPickerPos({
        top: rect.bottom + window.scrollY + 8,
        left: Math.max(20, rect.right + window.scrollX - 340) // Responsive safety
      });
      setTempRange(dateRange); // Initialize temp with active
    }
    setShowPicker(!showPicker);
  };

  const formatDateRangeDisplay = (range: { startDate?: Date, endDate?: Date }) => {
    if (!range.startDate || !range.endDate) return "Filter by date";
    return `${format(range.startDate, "dd MMM")} - ${format(range.endDate, "dd MMM")}`;
  };

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner" />
      <p>Loading your wallet history…</p>
    </div>
  );

  if (!user) return (
    <div className="cp-loading">
      <p>Please log in first</p>
      <button 
        onClick={() => {
          navigate('/');
          openAuthModal('login');
        }} 
        className="cp-retry-btn"
      >
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="cp-page">
      <div className="cp-content">
        <div className="cp-welcome" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 className="cp-title">Wallet History</h1>
            <p className="cp-subtitle">Current Balance: <strong style={{ color: 'var(--success)' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(user.walletBalance || 0))}
            </strong></p>
          </div>
          
          <div className="wallet-header-actions">
            <div className="wallet-filter-wrapper">
               <button 
                 ref={triggerRef}
                 className="wallet-filter-trigger"
                 onClick={togglePicker}
               >
                 <Icons.filter size={15} />
                 <span>Filter</span>
                 {dateRange.startDate && dateRange.endDate && (
                   <span className="wallet-filter-value">
                     {formatDateRangeDisplay(dateRange)}
                   </span>
                 )}
               </button>
            </div>
            <button className="cp-browse-btn" onClick={() => navigate('/profile')} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)', margin: 0 }}>
              ← Back to Profile
            </button>
          </div>
        </div>

        {showPicker && createPortal(
          <>
            <div className="wallet-date-backdrop" onClick={() => setShowPicker(false)} />
            <div 
              className="wallet-date-popover" 
              ref={pickerRef}
              style={{ 
                top: pickerPos.top,
                left: pickerPos.left,
                position: 'absolute'
              }}
            >
              <DateRange
                ranges={[tempRange as any]}
                onChange={handleRangeChange}
                moveRangeOnFirstSelection={false}
                rangeColors={['#C6A769']}
              />
              
              <div className="wallet-filter-actions">
                <button onClick={applyFilter} className="pf-primary-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Apply
                </button>
                <button onClick={clearFilter} className="pf-ghost-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Clear
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

        <section className="cp-section">
          <div className="cp-cards-grid single-col">
            {error ? (
              <GlobalErrorState 
                    title="Failed to load wallet history" 
                    description={error} 
                    onRetry={fetchHistory} 
              />
            ) : filteredTransactions.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon"><Icons.card size={48} className="icon-muted" /></div>
                <p>No transactions found for the selected range.</p>
                {(dateRange.startDate || dateRange.endDate) && (
                  <button className="wallet-view-more-btn" onClick={() => {
                    setDateRange({ startDate: undefined, endDate: undefined, key: 'selection' });
                    setVisibleCount(5);
                  }}>
                    Clear Filter
                  </button>
                )}
              </div>
             ) : (
               <>
                 {visibleTransactions.map(tx => {
                   const parts = tx.description.split(' - Items: ');
                   const mainDescription = parts[0];
                   const itemsDescription = parts[1];

                   return (
                   <div key={tx.id} className="cp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                         {mainDescription}
                       </div>
                       {itemsDescription && (
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', opacity: 0.85, marginBottom: '8px', lineHeight: '1.4' }}>
                           Items: {itemsDescription}
                         </div>
                       )}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.7 }}>
                        {formatDate(tx.createdAt)} · {formatTime(tx.createdAt)}
                       </div>
                     </div>
                      <div style={{ 
                        fontWeight: 'bold', fontSize: '1.2rem',
                        color: tx.type === 'credit' ? 'var(--success)' : 'var(--error)',
                        marginLeft: '15px'
                      }}>
                       {tx.type === 'credit' ? '+' : '-'}
                       {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(tx.amount))}
                     </div>
                   </div>
                   );
                 })}

                 {visibleCount < filteredTransactions.length && (
                   <button 
                     className="wallet-view-more-btn"
                     onClick={() => setVisibleCount(prev => prev + 5)}
                   >
                     View More
                   </button>
                 )}
               </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WalletHistory;
