package com.spa_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.spa_management.config.AppProperties;
import com.spa_management.config.SupabaseProperties;

@SpringBootApplication
@EnableConfigurationProperties({AppProperties.class, SupabaseProperties.class})
public class SpaManagementApplication {

    public static void main(String[] args) {
        // Force JVM to prefer IPv4 to fix DNS resolution issues with Supabase database on certain networks
        System.setProperty("java.net.preferIPv4Stack", "true");
        SpringApplication.run(SpaManagementApplication.class, args);
    }
}
