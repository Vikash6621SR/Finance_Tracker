package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionRequest {

    // =========================================================
    // TITLE
    // =========================================================

    @NotBlank(message = "Transaction title is required")
    @Size(
            max = 100,
            message = "Title cannot exceed 100 characters"
    )
    private String title;


    // =========================================================
    // AMOUNT
    // =========================================================

    @NotNull(message = "Transaction amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Transaction amount must be greater than zero"
    )
    private BigDecimal amount;


    // =========================================================
    // TYPE
    // =========================================================

    @NotBlank(message = "Transaction type is required")
    private String type;


    // =========================================================
    // CATEGORY
    // =========================================================

    @Size(
            max = 50,
            message = "Category cannot exceed 50 characters"
    )
    private String category;


    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters"
    )
    private String description;


    // =========================================================
    // DATE
    // =========================================================

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;


    // =========================================================
    // ACCOUNT
    // =========================================================

    @NotNull(message = "Account is required")
    private Long accountId;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TransactionRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

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


    public Long getAccountId() {
        return accountId;
    }


    // =========================================================
    // SETTERS
    // =========================================================

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


    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

}