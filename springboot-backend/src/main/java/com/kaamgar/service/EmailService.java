package com.kaamgar.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendOtpEmail(String toEmail, String username, String otp) {
        String html = "<div style='font-family:sans-serif;max-width:500px'>"
            + "<h2 style='color:#6C63FF'>Kaamgar Connect</h2>"
            + "<p>Hi <strong>" + username + "</strong>,</p>"
            + "<p>Your OTP is:</p>"
            + "<div style='font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#6C63FF;padding:20px 0'>" + otp + "</div>"
            + "<p style='color:#888'>Expires in <strong>10 minutes</strong>.</p></div>";
        sendHtml(toEmail, "[Kaamgar Connect] OTP: " + otp, html);
    }

    public void sendPasswordResetEmail(String toEmail, String username, String otp) {
        String html = "<div style='font-family:sans-serif;max-width:500px'>"
            + "<h2 style='color:#E74C3C'>Password Reset</h2>"
            + "<p>Hi <strong>" + username + "</strong>,</p>"
            + "<p>Your reset OTP is:</p>"
            + "<div style='font-size:2.5rem;font-weight:900;letter-spacing:12px;color:#E74C3C;padding:20px 0'>" + otp + "</div>"
            + "<p style='color:#888'>Expires in <strong>10 minutes</strong>.</p></div>";
        sendHtml(toEmail, "[Kaamgar Connect] Password Reset OTP", html);
    }

    public void sendApplicationNotification(String toEmail, String employerName, String jobTitle, String workerName) {
        String html = "<div style='font-family:sans-serif;max-width:500px'>"
            + "<h2 style='color:#6C63FF'>New Application!</h2>"
            + "<p>Hi <strong>" + employerName + "</strong>,</p>"
            + "<p><strong>" + workerName + "</strong> applied for: <strong>" + jobTitle + "</strong></p>"
            + "<p>Login to review the application.</p></div>";
        sendHtml(toEmail, "[Kaamgar Connect] New Application for " + jobTitle, html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom("Kaamgar Connect <" + from + ">");
            h.setTo(to); h.setSubject(subject); h.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            System.err.println("❌ Email failed to " + to + ": " + e.getMessage());
        }
    }
}
