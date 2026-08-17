package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_transactions")
public class RecurringTransaction {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // NAME
    // =========================================================

    @Column(
            nullable = false,
            length = 100
    )
    private String name;


    // =========================================================
    // TYPE
    // =========================================================

    /*
     * INCOME or EXPENSE
     */

    @Column(
            nullable = false,
            length = 20
    )
    private String type;


    // =========================================================
    // CATEGORY
    // =========================================================

    @Column(
            length = 50
    )
    private String category;


    // =========================================================
    // AMOUNT
    // =========================================================

    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal amount;


    // =========================================================
    // FREQUENCY
    // =========================================================

    /*
     * DAILY
     * WEEKLY
     * MONTHLY
     * YEARLY
     */

    @Column(
            nullable = false,
            length = 20
    )
    private String frequency;


    // =========================================================
    // NEXT DATE
    // =========================================================

    @Column(
            nullable = false
    )
    private LocalDate nextDate;


    // =========================================================
    // DESCRIPTION
    // =========================================================

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

    public RecurringTransaction() {
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


    public String getCategory() {
        return category;
    }


    public BigDecimal getAmount() {
        return amount;
    }


    public String getFrequency() {
        return frequency;
    }


    public LocalDate getNextDate() {
        return nextDate;
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


    public void setCategory(String category) {
        this.category = category;
    }


    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }


    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }


    public void setNextDate(LocalDate nextDate) {
        this.nextDate = nextDate;
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