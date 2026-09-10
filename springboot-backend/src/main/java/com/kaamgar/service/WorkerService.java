package com.kaamgar.service;

import com.kaamgar.model.*;
import com.kaamgar.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WorkerService {

    @Autowired private UserRepository         userRepo;
    @Autowired private WorkerProfileRepository wpRepo;
    @Autowired private MongoTemplate          mongo;

    private static final List<Map<String, String>> SKILL_CHOICES = List.of(
        Map.of("value","plumber","label","Plumber"),      Map.of("value","electrician","label","Electrician"),
        Map.of("value","carpenter","label","Carpenter"),  Map.of("value","painter","label","Painter"),
        Map.of("value","driver","label","Driver"),        Map.of("value","cook","label","Cook"),
        Map.of("value","security","label","Security Guard"), Map.of("value","cleaner","label","Cleaner"),
        Map.of("value","mason","label","Mason"),          Map.of("value","welder","label","Welder"),
        Map.of("value","ac_technician","label","AC Technician"), Map.of("value","tailor","label","Tailor"),
        Map.of("value","other","label","Other")
    );

    public Map<String, Object> getWorkers(String skills, String search, String available,
                                           Double minRate, Double maxRate, Integer minExp, int page, int size) {
        Query uq = new Query().addCriteria(Criteria.where("role").is("worker").and("isActive").is(true));
        if (search != null && !search.isBlank())
            uq.addCriteria(new Criteria().orOperator(
                Criteria.where("firstName").regex(search,"i"), Criteria.where("lastName").regex(search,"i"),
                Criteria.where("username").regex(search,"i"), Criteria.where("city").regex(search,"i")));
        List<User> users = mongo.find(uq, User.class);
        List<String> userIds = users.stream().map(User::getId).toList();

        Query pq = new Query().addCriteria(Criteria.where("userId").in(userIds));
        if (skills != null && !skills.isBlank()) pq.addCriteria(Criteria.where("skills").is(skills));
        if ("1".equals(available)) pq.addCriteria(Criteria.where("availability").is(true));
        if (minRate != null) pq.addCriteria(Criteria.where("dailyRate").gte(minRate));
        if (maxRate != null) pq.addCriteria(Criteria.where("dailyRate").lte(maxRate));
        if (minExp  != null) pq.addCriteria(Criteria.where("experienceYears").gte(minExp));
        List<WorkerProfile> profiles = mongo.find(pq, WorkerProfile.class);
        Map<String, WorkerProfile> profileMap = new HashMap<>();
        profiles.forEach(p -> profileMap.put(p.getUserId(), p));

        boolean hasFilters = skills != null || available != null || minRate != null || maxRate != null || minExp != null;
        List<User> filtered = hasFilters
            ? users.stream().filter(u -> profileMap.containsKey(u.getId())).toList()
            : users;

        List<Map<String, Object>> workerList = filtered.stream()
            .map(u -> formatWorker(u, profileMap.get(u.getId()))).toList();
        int total = workerList.size();
        List<Map<String, Object>> paged = workerList.stream().skip((long)(page-1)*size).limit(size).toList();

        return Map.of("workers", paged, "total", total, "page", page,
            "totalPages", (int) Math.ceil((double) total / size), "skillChoices", SKILL_CHOICES);
    }

    public Map<String, Object> getWorkerById(String userId) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Worker not found."));
        if (!"worker".equals(user.getRole())) throw new RuntimeException("User is not a worker.");
        WorkerProfile wp = wpRepo.findByUserId(userId).orElseGet(() -> {
            WorkerProfile p = new WorkerProfile(); p.setUserId(userId); return wpRepo.save(p);
        });
        return Map.of("worker", formatWorker(user, wp), "workerDetails", buildDetails(wp));
    }

    public WorkerProfile updateProfile(String userId, WorkerProfile updates) {
        WorkerProfile wp = wpRepo.findByUserId(userId).orElseGet(() -> {
            WorkerProfile p = new WorkerProfile(); p.setUserId(userId); return p;
        });
        if (updates.getSkills() != null)      wp.setSkills(updates.getSkills());
        if (updates.getExtraSkills() != null) wp.setExtraSkills(updates.getExtraSkills());
        if (updates.getExperienceYears() > 0) wp.setExperienceYears(updates.getExperienceYears());
        if (updates.getDailyRate() > 0)       wp.setDailyRate(updates.getDailyRate());
        wp.setAvailability(updates.isAvailability());
        if (updates.getAddress() != null)     wp.setAddress(updates.getAddress());
        if (updates.getLanguages() != null)   wp.setLanguages(updates.getLanguages());
        if (updates.getPortfolioUrl() != null)wp.setPortfolioUrl(updates.getPortfolioUrl());
        return wpRepo.save(wp);
    }

    private Map<String, Object> formatWorker(User u, WorkerProfile wp) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", u.getId()); m.put("username", u.getUsername()); m.put("fullName", u.getFullName());
        m.put("firstName", nvl(u.getFirstName())); m.put("lastName", nvl(u.getLastName()));
        m.put("profilePhoto", nvl(u.getProfilePhoto())); m.put("city", nvl(u.getCity())); m.put("bio", nvl(u.getBio()));
        if (wp != null) m.put("workerProfile", Map.of(
            "_id", nvl(wp.getId()), "skills", wp.getSkills() != null ? wp.getSkills() : List.of(),
            "extraSkills", nvl(wp.getExtraSkills()), "experienceYears", wp.getExperienceYears(),
            "dailyRate", wp.getDailyRate(), "availability", wp.isAvailability(),
            "rating", wp.getRating(), "totalJobs", wp.getTotalJobs(),
            "aadharVerified", wp.isAadharVerified(), "languages", nvl(wp.getLanguages())));
        return m;
    }

    private List<Map<String, Object>> buildDetails(WorkerProfile wp) {
        return List.of(
            Map.of("icon","person-fill-gear","label","Skills",       "value", String.join(", ", wp.getSkills() != null ? wp.getSkills() : List.of())),
            Map.of("icon","calendar3",       "label","Experience",   "value", wp.getExperienceYears() + " years"),
            Map.of("icon","currency-rupee",  "label","Daily Rate",   "value", wp.getDailyRate() > 0 ? "₹" + (int)wp.getDailyRate() + "/day" : "Not set"),
            Map.of("icon","star-fill",       "label","Rating",       "value", wp.getRating() + "/5.0"),
            Map.of("icon","check2-circle",   "label","Jobs Done",    "value", String.valueOf(wp.getTotalJobs())),
            Map.of("icon","translate",       "label","Languages",    "value", nvl(wp.getLanguages())),
            Map.of("icon","patch-check",     "label","ID Verified",  "value", wp.isAadharVerified() ? "✓ Verified" : "Pending"),
            Map.of("icon","circle",          "label","Availability", "value", wp.isAvailability() ? "✅ Available" : "❌ Unavailable")
        );
    }

    private String nvl(String s) { return s != null ? s : ""; }
}
