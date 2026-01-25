package com.boardgamehub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handle(RuntimeException ex) {
        return Map.of("message", ex.getMessage() == null ? "Error" : ex.getMessage());
    }
}
