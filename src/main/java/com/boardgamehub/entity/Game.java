package com.boardgamehub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "games")
@Getter
@Setter
@ToString(callSuper = true)
public class Game extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // comma-separated tags: "deck-building,worker-placement"
    @Column(nullable = false)
    private String tags;
}
