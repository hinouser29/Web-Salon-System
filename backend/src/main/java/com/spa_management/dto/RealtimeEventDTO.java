package com.spa_management.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO đại diện cho một sự kiện thay đổi dữ liệu realtime từ Supabase.
 * Được gửi qua STOMP WebSocket tới frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeEventDTO {

    /** Tên bảng bị thay đổi (e.g., "appointments", "notifications") */
    private String table;

    /** Loại thao tác: INSERT, UPDATE, DELETE */
    private String eventType;

    /** Schema (thường là "public") */
    private String schema;

    /** Bản ghi mới (sau INSERT hoặc UPDATE) — null khi DELETE */
    private Object newRecord;

    /** Bản ghi cũ (trước UPDATE hoặc DELETE) — null khi INSERT */
    private Object oldRecord;

    /** Thời điểm nhận event */
    @Builder.Default
    private Instant timestamp = Instant.now();
}
