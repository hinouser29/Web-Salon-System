package com.spa_management.realtime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.spa_management.dto.RealtimeEventDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service nhận events từ SupabaseRealtimeClient và broadcast
 * qua Spring STOMP WebSocket tới các frontend subscribers.
 *
 * <p>Destinations:
 * <ul>
 *   <li>/topic/db/{table} — tất cả events của bảng</li>
 *   <li>/topic/db/{table}/{eventType} — lọc theo INSERT/UPDATE/DELETE</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RealtimeEventService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast một event tới tất cả STOMP subscribers.
     *
     * @param event DTO chứa thông tin thay đổi dữ liệu
     */
    public void broadcastEvent(RealtimeEventDTO event) {
        String table = event.getTable();
        String eventType = event.getEventType();

        // Gửi tới topic chung của bảng: /topic/db/appointments
        String tableTopic = "/topic/db/" + table;
        messagingTemplate.convertAndSend(tableTopic, event);

        // Gửi tới topic theo loại event: /topic/db/appointments/INSERT
        if (eventType != null && !eventType.isBlank()) {
            String eventTopic = tableTopic + "/" + eventType;
            messagingTemplate.convertAndSend(eventTopic, event);
        }

        log.debug("Broadcasted {} event for table '{}' to STOMP topics", eventType, table);
    }
}
