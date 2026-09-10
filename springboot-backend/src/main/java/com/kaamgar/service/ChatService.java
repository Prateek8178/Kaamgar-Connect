package com.kaamgar.service;

import com.kaamgar.model.*;
import com.kaamgar.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChatService {

    @Autowired private ChatRoomRepository roomRepo;
    @Autowired private MessageRepository  msgRepo;
    @Autowired private UserRepository     userRepo;

    public ChatRoom getOrCreateRoom(User currentUser, String otherUserId) {
        User other = userRepo.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (other.getId().equals(currentUser.getId()))
            throw new RuntimeException("Cannot chat with yourself.");

        String workerId, employerId;
        if ("worker".equals(currentUser.getRole()) && "employer".equals(other.getRole())) {
            workerId = currentUser.getId(); employerId = other.getId();
        } else if ("employer".equals(currentUser.getRole()) && "worker".equals(other.getRole())) {
            workerId = other.getId(); employerId = currentUser.getId();
        } else {
            throw new RuntimeException("Chat only allowed between worker and employer.");
        }
        final String w = workerId, e = employerId;
        return roomRepo.findByWorkerIdAndEmployerId(w, e)
                .orElseGet(() -> { ChatRoom r = new ChatRoom(); r.setWorkerId(w); r.setEmployerId(e); return roomRepo.save(r); });
    }

    public List<Map<String, Object>> getInbox(User user) {
        List<ChatRoom> rooms = "worker".equals(user.getRole())
                ? roomRepo.findByWorkerIdOrderByUpdatedAtDesc(user.getId())
                : roomRepo.findByEmployerIdOrderByUpdatedAtDesc(user.getId());
        return rooms.stream().map(room -> formatRoom(room, user)).toList();
    }

    public Map<String, Object> getRoom(String roomId, User user) {
        ChatRoom room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found."));
        assertAccess(room, user);

        List<Message> msgs = msgRepo.findByRoomIdOrderByCreatedAtAsc(roomId);
        msgs.stream()
            .filter(m -> !m.getSenderId().equals(user.getId()) && !Boolean.TRUE.equals(m.getIsRead()))
            .forEach(m -> { m.setIsRead(true); msgRepo.save(m); });

        String otherId = user.getId().equals(room.getWorkerId()) ? room.getEmployerId() : room.getWorkerId();
        User other = userRepo.findById(otherId).orElse(null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("room", Map.of("_id", room.getId(), "workerId", room.getWorkerId(), "employerId", room.getEmployerId()));
        result.put("otherUser", other != null ? Map.of(
            "_id", other.getId(), "username", other.getUsername(),
            "firstName", nvl(other.getFirstName()), "lastName", nvl(other.getLastName()),
            "fullName", other.getFullName(), "profilePhoto", nvl(other.getProfilePhoto()),
            "role", other.getRole(), "city", nvl(other.getCity())) : null);
        result.put("messages", msgs.stream().map(m -> formatMsg(m, user.getId())).toList());
        result.put("allRooms", getInbox(user));
        return result;
    }

    public Message sendMessage(String roomId, User sender, String text) {
        ChatRoom room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found."));
        assertAccess(room, sender);
        Message msg = new Message();
        msg.setRoomId(roomId);
        msg.setSenderId(sender.getId());
        msg.setText(text.trim());
        msg = msgRepo.save(msg);
        roomRepo.save(room); // touch updatedAt
        return msg;
    }

    public List<Map<String, Object>> pollMessages(String roomId, String afterId, User user) {
        ChatRoom room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found."));
        assertAccess(room, user);
        List<Message> msgs = (afterId != null && !afterId.isBlank())
                ? msgRepo.findByRoomIdAndIdGreaterThanOrderByCreatedAtAsc(roomId, afterId)
                : msgRepo.findByRoomIdOrderByCreatedAtAsc(roomId);
        msgs.stream()
            .filter(m -> !m.getSenderId().equals(user.getId()) && !Boolean.TRUE.equals(m.getIsRead()))
            .forEach(m -> { m.setIsRead(true); msgRepo.save(m); });
        return msgs.stream().map(m -> formatMsg(m, user.getId())).toList();
    }

    private void assertAccess(ChatRoom room, User user) {
        if (!user.getId().equals(room.getWorkerId()) && !user.getId().equals(room.getEmployerId()))
            throw new RuntimeException("Access denied.");
    }

    private Map<String, Object> formatRoom(ChatRoom room, User currentUser) {
        String otherId = currentUser.getId().equals(room.getWorkerId()) ? room.getEmployerId() : room.getWorkerId();
        User other = userRepo.findById(otherId).orElse(null);
        Message lastMsg = msgRepo.findTop1ByRoomIdOrderByCreatedAtDesc(room.getId()).stream().findFirst().orElse(null);
        long unread = msgRepo.countByRoomIdAndIsReadFalseAndSenderIdNot(room.getId(), currentUser.getId());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", room.getId()); m.put("unreadCount", unread);
        m.put("lastMessage", lastMsg != null ? Map.of("text", lastMsg.getText(), "time", lastMsg.getCreatedAt()) : null);
        m.put("otherUser", other != null ? Map.of("_id", other.getId(), "username", other.getUsername(),
            "fullName", other.getFullName(), "profilePhoto", nvl(other.getProfilePhoto()),
            "role", other.getRole(), "city", nvl(other.getCity())) : null);
        return m;
    }

    private Map<String, Object> formatMsg(Message m, String currentUserId) {
        User sender = userRepo.findById(m.getSenderId()).orElse(null);
        String initial = sender != null
            ? (sender.getFirstName() != null && !sender.getFirstName().isBlank()
               ? sender.getFirstName().substring(0,1).toUpperCase()
               : sender.getUsername().substring(0,1).toUpperCase()) : "?";
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("_id", m.getId()); out.put("text", m.getText());
        out.put("mine", m.getSenderId().equals(currentUserId));
        out.put("initial", initial); out.put("time", m.getCreatedAt());
        out.put("isRead", Boolean.TRUE.equals(m.getIsRead()));
        return out;
    }

    private String nvl(String s) { return s != null ? s : ""; }
}
