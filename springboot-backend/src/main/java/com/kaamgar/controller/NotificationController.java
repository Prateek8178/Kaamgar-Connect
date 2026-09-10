package com.kaamgar.controller;

import com.kaamgar.model.*;
import com.kaamgar.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired private NotificationRepository notifRepo;

    @GetMapping
    public ResponseEntity<?> getAll(@AuthenticationPrincipal User user) {
        var notifs = notifRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
        long unread = notifRepo.countByUserIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(Map.of("notifications", notifs, "unreadCount", unread));
    }
    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notifRepo.countByUserIdAndIsReadFalse(user.getId())));
    }
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable String id, @AuthenticationPrincipal User user) {
        return notifRepo.findById(id).map(n -> {
            if (!n.getUserId().equals(user.getId()))
                return ResponseEntity.status(403).<Object>body(Map.of("message","Forbidden"));
            n.setRead(true); notifRepo.save(n);
            return ResponseEntity.ok(Map.of("message","Marked as read."));
        }).orElse(ResponseEntity.notFound().build());
    }
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal User user) {
        notifRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
            .forEach(n -> { n.setRead(true); notifRepo.save(n); });
        return ResponseEntity.ok(Map.of("message","All marked as read."));
    }
}
