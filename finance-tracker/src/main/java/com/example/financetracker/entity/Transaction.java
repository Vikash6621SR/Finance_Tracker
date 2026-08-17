package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // TRANSACTION INFORMATION
    // =========================================================

    @Column(
            nullable = false,
            length = 100
    )
    private String title;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal amount;


    /*
     * INCOME or EXPENSE
     */

    @Column(
            nullable = false,
            length = 20
    )
    private String type;


    /*
     * Examples:
     * Food
     * Shopping
     * Salary
     * Transport
     * Bills
     * Entertainment
     * Other
     */

    @Column(
            length = 50
    )
    private String category;


    @Column(
            length = 255
    )
    private String description;


    // =========================================================
    // TRANSACTION DATE
    // =========================================================

    @Column(
            nullable = false
    )
    private LocalDate transactionDate;


    // =========================================================
    // ACCOUNT
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "account_id",
            nullable = false
    )
    private Account account;


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

    public Transaction() {
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


    public String getTitle() {
        return title;
    }


    public BigDecimal getAmount() {
        return amount;
    }


    public String getType() {
        return type;
    }


    public String getCategory() {
        return category;
    }


    public String getDescription() {
        return description;
    }


    public LocalDate getTransactionDate() {
        return transactionDate;
    }


    public Account getAccount() {
        return account;
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


    public void setTitle(String title) {
        this.title = title;
    }


    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }


    public void setType(String type) {
        this.type = type;
    }


    public void setCategory(String category) {
        this.category = category;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public void setTransactionDate(
            LocalDate transactionDate
    ) {
        this.transactionDate = transactionDate;
    }


    public void setAccount(Account account) {
        this.account = account;
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