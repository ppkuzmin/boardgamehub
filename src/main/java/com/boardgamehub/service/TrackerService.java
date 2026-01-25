package com.boardgamehub.service;

import com.boardgamehub.dto.PlayerDto;
import com.boardgamehub.dto.SessionCreateRequest;
import com.boardgamehub.dto.SessionResponse;
import com.boardgamehub.entity.Game;
import com.boardgamehub.entity.GameSession;
import com.boardgamehub.entity.GameSessionPlayer;
import com.boardgamehub.entity.User;
import com.boardgamehub.repo.GameSessionRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TrackerService {

    private final GameSessionRepository sessionRepository;
    private final GameService gameService;
    private final AuthService authService;

    public TrackerService(GameSessionRepository sessionRepository, GameService gameService, AuthService authService) {
        this.sessionRepository = sessionRepository;
        this.gameService = gameService;
        this.authService = authService;
    }

    public void createSession(SessionCreateRequest req, HttpSession session) {
        if (req.gameId() == null) throw new RuntimeException("gameId is required");
        if (req.players() == null || req.players().isEmpty()) throw new RuntimeException("players are required");

        // basic validation
        for (PlayerDto p : req.players()) {
            if (p.name() == null || p.name().trim().isBlank()) throw new RuntimeException("Player name is required");
            if (p.place() < 1) throw new RuntimeException("Player place must be >= 1");
        }

        User user = authService.requireUser(session);
        Game game = gameService.getById(req.gameId());

        LocalDate playedAt = (req.playedAt() == null || req.playedAt().isBlank())
                ? LocalDate.now()
                : LocalDate.parse(req.playedAt());

        GameSession gs = new GameSession();
        gs.setUser(user);
        gs.setGame(game);
        gs.setPlayedAt(playedAt);

        for (PlayerDto p : req.players()) {
            GameSessionPlayer pl = new GameSessionPlayer();
            pl.setSession(gs);
            pl.setName(p.name().trim());
            pl.setPlace(p.place());
            gs.getPlayers().add(pl);
        }

        sessionRepository.save(gs);
    }

    public List<SessionResponse> getMySessions(HttpSession session) {
        User user = authService.requireUser(session);

        return sessionRepository.findByUserIdOrderByPlayedAtDescIdDesc(user.getId())
                .stream()
                .map(gs -> new SessionResponse(
                        gs.getId(),
                        gs.getGame().getId(),
                        gs.getGame().getName(),
                        gs.getPlayedAt().toString(),
                        gs.getPlayers().stream()
                                .map(p -> new PlayerDto(p.getName(), p.getPlace()))
                                .toList()
                ))
                .toList();
    }

}
