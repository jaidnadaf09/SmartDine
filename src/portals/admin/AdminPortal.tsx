import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Portals.css';

interface RecentOrder {
  id: number;
  tableNumber: number;
  time: string;
  items: string;
  amount: number;
  status: 'preparing' | 'ready' | 'delivered';
}

interface OrderItem {
  id: string;
  orderId: number;
  itemName: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  assignedChef: number | null;
  estimatedTime: number;
}

type AdminTab = 'overview' | 'staff' | 'menu' | 'tables';

interface DailySalesData {
  day: string;
  orders: number;
  sales: number;
}

interface StaffMember {
  id: number;
  name: string;
  role: 'CHEF' | 'WAITER';
  email: string;
  shift: 'Morning' | 'Evening';
  status: 'active' | 'inactive';
}

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [stats] = useState({
    totalOrders: 156,
    totalRevenue: 1245.5,
    activeUsers: 23,
    tableCapacity: 24,
    staffMembers: 12,
    averageRating: 4.8,
  });

    // Demo menu items
    const [menuItems] = useState([
      { id: 1, name: 'Latte', category: 'Coffee', price: 4.5, status: 'available' },
      { id: 2, name: 'Croissant', category: 'Pastries', price: 3.0, status: 'available' },
      { id: 3, name: 'Avocado Toast', category: 'Sandwiches', price: 5.5, status: 'unavailable' },
      { id: 4, name: 'Chocolate Cake', category: 'Desserts', price: 4.0, status: 'available' },
    ]);

    // Demo tables
    const [tables] = useState([
      { id: 1, number: 1, capacity: 4, status: 'occupied' },
      { id: 2, number: 2, capacity: 2, status: 'available' },
      { id: 3, number: 3, capacity: 6, status: 'reserved' },
      { id: 4, number: 4, capacity: 4, status: 'available' },
    ]);

  const [dailySalesData] = useState<DailySalesData[]>([
    { day: 'Mon', orders: 38, sales: 420 },
    { day: 'Tue', orders: 40, sales: 510 },
    { day: 'Wed', orders: 38, sales: 490 },
    { day: 'Thu', orders: 42, sales: 580 },
    { day: 'Fri', orders: 60, sales: 740 },
    { day: 'Sat', orders: 64, sales: 880 },
    { day: 'Sun', orders: 55, sales: 680 },
  ]);

  const [monthlySalesData] = useState([
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 13200 },
    { month: 'Mar', revenue: 14100 },
    { month: 'Apr', revenue: 13800 },
    { month: 'May', revenue: 15600 },
    { month: 'Jun', revenue: 17200 },
    { month: 'Jul', revenue: 17800 },
    { month: 'Aug', revenue: 17500 },
    { month: 'Sep', revenue: 18100 },
    { month: 'Oct', revenue: 18900 },
    { month: 'Nov', revenue: 19200 },
    { month: 'Dec', revenue: 22400 },
  ]);

  const [recentOrders] = useState<RecentOrder[]>([
    {
      id: 1,
      tableNumber: 3,
      time: '10:30 AM',
      items: 'Latte x2, Croissant',
      amount: 15.99,
      status: 'preparing',
    },
    {
      id: 2,
      tableNumber: 7,
      time: '10:45 AM',
      items: 'Espresso, Sandwich',
      amount: 13.99,
      status: 'ready',
    },
    {
      id: 3,
      tableNumber: 5,
      time: '11:00 AM',
      items: 'Cappuccino x3',
      amount: 16.47,
      status: 'delivered',
    },
  ]);

  const [categoryData] = useState([
    { category: 'Coffee', percentage: 45, color: '#8B4513' },
    { category: 'Pastries', percentage: 25, color: '#D2691E' },
    { category: 'Sandwiches', percentage: 15, color: '#DEB887' },
    { category: 'Desserts', percentage: 10, color: '#D4AF37' },
    { category: 'Others', percentage: 5, color: '#C8A882' },
  ]);

  const [popularItems] = useState([
    { name: 'Latte Art', units: 298 },
    { name: 'Espresso', units: 245 },
    { name: 'Cappuccino', units: 218 },
    { name: 'Croissant', units: 195 },
    { name: 'Avocado Toast', units: 172 },
    { name: 'Matcha Latte', units: 165 },
    { name: 'Chocolate Cake', units: 158 },
    { name: 'Iced Coffee', units: 155 },
  ]);

  const [staffMembers] = useState<StaffMember[]>([
    { id: 1, name: 'John Chef', role: 'CHEF', email: 'john@javabite.com', shift: 'Morning', status: 'active' },
    { id: 2, name: 'Sarah Waiter', role: 'WAITER', email: 'sarah@javabite.com', shift: 'Morning', status: 'active' },
    { id: 3, name: 'Mike Chef', role: 'CHEF', email: 'mike@javabite.com', shift: 'Evening', status: 'active' },
    { id: 4, name: 'Emma Waiter', role: 'WAITER', email: 'emma@javabite.com', shift: 'Evening', status: 'active' },
    { id: 5, name: 'Alex Chef', role: 'CHEF', email: 'alex@javabite.com', shift: 'Morning', status: 'active' },
    { id: 6, name: 'Rachel Chef', role: 'CHEF', email: 'rachel@javabite.com', shift: 'Evening', status: 'active' },
    { id: 7, name: 'Tom Waiter', role: 'WAITER', email: 'tom@javabite.com', shift: 'Morning', status: 'active' },
    { id: 8, name: 'Lisa Chef', role: 'CHEF', email: 'lisa@javabite.com', shift: 'Morning', status: 'inactive' },
  ]);

  // Order items with individual tracking and chef assignment
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: '1-1', orderId: 1, itemName: 'Latte', quantity: 1, status: 'preparing', assignedChef: 1, estimatedTime: 3 },
    { id: '1-2', orderId: 1, itemName: 'Latte', quantity: 1, status: 'pending', assignedChef: null, estimatedTime: 3 },
    { id: '1-3', orderId: 1, itemName: 'Croissant', quantity: 1, status: 'pending', assignedChef: null, estimatedTime: 2 },
    { id: '2-1', orderId: 2, itemName: 'Espresso', quantity: 1, status: 'ready', assignedChef: 3, estimatedTime: 2 },
    { id: '2-2', orderId: 2, itemName: 'Sandwich', quantity: 1, status: 'ready', assignedChef: 1, estimatedTime: 5 },
    { id: '3-1', orderId: 3, itemName: 'Cappuccino', quantity: 1, status: 'delivered', assignedChef: 1, estimatedTime: 3 },
    { id: '3-2', orderId: 3, itemName: 'Cappuccino', quantity: 1, status: 'delivered', assignedChef: 3, estimatedTime: 3 },
    { id: '3-3', orderId: 3, itemName: 'Cappuccino', quantity: 1, status: 'delivered', assignedChef: 1, estimatedTime: 3 },
  ]);

  const [inventoryItems] = useState([
    { id: 1, name: 'Coffee Beans', quantity: 50, unit: 'kg', status: 'sufficient' },
    { id: 2, name: 'Milk', quantity: 30, unit: 'L', status: 'sufficient' },
    { id: 3, name: 'Sugar', quantity: 20, unit: 'kg', status: 'low' },
    { id: 4, name: 'Cups', quantity: 500, unit: 'pcs', status: 'sufficient' },
    { id: 5, name: 'Croissants', quantity: 15, unit: 'pcs', status: 'critical' },
  ]);

  // Function to assign pending item to a chef
  const assignItemToChef = (itemId: string, chefId: number) => {
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, assignedChef: chefId, status: 'preparing' } : item
      )
    );
  };

  // Function to get available chefs (those not currently preparing an item)
  const getAvailableChefs = () => {
    const chefsCooking = new Set(orderItems
      .filter(item => item.status === 'preparing')
      .map(item => item.assignedChef)
      .filter(Boolean));
    
    return staffMembers.filter(
      staff => staff.role === 'CHEF' && staff.status === 'active' && !chefsCooking.has(staff.id)
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="portal-container">
        <p>Please log in first</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  // Check if user is admin - only admins can access this portal
  if (user.role !== 'admin') {
    return (
      <div className="portal-container">
        <div className="unauthorized-access">
          <h2>🔒 Access Denied</h2>
          <p>Only administrators can access the Admin Portal.</p>
          <p>Your current role: <strong>{user.role}</strong></p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  // Find max values for scaling
  const maxOrders = Math.max(...dailySalesData.map(d => d.orders));
  const maxSales = Math.max(...dailySalesData.map(d => d.sales));

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>☕ Admin Portal</h1>
        <div className="user-info">
          <div className="user-details">
            <span>Welcome, {user.name}!</span>
            <span className="user-role-badge admin">👑 Admin</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="portal-content">
        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu Items
          </button>
          <button
            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            Table Management
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics */}
            <div className="section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <h3>${stats.totalRevenue.toFixed(2)}</h3>
                  <p>Total Revenue</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3>{stats.activeUsers}</h3>
                  <p>Active Users</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🪑</div>
                  <h3>{stats.tableCapacity}</h3>
                  <p>Table Capacity</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👨‍💼</div>
                  <h3>{stats.staffMembers}</h3>
                  <p>Staff Members</p>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <h3>{stats.averageRating}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </div>

            {/* Daily Sales & Orders Chart */}
            <div className="section">
              <h2>Daily Sales & Orders</h2>
              <div className="chart-section large">
                <div className="bar-chart">
                  <div className="chart-y-axis">
                    <div className="y-label">1000</div>
                    <div className="y-label">750</div>
                    <div className="y-label">500</div>
                    <div className="y-label">250</div>
                    <div className="y-label">0</div>
                  </div>
                  <div className="chart-bars-container">
                    {dailySalesData.map((data) => (
                      <div key={data.day} className="bar-group">
                        <div className="bars-wrapper">
                          <div
                            className="bar bar-sales"
                            style={{
                              height: `${(data.sales / maxSales) * 280}px`,
                            }}
                            title={`Sales: $${data.sales}`}
                          />
                          <div
                            className="bar bar-orders"
                            style={{
                              height: `${(data.orders / maxOrders) * 280}px`,
                            }}
                            title={`Orders: ${data.orders}`}
                          />
                        </div>
                        <div className="bar-label">{data.day}</div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-y-axis-right">
                    <div className="y-label">80</div>
                    <div className="y-label">60</div>
                    <div className="y-label">40</div>
                    <div className="y-label">20</div>
                    <div className="y-label">0</div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item-inline">
                    <span className="legend-color-inline" style={{ backgroundColor: '#D2691E' }} />
                    <span>Sales ($)</span>
                  </div>
                  <div className="legend-item-inline">
                    <span className="legend-color-inline" style={{ backgroundColor: '#1E90FF' }} />
                    <span>Orders</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Sales Trend */}
            <div className="section">
              <h2>Monthly Sales Trend</h2>
              <div className="chart-section large">
                <svg className="line-chart" viewBox="0 0 1000 400">
                  {/* Grid lines */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#D2691E" stopOpacity="1" />
                      <stop offset="100%" stopColor="#D2691E" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Horizontal grid lines */}
                  <line x1="80" y1="340" x2="950" y2="340" stroke="#e8d4c0" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="80" y1="255" x2="950" y2="255" stroke="#e8d4c0" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="80" y1="170" x2="950" y2="170" stroke="#e8d4c0" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="80" y1="85" x2="950" y2="85" stroke="#e8d4c0" strokeWidth="1" strokeDasharray="5,5" />

                  {/* Y-axis labels */}
                  <text x="40" y="345" fontSize="12" fill="#999" textAnchor="end">0</text>
                  <text x="40" y="260" fontSize="12" fill="#999" textAnchor="end">6000</text>
                  <text x="40" y="175" fontSize="12" fill="#999" textAnchor="end">12000</text>
                  <text x="40" y="90" fontSize="12" fill="#999" textAnchor="end">18000</text>
                  <text x="40" y="20" fontSize="12" fill="#999" textAnchor="end">24000</text>

                  {/* Line path */}
                  <polyline
                    points="95,312 168,290 241,268 314,279 387,235 460,189 533,170 606,178 679,153 752,131 825,118 898,60"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {monthlySalesData.map((data, idx) => {
                    const x = 95 + idx * 73;
                    const y = [312, 290, 268, 279, 235, 189, 170, 178, 153, 131, 118, 60][idx];
                    return (
                      <g key={data.month}>
                        <circle cx={x} cy={y} r="4" fill="#D2691E" />
                        <circle cx={x} cy={y} r="2.5" fill="white" />
                      </g>
                    );
                  })}

                  {/* X-axis labels */}
                  {monthlySalesData.map((data, idx) => (
                    <text key={data.month} x={95 + idx * 73} y="375" fontSize="12" fill="#666" textAnchor="middle">
                      {data.month}
                    </text>
                  ))}

                  {/* Tooltip/Highlight */}
                  <g className="tooltip-group">
                    <line x1="459" y1="85" x2="459" y2="345" stroke="#D2691E" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                    <rect x="380" y="220" width="160" height="35" fill="white" stroke="#D2691E" strokeWidth="1" rx="5" opacity="0.95" />
                    <text x="460" y="240" fontSize="12" fill="#D2691E" fontWeight="600" textAnchor="middle">May</text>
                    <text x="460" y="255" fontSize="11" fill="#666" textAnchor="middle">Revenue ($): 15600</text>
                  </g>
                </svg>
                <div className="chart-legend">
                  <div className="legend-item-inline">
                    <span className="legend-color-inline" style={{ backgroundColor: '#D2691E' }} />
                    <span>Revenue ($)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Recent Orders */}
            <div className="admin-main-grid">
              {/* Top Menu Items Chart */}
              <div className="chart-section">
                <h3>Top Menu Items</h3>
                <div className="chart-container">
                  {popularItems.map((item) => (
                    <div key={item.name} className="chart-bar-item">
                      <div className="chart-label">
                        <span>{item.name}</span>
                        <span className="chart-value">{item.units}</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ width: `${(item.units / 298) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="chart-section">
                <h3>Sales by Category</h3>
                <div className="pie-chart">
                  <div className="pie-visual">
                    <svg viewBox="0 0 100 100" className="pie-svg">
                      {/* Coffee - 45% */}
                      <path
                        d="M 50 50 L 50 5 A 45 45 0 0 1 81.91 18.09 Z"
                        fill="#8B4513"
                      />
                      {/* Pastries - 25% */}
                      <path
                        d="M 50 50 L 81.91 18.09 A 45 45 0 0 1 95 50 Z"
                        fill="#D2691E"
                      />
                      {/* Sandwiches - 15% */}
                      <path
                        d="M 50 50 L 95 50 A 45 45 0 0 1 32.45 89.27 Z"
                        fill="#DEB887"
                      />
                      {/* Desserts - 10% */}
                      <path
                        d="M 50 50 L 32.45 89.27 A 45 45 0 0 1 5 50 Z"
                        fill="#D4AF37"
                      />
                      {/* Others - 5% */}
                      <path
                        d="M 50 50 L 5 50 A 45 45 0 0 1 50 5 Z"
                        fill="#C8A882"
                      />
                    </svg>
                  </div>
                  <div className="pie-legend">
                    {categoryData.map((cat) => (
                      <div key={cat.category} className="legend-item">
                        <span className="legend-color" style={{ backgroundColor: cat.color }} />
                        <span className="legend-label">{cat.category}:</span>
                        <span className="legend-value">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders and Quick Actions */}
            <div className="admin-bottom-grid">
              {/* Recent Orders */}
              <div className="section">
                <h2>Recent Orders</h2>
                <div className="orders-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="order-list-item">
                      <div className="order-list-left">
                        <div className="order-table">Table {order.tableNumber}</div>
                        <div className="order-time">{order.time}</div>
                      </div>
                      <div className="order-list-middle">
                        <div className="order-items">{order.items}</div>
                        <div className="order-amount">${order.amount.toFixed(2)}</div>
                      </div>
                      <div className="order-list-right">
                        <span className={`order-status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                  <div className="quick-action-card add-item">
                    <div className="qa-icon">+</div>
                    <p>Add Menu Item</p>
                  </div>
                  <div className="quick-action-card add-staff">
                    <div className="qa-icon">👤</div>
                    <p>Add Staff</p>
                  </div>
                  <div className="quick-action-card view-bookings">
                    <div className="qa-icon">📅</div>
                    <p>View Bookings</p>
                  </div>
                  <div className="quick-action-card settings">
                    <div className="qa-icon">⚙️</div>
                    <p>Settings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Management */}
            <div className="section">
              <h2>Inventory Management</h2>
              <div className="inventory-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className={`status-${item.status}`}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit}</td>
                        <td>
                          <span className={`badge-${item.status}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <button className="edit-btn">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item Preparation Tracking by Chef - ADMIN ONLY */}
            {user.role === 'admin' && (
            <div className="section">
              <div className="section-header-admin">
                <h2>🍳 Item Preparation Queue (One Item Per Chef)</h2>
                <span className="admin-only-badge">🔒 Admin Only</span>
              </div>
              <div className="item-prep-dashboard">
                <div className="chef-workload-container">
                  {staffMembers
                    .filter(staff => staff.role === 'CHEF')
                    .map(chef => {
                      const chefItems = orderItems.filter(
                        item => item.assignedChef === chef.id && item.status !== 'delivered'
                      );
                      const currentItem = chefItems.find(item => item.status === 'preparing');
                      const workload = chefItems.length;

                      return (
                        <div key={chef.id} className="chef-workload-card">
                          <div className="chef-header">
                            <h4>{chef.name}</h4>
                            <span className={`chef-status status-${chef.status}`}>
                              {chef.status}
                            </span>
                          </div>
                          
                          {currentItem && (
                            <div className="current-item">
                              <div className="item-badge">Currently Preparing</div>
                              <div className="item-name">{currentItem.itemName}</div>
                              <div className="item-details">
                                Order #{currentItem.orderId} • ~{currentItem.estimatedTime} min
                              </div>
                            </div>
                          )}

                          {workload === 0 && !currentItem && (
                            <div className="idle-status">
                              <span>✓ Available</span>
                            </div>
                          )}

                          {workload > 1 && (
                            <div className="queue-info">
                              <span className="badge">+{workload - 1} in queue</span>
                            </div>
                          )}

                          {currentItem && (
                            <div className="action-buttons">
                              <button
                                className="complete-btn"
                                onClick={() => {
                                  setOrderItems(prevItems =>
                                    prevItems.map(item =>
                                      item.id === currentItem.id
                                        ? { ...item, status: 'ready' }
                                        : item
                                    )
                                  );
                                }}
                              >
                                Mark Ready
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Pending Items Queue */}
                <div className="pending-items-section">
                  <h3>⏳ Pending Items Waiting for Chef</h3>
                  <div className="pending-items-list">
                    {orderItems.filter(item => item.status === 'pending').length > 0 ? (
                      orderItems
                        .filter(item => item.status === 'pending')
                        .map(item => (
                          <div key={item.id} className="pending-item-card">
                            <div className="pending-item-info">
                              <span className="item-name">{item.itemName}</span>
                              <span className="order-id">Order #{item.orderId}</span>
                              <span className="est-time">~{item.estimatedTime} min</span>
                            </div>
                            <div className="assign-chef-actions">
                              {getAvailableChefs().length > 0 ? (
                                <div className="chef-select-group">
                                  {getAvailableChefs().map(chef => (
                                    <button
                                      key={chef.id}
                                      className="assign-btn"
                                      onClick={() => assignItemToChef(item.id, chef.id)}
                                      title={`Assign to ${chef.name}`}
                                    >
                                      {chef.name}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="no-chefs">All chefs busy</span>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="empty-state">
                        <p>All items assigned! ✓</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </>
        )}

        {/* Staff Management Tab */}
        {activeTab === 'staff' && (
          <div className="section">
            <div className="section-header">
              <h2>Staff Members</h2>
              <button className="add-btn">+ Add Staff</button>
            </div>
            <div className="staff-table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id}>
                      <td>
                        <span className="staff-icon">👤</span>
                        {staff.name}
                      </td>
                      <td>
                        <span className={`role-badge role-${staff.role.toLowerCase()}`}>
                          {staff.role}
                        </span>
                      </td>
                      <td>{staff.email}</td>
                      <td>{staff.shift}</td>
                      <td>
                        <span className={`status-badge status-${staff.status}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-btn edit-btn" title="Edit">✏️</button>
                          <button className="action-btn delete-btn" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Items Tab */}
        {activeTab === 'menu' && (
          <div className="section">
            <div className="section-header">
              <h2>Menu Items</h2>
              <button className="add-btn">+ Add Menu Item</button>
            </div>
            <div className="menu-table-wrapper">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price ($)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.price.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-btn edit-btn" title="Edit">✏️</button>
                          <button className="action-btn delete-btn" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table Management Tab */}
        {activeTab === 'tables' && (
          <div className="section">
            <div className="section-header">
              <h2>Table Management</h2>
              <button className="add-btn">+ Add Table</button>
            </div>
            <div className="table-table-wrapper">
              <table className="table-table">
                <thead>
                  <tr>
                    <th>Table Number</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td>{table.number}</td>
                      <td>{table.capacity}</td>
                      <td>
                        <span className={`status-badge status-${table.status}`}>
                          {table.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-btn edit-btn" title="Edit">✏️</button>
                          <button className="action-btn delete-btn" title="Delete">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
