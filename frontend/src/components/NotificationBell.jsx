import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    // 1. Connect to WebSocket
    const client = new Client({
      // We use SockJS to fallback in environments that don't support raw WebSockets well
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-endpoint'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        // console.log('[STOMP] ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket!');
      
      // 2. Subscribe to appointments INSERT topic
      client.subscribe('/topic/db/appointments/INSERT', (message) => {
        if (message.body) {
          const event = JSON.parse(message.body);
          
          setNotifications(prev => [
            {
              id: Date.now(),
              text: `Co khach hang vua dat lich hen moi!`,
              time: new Date().toLocaleTimeString(),
              record: event.record
            },
            ...prev
          ].slice(0, 10)); // Keep only last 10
          
          setUnread(prev => prev + 1);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [token]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnread(0);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={toggleDropdown}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          padding: 8,
          position: 'relative'
        }}
      >
        <Bell size={20} color="#555" />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'var(--pink)',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            borderRadius: '50%',
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unread}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: 320,
          background: '#fff',
          boxShadow: 'var(--shadow-hard)',
          borderRadius: 8,
          border: '1px solid var(--border)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa', fontWeight: 600 }}>
            Thong bao
          </div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
                Khong co thong bao moi.
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{n.text}</p>
                  <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{n.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
