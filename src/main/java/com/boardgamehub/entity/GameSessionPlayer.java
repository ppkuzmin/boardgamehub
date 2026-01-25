package com.boardgamehub.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "game_session_players")
@Getter
@Setter
@ToString(callSuper = true, exclude = {"session"})
public class GameSessionPlayer extends BaseEntity {

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession session;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int place; // 1..N
}
