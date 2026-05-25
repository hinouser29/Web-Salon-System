package com.spa_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.spa_management.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class SpaManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpaManagementApplication.class, args);
    }
}
