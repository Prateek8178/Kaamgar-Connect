package com.kaamgar.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
            "status",  "ok",
            "app",     "Kaamgar Connect (Spring Boot)",
            "version", "1.0.0",
            "time",    Instant.now().toString()
        );
    }
}
