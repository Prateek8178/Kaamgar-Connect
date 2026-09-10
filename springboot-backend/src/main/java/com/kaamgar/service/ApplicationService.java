package com.kaamgar.service;

import com.kaamgar.model.*;
import com.kaamgar.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ApplicationService {

    @Autowired private ApplicationRepository appRepo;
    @Autowired private JobRepository         jobRepo;
    @Autowired private UserRepository        userRepo;
    @Autowired private NotificationRepository notifRepo;
    @Autowired private EmailService          emailService;

    public Application apply(String jobId, User worker, String coverNote, double proposedRate) {
        if (!"worker".equals(worker.getRole()))
            throw new RuntimeException("Only workers can apply.");
        Job job = jobRepo.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found."));
        if (!job.isActive()) throw new RuntimeException("Job is no longer active.");
        if (appRepo.existsByJobIdAndWorkerId(jobId, worker.getId()))
            throw new RuntimeException("You have already applied to this job.");

        Application app = new Application();
        app.setJobId(jobId);
        app.setWorkerId(worker.getId());
        app.setCoverNote(coverNote != null ? coverNote.trim() : "");
        app.setProposedRate(proposedRate);
        app = appRepo.save(app);

        User employer = userRepo.findById(job.getEmployerId()).orElse(null);
        if (employer != null) {
            Notification n = new Notification();
            n.setUserId(employer.getId());
            n.setNtype("application");
            n.setTitle("New Application: " + job.getTitle());
            n.setBody(worker.getFullName() + " applied for your job.");
            n.setLink("/jobs/" + jobId + "/applicants");
            notifRepo.save(n);
            emailService.sendApplicationNotification(employer.getEmail(),
                    employer.getFullName(), job.getTitle(), worker.getFullName());
        }
        return app;
    }

    public List<Map<String, Object>> getMyApplications(User worker) {
        List<Application> apps = appRepo.findByWorkerIdOrderByCreatedAtDesc(worker.getId());
        return apps.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", a.getId()); m.put("status", a.getStatus());
            m.put("coverNote", a.getCoverNote()); m.put("proposedRate", a.getProposedRate());
            m.put("createdAt", a.getCreatedAt());
            Job job = jobRepo.findById(a.getJobId()).orElse(null);
            if (job != null) {
                User emp = userRepo.findById(job.getEmployerId()).orElse(null);
                m.put("job", Map.of("_id", job.getId(), "title", job.getTitle(),
                    "location", nvl(job.getLocation()), "category", nvl(job.getCategory()),
                    "salaryMin", job.getSalaryMin(), "salaryMax", job.getSalaryMax(),
                    "employer", emp != null ? Map.of("_id", emp.getId(), "username",
                        emp.getUsername(), "fullName", emp.getFullName()) : null));
            }
            return m;
        }).toList();
    }

    public List<Map<String, Object>> getApplicants(String jobId, User employer) {
        Job job = jobRepo.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found."));
        if (!job.getEmployerId().equals(employer.getId())) throw new RuntimeException("Access denied.");

        return appRepo.findByJobIdOrderByCreatedAtDesc(jobId).stream().map(a -> {
            User worker = userRepo.findById(a.getWorkerId()).orElse(null);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("_id", a.getId()); m.put("status", a.getStatus());
            m.put("coverNote", a.getCoverNote()); m.put("proposedRate", a.getProposedRate());
            m.put("createdAt", a.getCreatedAt());
            m.put("worker", worker != null ? Map.of("_id", worker.getId(), "username",
                worker.getUsername(), "fullName", worker.getFullName(),
                "profilePhoto", nvl(worker.getProfilePhoto()), "city", nvl(worker.getCity())) : null);
            return m;
        }).toList();
    }

    public Application updateStatus(String appId, String status, User employer) {
        Application app = appRepo.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found."));
        Job job = jobRepo.findById(app.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found."));
        if (!job.getEmployerId().equals(employer.getId())) throw new RuntimeException("Access denied.");

        app.setStatus(status);
        app = appRepo.save(app);

        Notification n = new Notification();
        n.setUserId(app.getWorkerId());
        n.setNtype("status");
        n.setTitle("Application " + status.substring(0,1).toUpperCase() + status.substring(1));
        n.setBody("Your application for \"" + job.getTitle() + "\" is now " + status + ".");
        n.setLink("/applications");
        notifRepo.save(n);
        return app;
    }

    public void withdraw(String appId, User worker) {
        Application app = appRepo.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application not found."));
        if (!app.getWorkerId().equals(worker.getId())) throw new RuntimeException("Access denied.");
        if (!"pending".equals(app.getStatus())) throw new RuntimeException("Cannot withdraw after review.");
        appRepo.delete(app);
    }

    private String nvl(String s) { return s != null ? s : ""; }
}
