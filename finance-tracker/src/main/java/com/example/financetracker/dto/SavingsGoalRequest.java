package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SavingsGoalRequest {

    @NotBlank(message = "Savings goal name is required")
    @Size(
            max = 100,
            message = "Goal name cannot exceed 100 characters"
    )
    private String name;


    @NotNull(message = "Target amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Target amount must be greater than zero"
    )
    private BigDecimal targetAmount;


    @DecimalMin(
            value = "0.00",
            message = "Current amount cannot be negative"
    )
    private BigDecimal currentAmount;


    private LocalDate targetDate;


    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters"
    )
    private String description;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SavingsGoalRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

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


    // =========================================================
    // SETTERS
    // =========================================================

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

}
