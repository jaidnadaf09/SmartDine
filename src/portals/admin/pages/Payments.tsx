import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;

            if (!token) {
                setError('Auth token missing.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/payments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch payments');

            const data = await res.json();
            setPayments(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch payments:', err);
            setError(err.message || 'Failed to load payments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Transaction History</h2>

            {loading ? (
                <div className="loading-state">
                    <p>Loading payments...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchPayments}>Retry</button>
                </div>
            ) : payments.length === 0 ? (
                <div className="empty-state">
                    <p>No payment transactions found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Payment ID</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id}>
                                    <td><strong>{payment.customerName}</strong></td>
                                    <td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}</td>
                                    <td><code>{payment.paymentId || 'N/A'}</code></td>
                                    <td>
                                        <span className={`status-badge status-${payment.paymentStatus === 'paid' ? 'completed' : 'cancelled'}`}>
                                            {payment.paymentStatus}
                                        </span>
                                    </td>
                                    <td>{new Date(payment.updatedAt).toLocaleDateString()}</td>
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
