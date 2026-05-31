package com.spa_management.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {

    private String url;
    private String anonKey;
    private String serviceRoleKey; // Dùng cho Admin operations như upload bypass RLS
    private Realtime realtime = new Realtime();
    private Storage storage = new Storage();

    @Getter
    @Setter
    public static class Realtime {
        private List<String> tables = List.of("appointments", "notifications");
    }

    @Getter
    @Setter
    public static class Storage {
        private String avatarBucket = "avatars";
    }

    /**
     * Kiểm tra xem Supabase Realtime đã được cấu hình đầy đủ chưa.
     */
    public boolean isRealtimeConfigured() {
        return url != null && !url.isBlank()
                && anonKey != null && !anonKey.isBlank()
                && realtime.getTables() != null && !realtime.getTables().isEmpty();
    }

    /**
     * Lấy Realtime WebSocket URL từ Supabase project URL.
     * Ví dụ: https://xxxxx.supabase.co → wss://xxxxx.supabase.co/realtime/v1/websocket
     */
    public String getRealtimeWsUrl() {
        if (url == null || url.isBlank()) return null;
        String wsUrl = url.replace("https://", "wss://").replace("http://", "ws://");
        return wsUrl + "/realtime/v1/websocket?apikey=" + anonKey + "&vsn=1.0.0";
    }
}
