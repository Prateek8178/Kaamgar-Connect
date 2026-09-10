package com.kaamgar.repository;

import com.kaamgar.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {
    Page<Job> findByIsActiveTrueOrderByIsFeaturedDescCreatedAtDesc(Pageable pageable);
    Page<Job> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category, Pageable pageable);
    List<Job> findByEmployerIdOrderByCreatedAtDesc(String employerId);
    long countByIsActiveTrue();
}
