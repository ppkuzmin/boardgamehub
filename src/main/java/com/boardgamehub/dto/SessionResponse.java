package com.boardgamehub.dto;

import java.util.List;

public record SessionResponse(
        Long id,
        Long gameId,
        String gameName,
        String playedAt,
        List<PlayerDto> players
) {
}
