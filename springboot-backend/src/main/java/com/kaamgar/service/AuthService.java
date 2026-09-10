package com.kaamgar.service;

import com.kaamgar.dto.*;
import com.kaamgar.model.User;
import com.kaamgar.model.WorkerProfile;
import com.kaamgar.repository.UserRepository;
import com.kaamgar.repository.WorkerProfileRepository;
import com.kaamgar.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
public class AuthService {

    @Autowired private UserRepository    userRepo;
    @Autowired private WorkerProfileRepository wpRepo;
    @Autowired private PasswordEncoder   encoder;
    @Autowired private JwtUtil           jwtUtil;
    @Autowired private EmailService      emailService;

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }

    public ApiResponse<RegisterResponse> register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered.");
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken.");

        String otp = generateOtp();
        User user  = new User();
        user.setUsername(req.getUsername().trim().toLowerCase());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole() != null ? req.getRole() : "worker");
        user.setOtp(otp);
        user.setOtpCreatedAt(Instant.now());
        user.setActive(false);
        user = userRepo.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);
        System.out.println("✅ Registered: " + user.getUsername() + " OTP=" + otp);

        return ApiResponse.ok("OTP sent to your email.", new RegisterResponse(user.getId(), user.getEmail()));
    }

    public ApiResponse<LoginResponse> verifyOtp(VerifyOtpRequest req) {
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.isOtpVerified())
            return ApiResponse.ok("Already verified.", buildLogin(user));

        if (!req.getOtp().equals(user.getOtp()))
            throw new RuntimeException("Invalid OTP.");

        if (Instant.now().isAfter(user.getOtpCreatedAt().plusSeconds(600)))
            throw new RuntimeException("OTP expired. Please request a new one.");

        user.setActive(true);
        user.setOtpVerified(true);
        user.setOtp("");
        userRepo.save(user);

        if ("worker".equals(user.getRole()) && wpRepo.findByUserId(user.getId()).isEmpty()) {
            WorkerProfile wp = new WorkerProfile();
            wp.setUserId(user.getId());
            wpRepo.save(wp);
        }

        return ApiResponse.ok("✅ Account verified! Welcome.", buildLogin(user));
    }

    public ApiResponse<RegisterResponse> resendOtp(ResendOtpRequest req) {
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (user.isActive()) throw new RuntimeException("Already verified.");
        if (user.getOtpCreatedAt() != null &&
            Instant.now().isBefore(user.getOtpCreatedAt().plusSeconds(60)))
            throw new RuntimeException("Wait 60 seconds before resending.");

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpCreatedAt(Instant.now());
        userRepo.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);
        return ApiResponse.ok("OTP resent.", new RegisterResponse(user.getId(), user.getEmail()));
    }

    public ApiResponse<LoginResponse> login(LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!encoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid email or password.");

        if (!user.isActive()) {
            String otp = generateOtp();
            user.setOtp(otp);
            user.setOtpCreatedAt(Instant.now());
            userRepo.save(user);
            emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);
            throw new RuntimeException("Account not verified. OTP sent. userId=" + user.getId());
        }

        return ApiResponse.ok("Login successful!", buildLogin(user));
    }

    public ApiResponse<RegisterResponse> forgotPassword(ForgotPasswordRequest req) {
        User user = userRepo.findByEmail(req.getEmail().trim().toLowerCase()).orElse(null);
        if (user == null) return ApiResponse.ok("If this email is registered, OTP has been sent.", null);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpCreatedAt(Instant.now());
        userRepo.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), otp);
        return ApiResponse.ok("OTP sent to your email.", new RegisterResponse(user.getId(), user.getEmail()));
    }

    public ApiResponse<LoginResponse> resetPassword(ResetPasswordRequest req) {
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (!req.getOtp().equals(user.getOtp()))
            throw new RuntimeException("Invalid or expired OTP.");
        if (Instant.now().isAfter(user.getOtpCreatedAt().plusSeconds(600)))
            throw new RuntimeException("OTP expired.");
        if (req.getNewPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters.");

        user.setPassword(encoder.encode(req.getNewPassword()));
        user.setOtp("");
        user.setActive(true);
        userRepo.save(user);
        return ApiResponse.ok("Password reset successfully!", buildLogin(user));
    }

    public ApiResponse<UserDto> getMe(User currentUser) {
        return ApiResponse.ok("ok", UserDto.from(currentUser));
    }

    private LoginResponse buildLogin(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return new LoginResponse(token, UserDto.from(user));
    }
}
