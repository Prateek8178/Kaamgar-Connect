package com.kaamgar.controller;

import com.kaamgar.model.User;
import com.kaamgar.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class ApplicationController {

    @Autowired
    private ApplicationService appService;

    @PostMapping("/api/applications/{jobId}")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> apply(@PathVariable String jobId,
                                   @RequestBody Map<String, Object> body,
                                   @AuthenticationPrincipal User user) {
        String coverNote    = (String) body.getOrDefault("coverNote", "");
        double proposedRate = body.containsKey("proposedRate")
            ? Double.parseDouble(body.get("proposedRate").toString()) : 0;
        var app = appService.apply(jobId, user, coverNote, proposedRate);
        return ResponseEntity.ok(Map.of("message", "Applied successfully!", "application", app));
    }

    @GetMapping("/api/applications")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> myApplications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("applications", appService.getMyApplications(user)));
    }

    @GetMapping("/api/jobs/{jobId}/applicants")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> getApplicants(@PathVariable String jobId, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("applicants", appService.getApplicants(jobId, user)));
    }

    @PatchMapping("/api/applications/{id}/status")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateStatus(@PathVariable String id,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("message", "Status updated.",
            "application", appService.updateStatus(id, body.get("status"), user)));
    }

    @DeleteMapping("/api/applications/{id}")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> withdraw(@PathVariable String id, @AuthenticationPrincipal User user) {
        appService.withdraw(id, user);
        return ResponseEntity.ok(Map.of("message", "Application withdrawn."));
    }
}
