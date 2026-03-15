import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';


// Using centralized api instance

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Auth token missing.');
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/admin/payments');
            setPayments(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch payments:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Transaction History</h1>
                <p className="admin-page-subtitle">Monitor all financial transactions and payment statuses.</p>
                <div className="admin-header-divider"></div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <p>Loading payments...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <button onClick={fetchPayments}>Retry</button>
                </div>
            ) : payments.length === 0 ? (
                <div className="empty-state">
                    <p>No payment transactions found.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Transaction ID</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td><strong>{payment.customerName}</strong></td>
                                    <td style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}</td>
                                    <td><code style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>{payment.paymentId || 'N/A'}</code></td>
                                    <td>
                                        <span className={`status-pill-modern status-modern-${payment.paymentStatus === 'paid' ? 'paid' : 'cancelled'}`}>
                                            {payment.paymentStatus}
                                        </span>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{new Date(payment.updatedAt).toLocaleDateString()}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Payments;
