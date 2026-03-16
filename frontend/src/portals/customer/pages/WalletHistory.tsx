import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';
import '../../../styles/Portals.css';
import '../../../styles/CustomerPortal.css';


// Using centralized api instance

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
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner" />
      <p>Loading your wallet history…</p>
    </div>
  );

  if (!user) return (
    <div className="cp-loading">
      <p>Please log in first</p>
      <button onClick={() => navigate('/login')} className="cp-retry-btn">Go to Login</button>
    </div>
  );

  return (
    <div className="cp-page">
      <div className="cp-content">
        <div className="cp-welcome" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div>
            <h1 className="cp-title">Wallet History</h1>
            <p className="cp-subtitle">Current Balance: <strong style={{ color: 'var(--success)' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(user.walletBalance || 0))}
            </strong></p>
          </div>
          <button className="cp-browse-btn" onClick={() => navigate('/profile')} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            ← Back to Profile
          </button>
        </div>

        <section className="cp-section">
          <div className="cp-cards-grid single-col">
            {error ? (
              <div className="cp-error">⚠️ {error}</div>
            ) : transactions.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon"><Icons.card size={48} className="icon-muted" /></div>
                <p>No wallet transactions found.</p>
              </div>
             ) : (
               transactions.map(tx => {
                 // Check if there is complex formatting with a dash separating the type and items
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
               })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WalletHistory;
