package com.boardgamehub.controller;

import com.boardgamehub.dto.AuthResponse;
import com.boardgamehub.dto.LoginRequest;
import com.boardgamehub.dto.RegisterRequest;
import com.boardgamehub.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req, HttpSession session) {
        return authService.register(req, session);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req, HttpSession session) {
        return authService.login(req, session);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpSession session) {
        authService.logout(session);
        return Map.of("message", "ok");
    }

    @GetMapping("/me")
    public AuthResponse me(HttpSession session) {
        AuthResponse me = authService.me(session);
        if (me == null) throw new RuntimeException("Not authenticated");
        return me;
    }
}
