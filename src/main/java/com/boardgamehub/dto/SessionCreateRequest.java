package com.boardgamehub.dto;

import java.util.List;

public record SessionCreateRequest(
        Long gameId,
        String playedAt,
        List<PlayerDto> players
) {
}
