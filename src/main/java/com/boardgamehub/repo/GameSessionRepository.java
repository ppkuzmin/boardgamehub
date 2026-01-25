package com.boardgamehub.repo;

import com.boardgamehub.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface GameSessionRepository extends JpaRepository<GameSession, Long> {
    List<GameSession> findByUserIdOrderByPlayedAtDescIdDesc(Long userId);
}
