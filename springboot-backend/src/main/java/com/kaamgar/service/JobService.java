package com.kaamgar.service;

import com.kaamgar.model.Job;
import com.kaamgar.model.User;
import com.kaamgar.repository.JobRepository;
import com.kaamgar.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobService {

    @Autowired private JobRepository     jobRepo;
    @Autowired private ApplicationRepository appRepo;
    @Autowired private MongoTemplate     mongo;

    private static final Map<String, String> CATEGORY_LABELS = Map.ofEntries(
        Map.entry("construction","Construction"), Map.entry("electrical","Electrical"),
        Map.entry("plumbing","Plumbing"),         Map.entry("carpentry","Carpentry"),
        Map.entry("painting","Painting"),         Map.entry("driving","Driving"),
        Map.entry("cooking","Cooking"),           Map.entry("cleaning","Cleaning"),
        Map.entry("security","Security"),         Map.entry("welding","Welding"),
        Map.entry("ac_tech","AC Technician"),     Map.entry("tailoring","Tailoring"),
        Map.entry("other","Other")
    );
    private static final Map<String, String> CATEGORY_ICONS = Map.ofEntries(
        Map.entry("construction","🏗️"), Map.entry("electrical","⚡"),
        Map.entry("plumbing","🔧"),      Map.entry("carpentry","🪚"),
        Map.entry("painting","🎨"),      Map.entry("driving","🚗"),
        Map.entry("cooking","👨‍🍳"),      Map.entry("cleaning","🧹"),
        Map.entry("security","🛡️"),      Map.entry("welding","⚒️"),
        Map.entry("ac_tech","❄️"),       Map.entry("tailoring","🧵"),
        Map.entry("other","💼")
    );

    public Map<String, Object> getJobs(String category, String location, String jobType,
                                        String search, int page, int size) {
        Query q = new Query();
        q.addCriteria(Criteria.where("isActive").is(true));
        if (category != null && !category.isBlank()) q.addCriteria(Criteria.where("category").is(category));
        if (location != null && !location.isBlank())
            q.addCriteria(Criteria.where("location").regex(location, "i"));
        if (jobType != null && !jobType.isBlank()) q.addCriteria(Criteria.where("jobType").is(jobType));
        if (search != null && !search.isBlank())
            q.addCriteria(new Criteria().orOperator(
                Criteria.where("title").regex(search,"i"),
                Criteria.where("description").regex(search,"i"),
                Criteria.where("skillsRequired").regex(search,"i")
            ));

        long total = mongo.count(q, Job.class);
        q.with(Sort.by(Sort.Direction.DESC, "isFeatured", "createdAt"));
        q.skip((long)(page - 1) * size).limit(size);
        List<Job> jobs = mongo.find(q, Job.class);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("jobs", jobs.stream().map(this::toMap).toList());
        result.put("total", total);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("hasNext", (long)(page - 1) * size + jobs.size() < total);
        result.put("categories", CATEGORY_LABELS.entrySet().stream()
            .map(e -> Map.of("value", e.getKey(), "label", e.getValue(), "icon", CATEGORY_ICONS.getOrDefault(e.getKey(),"💼")))
            .toList());
        return result;
    }

    public Map<String, Object> getJobById(String id) {
        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found."));
        job.setViews(job.getViews() + 1);
        jobRepo.save(job);
        Map<String, Object> m = toMap(job);
        m.put("description", job.getDescription());
        m.put("applicantCount", appRepo.findByJobIdOrderByCreatedAtDesc(id).size());
        return m;
    }

    public Job createJob(Job job, User employer) {
        job.setEmployerId(employer.getId());
        job.setActive(true);
        job.setViews(0);
        return jobRepo.save(job);
    }

    public Job updateJob(String id, Job updates, User employer) {
        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found."));
        if (!job.getEmployerId().equals(employer.getId()))
            throw new RuntimeException("Access denied.");
        updates.setId(id);
        updates.setEmployerId(employer.getId());
        return jobRepo.save(updates);
    }

    public void deleteJob(String id, User employer) {
        Job job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found."));
        if (!job.getEmployerId().equals(employer.getId()))
            throw new RuntimeException("Access denied.");
        job.setActive(false);
        jobRepo.save(job);
    }

    public List<Job> getMyJobs(User employer) {
        return jobRepo.findByEmployerIdOrderByCreatedAtDesc(employer.getId());
    }

    private Map<String, Object> toMap(Job j) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id",          j.getId());
        m.put("title",        j.getTitle());
        m.put("location",     j.getLocation());
        m.put("category",     j.getCategory());
        m.put("categoryLabel",CATEGORY_LABELS.getOrDefault(j.getCategory(), j.getCategory()));
        m.put("categoryIcon", CATEGORY_ICONS.getOrDefault(j.getCategory(), "💼"));
        m.put("jobType",      j.getJobType());
        m.put("salaryMin",    j.getSalaryMin());
        m.put("salaryMax",    j.getSalaryMax());
        m.put("openings",     j.getOpenings());
        m.put("isFeatured",   j.isFeatured());
        m.put("isActive",     j.isActive());
        m.put("views",        j.getViews());
        m.put("employerId",   j.getEmployerId());
        m.put("createdAt",    j.getCreatedAt());
        return m;
    }
}
