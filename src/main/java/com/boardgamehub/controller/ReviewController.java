package com.boardgamehub.controller;

import com.boardgamehub.dto.ReviewRequest;
import com.boardgamehub.dto.ReviewResponse;
import com.boardgamehub.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/api/games/{gameId}/reviews")
    public List<ReviewResponse> getByGame(@PathVariable Long gameId) {
        return reviewService.getReviewsForGame(gameId);
    }

    @PostMapping("/api/reviews")
    public Map<String, String> add(@RequestBody ReviewRequest req, HttpSession session) {
        reviewService.addReview(req, session);
        return Map.of("message", "ok");
    }
}
