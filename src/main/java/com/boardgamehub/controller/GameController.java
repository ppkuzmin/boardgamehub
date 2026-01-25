package com.boardgamehub.controller;

import com.boardgamehub.entity.Game;
import com.boardgamehub.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public List<Game> getAll() {
        return gameService.getAllGames();
    }
}
