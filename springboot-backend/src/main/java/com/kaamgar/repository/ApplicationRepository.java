package com.kaamgar.repository;

import com.kaamgar.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByWorkerIdOrderByCreatedAtDesc(String workerId);
    List<Application> findByJobIdOrderByCreatedAtDesc(String jobId);
    Optional<Application> findByJobIdAndWorkerId(String jobId, String workerId);
    boolean existsByJobIdAndWorkerId(String jobId, String workerId);
    List<Application> findByJobIdIn(List<String> jobIds);
}
