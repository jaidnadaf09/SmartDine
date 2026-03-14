import React, { useState, useEffect } from 'react';
import { Power, Pause, Play, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../../styles/RestaurantControl.css';

const API_URL = import.meta.env.VITE_API_URL;

interface RestaurantSettings {
    status: 'OPEN' | 'CLOSED' | 'PAUSED';
    pauseUntil: string | null;
}

const RestaurantStatusControl: React.FC = () => {
    const [settings, setSettings] = useState<RestaurantSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [pauseMinutes, setPauseMinutes] = useState(30);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/restaurant/status`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching restaurant status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (status: 'OPEN' | 'CLOSED' | 'PAUSED', mins?: number) => {
        setUpdating(true);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;
            
            const res = await fetch(`${API_URL}/admin/restaurant-status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, pauseMinutes: mins })
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(data.settings);
                toast.success(`Restaurant is now ${status}`);
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return null;

    const getStatusColor = () => {
        if (settings?.status === 'OPEN') return '#10b981';
        if (settings?.status === 'CLOSED') return '#ef4444';
        return '#f59e0b';
    };

    return (
        <div className="restaurant-control-card">
            <div className="control-header">
                <h3>Restaurant Availability</h3>
                <div className="current-status-badge" style={{ backgroundColor: `${getStatusColor()}20`, color: getStatusColor() }}>
                    <span className="pulse-dot" style={{ backgroundColor: getStatusColor() }}></span>
                    {settings?.status}
                </div>
            </div>

            <p className="control-desc">
                Control the operational state of your restaurant. This affects both orders and bookings.
            </p>

            {settings?.status === 'PAUSED' && settings.pauseUntil && (
                <div className="pause-timer">
                    <Clock size={16} />
                    <span>Orders resumed automatically at <strong>{new Date(settings.pauseUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
            )}

            <div className="control-actions">
                {settings?.status !== 'OPEN' && (
                    <button 
                        className="control-btn open-btn" 
                        onClick={() => updateStatus('OPEN')}
                        disabled={updating}
                    >
                        <Play size={18} /> Open Restaurant
                    </button>
                )}

                {settings?.status === 'OPEN' && (
                    <>
                        <div className="pause-section">
                            <div className="pause-options">
                                <select 
                                    value={pauseMinutes} 
                                    onChange={(e) => setPauseMinutes(Number(e.target.value))}
                                    className="pause-select"
                                >
                                    <option value={15}>15 Mins</option>
                                    <option value={30}>30 Mins</option>
                                    <option value={60}>60 Mins</option>
                                    <option value={120}>2 Hours</option>
                                </select>
                                <button 
                                    className="control-btn pause-btn" 
                                    onClick={() => updateStatus('PAUSED', pauseMinutes)}
                                    disabled={updating}
                                >
                                    <Pause size={18} /> Pause Orders
                                </button>
                            </div>
                        </div>

                        <button 
                            className="control-btn close-btn" 
                            onClick={() => {
                                if (window.confirm('Are you sure you want to CLOSE the restaurant? This will block all new orders and bookings.')) {
                                    updateStatus('CLOSED');
                                }
                            }}
                            disabled={updating}
                        >
                            <Power size={18} /> Close Restaurant
                        </button>
                    </>
                )}

                {settings?.status === 'CLOSED' && (
                    <div className="status-warning">
                        <AlertTriangle size={16} />
                        <span>Bookings and orders are currently disabled.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantStatusControl;
