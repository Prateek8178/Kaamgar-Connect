package com.kaamgar.controller;

import com.kaamgar.model.*;
import com.kaamgar.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired private JobService jobService;

    @GetMapping
    public ResponseEntity<?> listJobs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String job_type,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(jobService.getJobs(category, location, job_type, search, page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> createJob(@RequestBody Job job, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("message","Job posted!", "job", jobService.createJob(job, user)));
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> updateJob(@PathVariable String id, @RequestBody Job job, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("message","Updated.", "job", jobService.updateJob(id, job, user)));
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> deleteJob(@PathVariable String id, @AuthenticationPrincipal User user) {
        jobService.deleteJob(id, user); return ResponseEntity.ok(Map.of("message","Deactivated."));
    }
    @GetMapping("/my-jobs")
    @PreAuthorize("hasRole('EMPLOYER')")
    public ResponseEntity<?> myJobs(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("jobs", jobService.getMyJobs(user)));
    }
}
