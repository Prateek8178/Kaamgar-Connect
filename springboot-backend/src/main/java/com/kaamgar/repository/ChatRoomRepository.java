package com.kaamgar.repository;

import com.kaamgar.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByWorkerIdOrderByUpdatedAtDesc(String workerId);
    List<ChatRoom> findByEmployerIdOrderByUpdatedAtDesc(String employerId);
    Optional<ChatRoom> findByWorkerIdAndEmployerId(String workerId, String employerId);
}
