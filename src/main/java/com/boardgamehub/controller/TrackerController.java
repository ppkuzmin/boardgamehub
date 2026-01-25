package com.boardgamehub.controller;

import com.boardgamehub.dto.SessionCreateRequest;
import com.boardgamehub.dto.SessionResponse;
import com.boardgamehub.service.TrackerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracker")
public class TrackerController {

    private final TrackerService trackerService;

    public TrackerController(TrackerService trackerService) {
        this.trackerService = trackerService;
    }

    @PostMapping("/sessions")
    public Map<String, String> create(@RequestBody SessionCreateRequest req, HttpSession session) {
        trackerService.createSession(req, session);
        return Map.of("message", "ok");
    }

    @GetMapping("/sessions")
    public List<SessionResponse> mySessions(HttpSession session) {
        return trackerService.getMySessions(session);
    }
}
