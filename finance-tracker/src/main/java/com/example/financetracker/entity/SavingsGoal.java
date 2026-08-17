package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings_goals")
public class SavingsGoal {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // GOAL INFORMATION
    // =========================================================

    @Column(
            nullable = false,
            length = 100
    )
    private String name;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal targetAmount;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal currentAmount = BigDecimal.ZERO;


    @Column
    private LocalDate targetDate;


    @Column(
            length = 255
    )
    private String description;


    // =========================================================
    // STATUS
    // =========================================================

    @Column(
            nullable = false,
            length = 20
    )
    private String status = "ACTIVE";


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

    public SavingsGoal() {
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

        if (currentAmount == null) {
            currentAmount = BigDecimal.ZERO;
        }

        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
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


    public BigDecimal getTargetAmount() {
        return targetAmount;
    }


    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }


    public LocalDate getTargetDate() {
        return targetDate;
    }


    public String getDescription() {
        return description;
    }


    public String getStatus() {
        return status;
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


    public void setTargetAmount(
            BigDecimal targetAmount
    ) {
        this.targetAmount = targetAmount;
    }


    public void setCurrentAmount(
            BigDecimal currentAmount
    ) {
        this.currentAmount = currentAmount;
    }


    public void setTargetDate(
            LocalDate targetDate
    ) {
        this.targetDate = targetDate;
    }


    public void setDescription(
            String description
    ) {
        this.description = description;
    }


    public void setStatus(String status) {
        this.status = status;
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