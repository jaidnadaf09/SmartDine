import React, { useState, useEffect } from 'react';
import api from '@utils/api';
import { formatTime, formatDate } from '@utils/dateFormatter';
import { useAuth } from '@context/AuthContext';
import { Icons } from '@components/icons/IconSystem';
import ChefOrderModal from '../components/ChefOrderModal';
import Input from '@ui/SearchInput';
import Select from '@ui/Select';
import useDebounce from '../../../hooks/useDebounce';
import '@styles/portals/Portals.css';
import '@styles/portals/ChefPortal.css';
import '@styles/portals/ChefOrders.css';

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

interface Order {
    id: number;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    customer?: { id: number; name: string };
    User?: { name: string };
    specialInstructions?: string;
}

const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const fetchOrderHistory = async () => {
        if (!token) return;
        setLoading(true);
        try {
            // Server-side pagination and filtering
            const res = await api.get(`/orders?includeHistory=true&page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}&status=${statusFilter}&dateRange=${dateFilter}&sortBy=${sortBy}&t=${Date.now()}`);
            
            setOrders(res.data.orders);
            setTotalItems(res.data.total);
            setTotalPages(res.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order history:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, [token, currentPage, debouncedSearchTerm, statusFilter, dateFilter, sortBy]);

    useEffect(() => {
        const scrollContainer = document.querySelector(".admin-content");
        if (scrollContainer) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter, dateFilter, sortBy]);

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Loading order history...</p>
        </div>
    );

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="chef-page">
            <div className="admin-toolbar">
                    <div className="admin-toolbar-left">
                        <Input
                            placeholder="Search order ID, customer or dish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Icons.search size={16} />}
                            className="admin-search"
                        />
                    </div>

                    <div className="admin-toolbar-right">
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { label: "All Status", value: "all" },
                                { label: "Completed", value: "completed" },
                                { label: "Cancelled", value: "cancelled" }
                            ]}
                        />

                        <Select
                            value={dateFilter}
                            onChange={setDateFilter}
                            options={[
                                { label: "All Time", value: "all" },
                                { label: "Today", value: "today" },
                                { label: "Last 7 days", value: "week" },
                                { label: "This Month", value: "month" }
                            ]}
                        />

                        <Select
                            value={sortBy}
                            onChange={setSortBy}
                            options={[
                                { label: "Newest First", value: "newest" },
                                { label: "Oldest First", value: "oldest" },
                                { label: "Highest Amount", value: "highAmount" },
                                { label: "Lowest Amount", value: "lowAmount" }
                            ]}
                        />
                    </div>
                </div>

            {orders.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '80px 20px', background: 'transparent' }}>
                    <div className="chef-empty-icon" style={{ opacity: 0.2 }}>
                        <Icons.historyIcon size={80} />
                    </div>
                    <h3 className="chef-empty-title" style={{ marginTop: '24px', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        No History Found
                    </h3>
                    <p className="chef-empty-sub" style={{ maxWidth: '400px', margin: '12px auto 0', color: 'var(--text-muted)' }}>
                        No orders match your current filters. Try adjusting your search or date range.
                    </p>
                </div>
            ) : (
                <>
                    <div className="chef-cards-grid">
                        {orders.map(order => (
                            <div 
                                key={order.id} 
                                className={`premium-order-card history-card ${order.status === 'cancelled' ? 'status-cancelled-border' : ''}`}
                                style={{ 
                                    opacity: order.status === 'cancelled' ? 0.85 : 1,
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}
                                onClick={() => setSelectedOrder(order)}
                            >
                                {/* Card Header: ID + Status */}
                                <div className="premium-card-header" style={{ marginBottom: 0, paddingBottom: '8px' }}>
                                    <div className="premium-card-id" style={{ fontSize: '0.9rem' }}>
                                        <span className="order-hash">#</span>{order.id}
                                    </div>
                                    <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Customer Info: Compact */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                    <Icons.user size={14} className="icon-primary" />
                                    {order.customer?.name || order.User?.name || 'Guest'}
                                </div>

                                {/* Timestamp: Compact */}
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Icons.calendar size={12} />
                                    <span>
                                        {order.status === 'completed' ? 'Completed' : 'Cancelled'} on: {formatDate(order.updatedAt)} • {formatTime(order.updatedAt)}
                                    </span>
                                </div>

                                {/* Main Item: Highlighted */}
                                {order.items && order.items.length > 0 && (
                                    <div style={{ 
                                        fontWeight: 500, 
                                        marginTop: '4px', 
                                        color: 'var(--text-primary)',
                                        fontSize: '0.9rem',
                                        borderLeft: '2px solid var(--brand-primary)',
                                        paddingLeft: '10px'
                                    }}>
                                        {order.items[0].itemName}
                                        {order.items.length > 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>+{order.items.length - 1} more items</span>}
                                    </div>
                                )}

                                {/* Amount: Bold */}
                                <div style={{ 
                                    marginTop: '4px', 
                                    fontSize: '1.1rem', 
                                    fontWeight: 800, 
                                    color: 'var(--brand-primary)' 
                                }}>
                                    ₹{order.totalAmount}
                                </div>

                                {/* View Details Footer */}
                                <div style={{ 
                                    marginTop: '4px', 
                                    paddingTop: '10px', 
                                    borderTop: '1px dashed var(--border-subtle)',
                                    fontSize: '0.75rem', 
                                    color: 'var(--brand-primary)', 
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}>
                                    Click to view full details <Icons.right size={12} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pagination">
                        <div className="pagination-info">
                            Showing {startIndex + 1} to {Math.min(startIndex + orders.length, totalItems)} of {totalItems} entries
                        </div>
                        <div className="pagination-buttons">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                <Icons.left size={18} />
                            </button>
                            <div className="pagination-page-indicator">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                <Icons.right size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedOrder && (
                <ChefOrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default OrderHistory;
