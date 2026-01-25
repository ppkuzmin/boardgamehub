package com.boardgamehub.configuration;

import com.boardgamehub.entity.Game;
import com.boardgamehub.repo.GameRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final GameRepository gameRepository;

    public DataSeeder(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Override
    public void run(String... args) {
        if (gameRepository.count() > 0) return;

        gameRepository.save(makeGame(
                "Dune Imperium",
                "Стратегическа игра, която комбинира deck-building и worker placement в света на „Дюн“.",
                "deck-building,worker-placement,sci-fi"
        ));

        gameRepository.save(makeGame(
                "Carcassonne",
                "Класическа tile-laying игра, в която изграждаш градове, пътища и манастири.",
                "tile-laying,area-control,family"
        ));

        gameRepository.save(makeGame(
                "Slay the Spire",
                "Кооперативна deck-building игра, вдъхновена от дигиталната класика – изкачваш кула и подобряваш тестето.",
                "deck-building,co-op,fantasy"
        ));

        gameRepository.save(makeGame(
                "Catan",
                "Класика за ресурси и търговия – строиш селища и пътища и стигаш до победни точки.",
                "resource-management,trading,family,eurogame"
        ));

        System.out.println("✅ Seeded initial games.");
    }

    private Game makeGame(String name, String description, String tags) {
        Game g = new Game();
        g.setName(name);
        g.setDescription(description);
        g.setTags(tags);
        return g;
    }
}
