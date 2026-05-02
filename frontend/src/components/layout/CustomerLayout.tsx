import { useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@layout/Navbar';
import MobileBottomNav from '@layout/MobileBottomNav';
import { useAuth } from '@context/AuthContext';
import { getSocket } from '@socket/socketClient';

const CustomerLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<any>(null);
  const lastPlayedRef = useRef(0);

  // 1. Browser Audio Unlock (Ensures sound plays on restrictive browsers)
  useEffect(() => {
    const unlock = () => {
      const a = new Audio("/sounds/notification.mp3");
      a.play().then(() => {
        a.pause();
        a.currentTime = 0;
      }).catch(() => {});
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // 2. Global Sound Engine (Hardened with 400ms Cooldown)
  const playSound = useCallback((type?: string) => {
    const now = Date.now();
    
    // Adjusted cooldown for rapid valid events
    if (now - lastPlayedRef.current < 400) return;
    lastPlayedRef.current = now;

    const duckTypes = ["cancelled", "rejected", "failed", "denied", "no_show"];
    const src = duckTypes.includes(type || "")
      ? "/sounds/duck.mp3"
      : "/sounds/notification.mp3";

    try {
      const audio = new Audio(src);
      audio.volume = 1;
      audio.play().catch(() => {});
    } catch (err) {
      console.warn("[Layout Audio] Playback blocked or failed:", err);
    }
  }, []);

  // 3. Initialize & Force Re-authentication (Zero-Loss Ordering)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') return;

    const socket = getSocket();

    // 4. PRE-ATTACH Listener (Crucial: Must exist BEFORE connection starts)
    const handleSignal = (payload?: { type?: string }) => {
      console.log("[WS Layout] Event Received:", payload);
      
      // Audible Alert
      playSound(payload?.type);

      // UI Sync Trigger (for NotificationPanel check)
      window.dispatchEvent(new CustomEvent('smartdine:notification', { 
        detail: { type: payload?.type, timestamp: Date.now() } 
      }));
    };

    // Global clear then attach BEFORE connect call
    socket.off('notification:new');
    socket.on('notification:new', handleSignal);

    // Now safe to trigger/re-trigger connection
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();

    socketRef.current = socket;

    return () => {
      socket.off('notification:new');
    };
  }, [isAuthenticated, user?.id, playSound]);

  // 5. Explicit Cleanup on Logout
  useEffect(() => {
    if (!isAuthenticated && socketRef.current) {
      socketRef.current.disconnect();
    }
  }, [isAuthenticated]);

  return (
    <div className="customer-layout">
      <Navbar />
      <main className="page-content" style={{ paddingBottom: '70px' }}>
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default CustomerLayout;
