package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
public class Budget {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // BUDGET INFORMATION
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
    private String category;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal amount;


    /*
     * MONTHLY
     * WEEKLY
     * YEARLY
     * CUSTOM
     */

    @Column(
            nullable = false,
            length = 20
    )
    private String period;


    // =========================================================
    // PERIOD DATES
    // =========================================================

    @Column(
            nullable = false
    )
    private java.time.LocalDate startDate;


    @Column(
            nullable = false
    )
    private java.time.LocalDate endDate;


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

    public Budget() {
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


    public String getCategory() {
        return category;
    }


    public BigDecimal getAmount() {
        return amount;
    }


    public String getPeriod() {
        return period;
    }


    public java.time.LocalDate getStartDate() {
        return startDate;
    }


    public java.time.LocalDate getEndDate() {
        return endDate;
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


    public void setCategory(String category) {
        this.category = category;
    }


    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }


    public void setPeriod(String period) {
        this.period = period;
    }


    public void setStartDate(
            java.time.LocalDate startDate
    ) {
        this.startDate = startDate;
    }


    public void setEndDate(
            java.time.LocalDate endDate
    ) {
        this.endDate = endDate;
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