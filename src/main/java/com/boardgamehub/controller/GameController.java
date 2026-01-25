package com.boardgamehub.controller;

import com.boardgamehub.dto.GameCreateRequest;
import com.boardgamehub.dto.GameResponse;
import com.boardgamehub.dto.GameUpdateRequest;
import com.boardgamehub.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    // READ ALL
    @GetMapping
    public List<GameResponse> getAll() {
        return gameService.getAllGames();
    }

    // READ ONE
    @GetMapping("/{id}")
    public GameResponse getById(@PathVariable Long id) {
        return gameService.getGameById(id);
    }

    // CREATE
    @PostMapping
    public GameResponse create(@RequestBody GameCreateRequest req) {
        return gameService.createGame(req);
    }

    // UPDATE
    @PutMapping("/{id}")
    public GameResponse update(@PathVariable Long id, @RequestBody GameUpdateRequest req) {
        return gameService.updateGame(id, req);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        gameService.deleteGame(id);
        return Map.of("message", "ok");
    }
}
