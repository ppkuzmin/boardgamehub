package com.boardgamehub.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        int rating,
        String text,
        String authorEmail,
        LocalDateTime createdAt
) {
}
