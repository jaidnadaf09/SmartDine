import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/Portals.css';
import '../../../styles/CustomerPortal.css';

const API_URL = import.meta.env.VITE_API_URL;

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
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_URL}/wallet/transactions`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch wallet history');
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not load wallet history');
    } finally {
      setLoading(false);
    } // eslint-disable-next-line
  }, [user]);

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
            <p className="cp-subtitle">Current Balance: <strong style={{ color: 'var(--success-color, #27ae60)' }}>
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(user.walletBalance || 0))}
            </strong></p>
          </div>
          <button className="cp-browse-btn" onClick={() => navigate('/profile')} style={{ background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
            ← Back to Profile
          </button>
        </div>

        <section className="cp-section">
          <div className="cp-cards-grid single-col">
            {error ? (
              <div className="cp-error">⚠️ {error}</div>
            ) : transactions.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">💳</div>
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
                     <div style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '5px' }}>
                       {mainDescription}
                     </div>
                     {itemsDescription && (
                       <div style={{ fontSize: '0.9rem', color: 'var(--text-color)', opacity: 0.85, marginBottom: '8px', lineHeight: '1.4' }}>
                         Items: {itemsDescription}
                       </div>
                     )}
                     <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.7 }}>
                       {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                     </div>
                   </div>
                   <div style={{ 
                     fontWeight: 'bold', fontSize: '1.2rem',
                     color: tx.type === 'credit' ? 'var(--success-color, #27ae60)' : 'var(--danger-color, #e74c3c)',
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
