package com.kaamgar.controller;

import com.kaamgar.model.User;
import com.kaamgar.model.WorkerProfile;
import com.kaamgar.service.WorkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    @Autowired private WorkerService workerService;

    @GetMapping
    public ResponseEntity<?> getWorkers(
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String available,
            @RequestParam(required = false) Double min_rate,
            @RequestParam(required = false) Double max_rate,
            @RequestParam(required = false) Integer min_exp,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(workerService.getWorkers(skills, search, available, min_rate, max_rate, min_exp, page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorker(@PathVariable String id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }
    @PutMapping("/profile")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<?> updateProfile(@RequestBody WorkerProfile updates, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("message","Profile updated.", "workerProfile", workerService.updateProfile(user.getId(), updates)));
    }
}
