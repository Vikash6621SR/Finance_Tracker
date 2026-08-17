package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class Account {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // ACCOUNT INFORMATION
    // =========================================================

    @Column(
            nullable = false,
            length = 100
    )
    private String name;


    @Column(
            nullable = false,
            length = 50
    )
    private String type;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal balance;


    @Column(
            length = 100
    )
    private String institution;


    @Column(
            length = 255
    )
    private String description;


    // =========================================================
    // STATUS
    // =========================================================

    @Column(
            nullable = false
    )
    private boolean active = true;


    // =========================================================
    // TIMESTAMPS
    // =========================================================

    @Column(
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(
            nullable = false
    )
    private LocalDateTime updatedAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Account() {
    }


    // =========================================================
    // CREATE TIMESTAMP
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

    }


    // =========================================================
    // UPDATE TIMESTAMP
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        this.updatedAt =
                LocalDateTime.now();

    }


    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public String getName() {
        return name;
    }


    public String getType() {
        return type;
    }


    public BigDecimal getBalance() {
        return balance;
    }


    public String getInstitution() {
        return institution;
    }


    public String getDescription() {
        return description;
    }


    public boolean isActive() {
        return active;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }


    public void setName(String name) {
        this.name = name;
    }


    public void setType(String type) {
        this.type = type;
    }


    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }


    public void setInstitution(String institution) {
        this.institution = institution;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public void setActive(boolean active) {
        this.active = active;
    }


    public void setCreatedAt(
            LocalDateTime createdAt
    ) {
        this.createdAt = createdAt;
    }


    public void setUpdatedAt(
            LocalDateTime updatedAt
    ) {
        this.updatedAt = updatedAt;
    }

}