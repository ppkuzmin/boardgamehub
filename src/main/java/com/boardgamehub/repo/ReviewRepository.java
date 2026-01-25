package com.boardgamehub.repo;

import com.boardgamehub.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);
}
