package com.kaamgar.repository;

import com.kaamgar.model.WorkerProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WorkerProfileRepository extends MongoRepository<WorkerProfile, String> {
    Optional<WorkerProfile> findByUserId(String userId);
}
