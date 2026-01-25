package com.boardgamehub.service;

import com.boardgamehub.dto.ReviewRequest;
import com.boardgamehub.dto.ReviewResponse;
import com.boardgamehub.entity.Game;
import com.boardgamehub.entity.Review;
import com.boardgamehub.entity.User;
import com.boardgamehub.repo.ReviewRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final GameService gameService;
    private final AuthService authService;

    public ReviewService(ReviewRepository reviewRepository, GameService gameService, AuthService authService) {
        this.reviewRepository = reviewRepository;
        this.gameService = gameService;
        this.authService = authService;
    }

    public List<ReviewResponse> getReviewsForGame(Long gameId) {
        return reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId)
                .stream()
                .map(r -> new ReviewResponse(
                        r.getRating(),
                        r.getText(),
                        r.getUser().getEmail(),
                        r.getCreatedAt()
                ))
                .toList();
    }

    public void addReview(ReviewRequest req, HttpSession session) {
        if (req.rating() < 1 || req.rating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        if (req.text() == null || req.text().trim().isBlank()) {
            throw new RuntimeException("Text is required");
        }

        User user = authService.requireUser(session);
        Game game = gameService.getById(req.gameId());

        Review r = new Review();
        r.setUser(user);
        r.setGame(game);
        r.setRating(req.rating());
        r.setText(req.text().trim());

        reviewRepository.save(r);
    }
}
