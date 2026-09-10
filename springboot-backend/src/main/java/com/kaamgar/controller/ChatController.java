package com.kaamgar.controller;

import com.kaamgar.model.User;
import com.kaamgar.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired private ChatService chatService;

    @PostMapping("/start/{userId}")
    public ResponseEntity<?> startChat(@PathVariable String userId, @AuthenticationPrincipal User user) {
        var room = chatService.getOrCreateRoom(user, userId);
        return ResponseEntity.ok(Map.of("roomId", room.getId()));
    }
    @GetMapping("/inbox")
    public ResponseEntity<?> inbox(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("rooms", chatService.getInbox(user)));
    }
    @GetMapping("/room/{id}")
    public ResponseEntity<?> getRoom(@PathVariable String id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getRoom(id, user));
    }
    @PostMapping("/room/{id}/send")
    public ResponseEntity<?> send(@PathVariable String id, @RequestBody Map<String, String> body,
                                   @AuthenticationPrincipal User user) {
        String text = body.get("text");
        if (text == null || text.isBlank()) return ResponseEntity.badRequest().body(Map.of("message","Text required."));
        var msg = chatService.sendMessage(id, user, text);
        return ResponseEntity.ok(Map.of("status","ok","_id", msg.getId(), "text", msg.getText()));
    }
    @GetMapping("/poll/{id}")
    public ResponseEntity<?> poll(@PathVariable String id, @RequestParam(required = false) String after,
                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("messages", chatService.pollMessages(id, after, user)));
    }
}
