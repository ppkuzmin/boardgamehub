package com.boardgamehub.dto;

public class GameResponse {
    private Long id;
    private String name;
    private String description;
    private String tags;

    public GameResponse() {}

    public GameResponse(Long id, String name, String description, String tags) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.tags = tags;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
