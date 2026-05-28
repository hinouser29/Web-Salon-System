import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom React hook để subscribe vào Supabase Realtime events qua STOMP WebSocket.
 *
 * @param {string} table - Tên bảng cần lắng nghe (e.g., "appointments", "notifications")
 * @param {string|null} eventType - Loại event: "INSERT", "UPDATE", "DELETE", hoặc null cho tất cả
 * @param {function} onEvent - Callback khi nhận event: (event) => void
 * @param {boolean} enabled - Bật/tắt subscription (mặc định: true)
 *
 * @example
 * // Lắng nghe tất cả thay đổi trên bảng appointments
 * useRealtimeSubscription('appointments', null, (event) => {
 *   console.log('Change:', event.eventType, event.newRecord);
 *   // Cập nhật state...
 * });
 *
 * @example
 * // Chỉ lắng nghe INSERT mới trên notifications
 * useRealtimeSubscription('notifications', 'INSERT', (event) => {
 *   toast.info(`Thông báo mới: ${event.newRecord.title}`);
 * });
 */
export function useRealtimeSubscription(table, eventType = null, onEvent, enabled = true) {
  const clientRef = useRef(null);
  const callbackRef = useRef(onEvent);

  // Luôn cập nhật callback ref để tránh stale closure
  useEffect(() => {
    callbackRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !table) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP]', msg);
        }
      },
    });

    client.onConnect = () => {
      console.log(`[Realtime] Connected. Subscribing to ${table}...`);

      // Xây destination topic
      const topic = eventType
        ? `/topic/db/${table}/${eventType}`
        : `/topic/db/${table}`;

      client.subscribe(topic, (message) => {
        try {
          const event = JSON.parse(message.body);
          callbackRef.current?.(event);
        } catch (err) {
          console.error('[Realtime] Failed to parse message:', err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('[Realtime] STOMP error:', frame.headers?.message);
    };

    client.onDisconnect = () => {
      console.log('[Realtime] Disconnected');
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        console.log(`[Realtime] Unsubscribed from ${table}`);
      }
    };
  }, [table, eventType, enabled]);

  // Expose method để manual disconnect nếu cần
  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
    }
  }, []);

  return { disconnect };
}
