package com.boardgamehub.service;

import com.boardgamehub.dto.GameCreateRequest;
import com.boardgamehub.dto.GameResponse;
import com.boardgamehub.dto.GameUpdateRequest;
import com.boardgamehub.entity.Game;
import com.boardgamehub.repo.GameRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    // -------- READ --------

    public List<GameResponse> getAllGames() {
        return gameRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GameResponse getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));
        return toResponse(game);
    }

    // -------- CREATE --------

    public GameResponse createGame(GameCreateRequest req) {
        validateUpsert(req.getName(), req.getTags());

        Game game = new Game();
        game.setName(req.getName().trim());
        game.setDescription(req.getDescription());
        game.setTags(req.getTags().trim());

        try {
            Game saved = gameRepository.save(game);
            return toResponse(saved);
        } catch (Exception ex) {
            // най-често: unique constraint за name
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create game (maybe duplicate name?)");
        }
    }

    // -------- UPDATE --------

    public GameResponse updateGame(Long id, GameUpdateRequest req) {
        validateUpsert(req.getName(), req.getTags());

        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));

        game.setName(req.getName().trim());
        game.setDescription(req.getDescription());
        game.setTags(req.getTags().trim());

        try {
            Game saved = gameRepository.save(game);
            return toResponse(saved);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update game (maybe duplicate name?)");
        }
    }

    // -------- DELETE --------

    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found");
        }
        gameRepository.deleteById(id);
    }

    // -------- helpers --------

    private GameResponse toResponse(Game game) {
        return new GameResponse(
                game.getId(),
                game.getName(),
                game.getDescription(),
                game.getTags()
        );
    }

    private void validateUpsert(String name, String tags) {
        if (name == null || name.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name is required");
        }
        if (tags == null || tags.trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "tags is required");
        }
    }


    public Game requireGameEntity(Long id) {
        return gameRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found"));
    }
}
