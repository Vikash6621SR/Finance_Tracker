package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class AccountRequest {

    @NotBlank(message = "Account name is required")
    @Size(
            max = 100,
            message = "Account name cannot exceed 100 characters"
    )
    private String name;


    @NotBlank(message = "Account type is required")
    @Size(
            max = 50,
            message = "Account type cannot exceed 50 characters"
    )
    private String type;


    @NotNull(message = "Balance is required")
    @DecimalMin(
            value = "0.00",
            message = "Balance cannot be negative"
    )
    private BigDecimal balance;


    @Size(
            max = 100,
            message = "Institution cannot exceed 100 characters"
    )
    private String institution;


    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters"
    )
    private String description;


    private boolean active = true;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AccountRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

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


    // =========================================================
    // SETTERS
    // =========================================================

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

}