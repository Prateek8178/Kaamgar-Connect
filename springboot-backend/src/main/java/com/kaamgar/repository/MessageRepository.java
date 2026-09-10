package com.kaamgar.repository;

import com.kaamgar.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByRoomIdOrderByCreatedAtAsc(String roomId);
    List<Message> findByRoomIdAndIdGreaterThanOrderByCreatedAtAsc(String roomId, String afterId);
    long countByRoomIdAndIsReadFalseAndSenderIdNot(String roomId, String senderId);
    List<Message> findTop1ByRoomIdOrderByCreatedAtDesc(String roomId);
}
