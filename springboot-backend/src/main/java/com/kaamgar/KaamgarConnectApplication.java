package com.kaamgar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KaamgarConnectApplication {
    public static void main(String[] args) {
        SpringApplication.run(KaamgarConnectApplication.class, args);
        System.out.println("🚀 Kaamgar Connect API (Spring Boot) running on http://localhost:8080");
    }
}
