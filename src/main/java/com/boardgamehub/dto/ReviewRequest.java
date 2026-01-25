package com.boardgamehub.dto;

public record ReviewRequest(Long gameId, int rating, String text) {
}
