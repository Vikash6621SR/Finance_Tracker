package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BudgetRequest {

    @NotBlank(message = "Budget name is required")
    @Size(
            max = 100,
            message = "Budget name cannot exceed 100 characters"
    )
    private String name;


    @NotBlank(message = "Budget category is required")
    @Size(
            max = 50,
            message = "Category cannot exceed 50 characters"
    )
    private String category;


    @NotNull(message = "Budget amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Budget amount must be greater than zero"
    )
    private BigDecimal amount;


    @NotBlank(message = "Budget period is required")
    private String period;


    @NotNull(message = "Start date is required")
    private LocalDate startDate;


    @NotNull(message = "End date is required")
    private LocalDate endDate;


    private boolean active = true;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public BudgetRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

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


    public LocalDate getStartDate() {
        return startDate;
    }


    public LocalDate getEndDate() {
        return endDate;
    }


    public boolean isActive() {
        return active;
    }


    // =========================================================
    // SETTERS
    // =========================================================

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


    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }


    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }


    public void setActive(boolean active) {
        this.active = active;
    }

}