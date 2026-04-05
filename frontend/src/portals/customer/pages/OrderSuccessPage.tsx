import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import '@styles/pages/OrderSuccess.css';

interface OrderSuccessState {
  orderId?: number;
  items?: { itemName: string; quantity: number }[];
  totalAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
}

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderSuccessState | null;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state?.orderId) {
      setLoading(true);
      api.get(`/orders/${state.orderId}`)
        .then(res => setOrder(res.data))
        .catch(() => setOrder(null))
        .finally(() => setLoading(false));
    }
  }, [state?.orderId]);

  const items = order?.items || state?.items || [];
  const totalAmount = order?.totalAmount ?? state?.totalAmount ?? 0;
  const paymentId = order?.paymentId || state?.paymentId;
  const orderId = order?.id || state?.orderId;
  const paymentMethod = state?.paymentMethod || 'online';

  const estimatedMinutes = 20 + (items.length > 3 ? 10 : 0);

  return (
    <div className="os-container">
      {/* Confetti-like gradient top bar */}
      <div className="os-top-accent" />

      <div className="os-card">
        {/* Success Icon */}
        <div className="os-icon-wrapper">
          <div className="os-icon-ring">
            <div className="os-icon-circle">
              <Icons.check size={32} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="os-header">
          <h1 className="os-title">Order Confirmed!</h1>
          <p className="os-subtitle">Your order has been placed successfully and is being prepared.</p>
        </div>

        {/* Order Summary Card */}
        <div className="os-summary-card">
          <div className="os-summary-header">
            <span className="os-summary-label">
              <Icons.clipboard size={15} className="os-inline-icon" />
              Order Summary
            </span>
            {orderId && <span className="os-order-id">#{orderId}</span>}
          </div>

          {loading ? (
            <div className="os-skeleton-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton os-skeleton-row" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="os-items-list">
              {items.map((item: any, i: number) => (
                <div key={i} className="os-item-row">
                  <span className="os-item-name">{item.itemName || item.name}</span>
                  <span className="os-item-qty">× {item.quantity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="os-no-items">Order details will appear in My Orders.</p>
          )}

          <div className="os-divider" />

          {/* Details Grid */}
          <div className="os-details-grid">
            <div className="os-detail-item">
              <span className="os-detail-label">Total Paid</span>
              <span className="os-detail-value os-gold">
                ₹{Number(totalAmount).toFixed(2)}
              </span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">Payment</span>
              <span className="os-detail-value">
                {paymentMethod === 'wallet' ? '🏦 Wallet' : '💳 Online'}
              </span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">Est. Time</span>
              <span className="os-detail-value">~{estimatedMinutes} mins</span>
            </div>
            {paymentId && (
              <div className="os-detail-item os-detail-full">
                <span className="os-detail-label">Payment Ref</span>
                <span className="os-detail-value os-ref">{paymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer hint */}
        <div className="os-timer-hint">
          <Icons.clock size={15} className="os-inline-icon" />
          <span>Your food will be ready in approximately <strong>{estimatedMinutes} minutes</strong></span>
        </div>

        {/* Actions */}
        <div className="os-actions">
          <button
            className="os-btn-primary"
            onClick={() => navigate('/customer/myorders')}
          >
          <Icons.historyIcon size={18} />
            View My Orders
          </button>
          <button
            className="os-btn-secondary"
            onClick={() => navigate('/order')}
          >
            <Icons.plus size={18} />
            Order More
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
