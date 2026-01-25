package com.boardgamehub.dto;

public class GameCreateRequest {
    private String name;
    private String description;
    private String tags;

    public GameCreateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
