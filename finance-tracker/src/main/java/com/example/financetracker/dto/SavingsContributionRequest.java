package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class SavingsContributionRequest {

    // =========================================================
    // CONTRIBUTION AMOUNT
    // =========================================================

    @NotNull(message = "Contribution amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Contribution must be greater than zero"
    )
    private BigDecimal amount;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SavingsContributionRequest() {
    }


    // =========================================================
    // GETTER
    // =========================================================

    public BigDecimal getAmount() {
        return amount;
    }


    // =========================================================
    // SETTER
    // =========================================================

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

}