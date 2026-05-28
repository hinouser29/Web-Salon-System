package com.spa_management.realtime;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spa_management.config.SupabaseProperties;
import com.spa_management.dto.RealtimeEventDTO;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Java WebSocket client kết nối tới Supabase Realtime API.
 *
 * <p>Lifecycle:
 * <ol>
 *   <li>Khi app khởi động → kiểm tra config, nếu đủ thì connect</li>
 *   <li>Sau khi connect → gửi phx_join cho mỗi bảng cần lắng nghe</li>
 *   <li>Mỗi 30s → gửi heartbeat (phx_heartbeat)</li>
 *   <li>Khi nhận INSERT/UPDATE/DELETE → parse và delegate cho RealtimeEventService</li>
 *   <li>Khi mất kết nối → auto-reconnect với exponential backoff</li>
 * </ol>
 *
 * <p>Supabase Realtime Protocol (Phoenix Channels v1):
 * <pre>
 * {
 *   "topic": "realtime:public:appointments",
 *   "event": "phx_join",
 *   "payload": { "config": { "postgres_changes": [...] } },
 *   "ref": "1"
 * }
 * </pre>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseRealtimeClient {

    private final SupabaseProperties supabaseProperties;
    private final RealtimeEventService realtimeEventService;
    private final ObjectMapper objectMapper;

    private WebSocketClient wsClient;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> heartbeatFuture;
    private final AtomicInteger refCounter = new AtomicInteger(0);
    private final AtomicInteger reconnectAttempts = new AtomicInteger(0);

    private static final int HEARTBEAT_INTERVAL_SECONDS = 30;
    private static final int MAX_RECONNECT_ATTEMPTS = 10;
    private static final long INITIAL_RECONNECT_DELAY_MS = 1000;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (!supabaseProperties.isRealtimeConfigured()) {
            log.info("Supabase Realtime chưa được cấu hình (SUPABASE_URL / SUPABASE_ANON_KEY trống). "
                    + "Bỏ qua kết nối Realtime. Hệ thống vẫn hoạt động bình thường.");
            return;
        }
        connect();
    }

    /**
     * Kết nối tới Supabase Realtime WebSocket.
     */
    public void connect() {
        try {
            String wsUrl = supabaseProperties.getRealtimeWsUrl();
            log.info("Đang kết nối Supabase Realtime: {}", maskUrl(wsUrl));

            wsClient = new WebSocketClient(new URI(wsUrl)) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    log.info("✅ Kết nối Supabase Realtime thành công!");
                    reconnectAttempts.set(0);
                    subscribeToTables(supabaseProperties.getRealtime().getTables());
                    startHeartbeat();
                }

                @Override
                public void onMessage(String message) {
                    handleMessage(message);
                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    log.warn("❌ Supabase Realtime đã ngắt kết nối: code={}, reason='{}', remote={}",
                            code, reason, remote);
                    stopHeartbeat();
                    scheduleReconnect();
                }

                @Override
                public void onError(Exception ex) {
                    log.error("Lỗi Supabase Realtime WebSocket: {}", ex.getMessage());
                }
            };

            wsClient.connect();
        } catch (Exception ex) {
            log.error("Không thể tạo kết nối Supabase Realtime: {}", ex.getMessage(), ex);
            scheduleReconnect();
        }
    }

    /**
     * Gửi phx_join cho mỗi bảng cần lắng nghe.
     */
    private void subscribeToTables(List<String> tables) {
        for (String table : tables) {
            String topic = "realtime:public:" + table.trim();
            int ref = refCounter.incrementAndGet();

            String joinPayload = String.format("""
                    {
                      "topic": "%s",
                      "event": "phx_join",
                      "payload": {
                        "config": {
                          "postgres_changes": [
                            {
                              "event": "*",
                              "schema": "public",
                              "table": "%s"
                            }
                          ]
                        }
                      },
                      "ref": "%d"
                    }
                    """, topic, table.trim(), ref);

            wsClient.send(joinPayload);
            log.info("📡 Subscribed to realtime changes on table: {}", table.trim());
        }
    }

    /**
     * Xử lý messages từ Supabase Realtime.
     */
    private void handleMessage(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            String event = json.path("event").asText("");

            // Bỏ qua heartbeat replies và join replies
            if ("phx_reply".equals(event) || "phx_heartbeat".equals(event)) {
                return;
            }

            // Chỉ xử lý postgres_changes events
            if ("postgres_changes".equals(event)) {
                JsonNode payload = json.path("payload");
                JsonNode data = payload.path("data");

                String eventType = data.path("type").asText(""); // INSERT, UPDATE, DELETE
                String table = data.path("table").asText("");
                String schema = data.path("schema").asText("public");
                JsonNode newRecord = data.path("record");
                JsonNode oldRecord = data.path("old_record");

                if (!eventType.isBlank() && !table.isBlank()) {
                    RealtimeEventDTO dto = RealtimeEventDTO.builder()
                            .table(table)
                            .eventType(eventType)
                            .schema(schema)
                            .newRecord(newRecord.isMissingNode() ? null : newRecord)
                            .oldRecord(oldRecord.isMissingNode() ? null : oldRecord)
                            .timestamp(Instant.now())
                            .build();

                    realtimeEventService.broadcastEvent(dto);
                    log.debug("Processed realtime event: {} on {}.{}", eventType, schema, table);
                }
            }
        } catch (Exception ex) {
            log.warn("Lỗi xử lý message Supabase Realtime: {}", ex.getMessage());
        }
    }

    /**
     * Gửi heartbeat mỗi 30s để giữ kết nối.
     */
    private void startHeartbeat() {
        stopHeartbeat();
        heartbeatFuture = scheduler.scheduleAtFixedRate(() -> {
            try {
                if (wsClient != null && wsClient.isOpen()) {
                    int ref = refCounter.incrementAndGet();
                    String heartbeat = String.format("""
                            {
                              "topic": "phoenix",
                              "event": "heartbeat",
                              "payload": {},
                              "ref": "%d"
                            }
                            """, ref);
                    wsClient.send(heartbeat);
                }
            } catch (Exception ex) {
                log.warn("Lỗi gửi heartbeat: {}", ex.getMessage());
            }
        }, HEARTBEAT_INTERVAL_SECONDS, HEARTBEAT_INTERVAL_SECONDS, TimeUnit.SECONDS);
    }

    private void stopHeartbeat() {
        if (heartbeatFuture != null) {
            heartbeatFuture.cancel(false);
            heartbeatFuture = null;
        }
    }

    /**
     * Auto-reconnect với exponential backoff.
     */
    private void scheduleReconnect() {
        int attempt = reconnectAttempts.incrementAndGet();
        if (attempt > MAX_RECONNECT_ATTEMPTS) {
            log.error("Đã vượt quá {} lần reconnect. Dừng Supabase Realtime.", MAX_RECONNECT_ATTEMPTS);
            return;
        }

        long delay = Math.min(INITIAL_RECONNECT_DELAY_MS * (1L << (attempt - 1)), 60_000);
        log.info("Sẽ reconnect Supabase Realtime sau {}ms (lần thử {}/{})", delay, attempt, MAX_RECONNECT_ATTEMPTS);

        scheduler.schedule(this::connect, delay, TimeUnit.MILLISECONDS);
    }

    /**
     * Ẩn API key trong URL khi log.
     */
    private String maskUrl(String url) {
        if (url == null) return "null";
        int idx = url.indexOf("apikey=");
        if (idx == -1) return url;
        return url.substring(0, idx + 7) + "***";
    }

    @PreDestroy
    public void shutdown() {
        log.info("Đang đóng kết nối Supabase Realtime...");
        stopHeartbeat();
        scheduler.shutdownNow();
        if (wsClient != null) {
            try {
                wsClient.closeBlocking();
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
