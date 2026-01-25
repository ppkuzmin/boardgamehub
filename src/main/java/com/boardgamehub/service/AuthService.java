package com.boardgamehub.service;

import com.boardgamehub.dto.AuthResponse;
import com.boardgamehub.dto.LoginRequest;
import com.boardgamehub.dto.RegisterRequest;
import com.boardgamehub.entity.User;
import com.boardgamehub.repo.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    public static final String SESSION_USER_ID = "USER_ID";

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest req, HttpSession session) {
        String email = normalizeEmail(req.email());
        if (email.isBlank() || req.password() == null || req.password().length() < 4) {
            throw new RuntimeException("Invalid email or password");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));

        User saved = userRepository.save(u);
        session.setAttribute(SESSION_USER_ID, saved.getId());

        return new AuthResponse(saved.getId(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest req, HttpSession session) {
        String email = normalizeEmail(req.email());
        User u = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        session.setAttribute(SESSION_USER_ID, u.getId());
        return new AuthResponse(u.getId(), u.getEmail());
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public AuthResponse me(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_USER_ID);
        if (userId == null) return null;

        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Session user not found"));

        return new AuthResponse(u.getId(), u.getEmail());
    }

    public User requireUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_USER_ID);
        if (userId == null) throw new RuntimeException("Not authenticated");

        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
