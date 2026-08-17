package com.example.financetracker.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RecurringTransactionRequest {

    // =========================================================
    // NAME
    // =========================================================

    @Size(
            max = 100,
            message = "Name cannot exceed 100 characters"
    )
    private String name;


    // =========================================================
    // TITLE
    // =========================================================

    /*
     * Supported because the frontend also sends title.
     */

    @Size(
            max = 100,
            message = "Title cannot exceed 100 characters"
    )
    private String title;


    // =========================================================
    // TYPE
    // =========================================================

    private String type;


    // =========================================================
    // TRANSACTION TYPE
    // =========================================================

    private String transactionType;


    // =========================================================
    // CATEGORY
    // =========================================================

    @Size(
            max = 50,
            message = "Category cannot exceed 50 characters"
    )
    private String category;


    // =========================================================
    // AMOUNT
    // =========================================================

    @NotNull(
            message = "Recurring transaction amount is required"
    )
    @DecimalMin(
            value = "0.01",
            message = "Amount must be greater than zero"
    )
    private BigDecimal amount;


    // =========================================================
    // FREQUENCY
    // =========================================================

    private String frequency;


    // =========================================================
    // NEXT DATE
    // =========================================================

    private LocalDate nextDate;


    // =========================================================
    // START DATE
    // =========================================================

    /*
     * Supported because the frontend sends startDate
     * along with nextDate.
     */

    private LocalDate startDate;


    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters"
    )
    private String description;


    // =========================================================
    // ACTIVE
    // =========================================================

    private Boolean active;


    // =========================================================
    // IS ACTIVE
    // =========================================================

    private Boolean isActive;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RecurringTransactionRequest() {
    }


    // =========================================================
    // RESOLVED NAME
    // =========================================================

    public String getResolvedName() {

        if (
                name != null &&
                        !name.trim().isEmpty()
        ) {

            return name.trim();

        }

        if (
                title != null &&
                        !title.trim().isEmpty()
        ) {

            return title.trim();

        }

        return null;

    }


    // =========================================================
    // RESOLVED TYPE
    // =========================================================

    public String getResolvedType() {

        if (
                type != null &&
                        !type.trim().isEmpty()
        ) {

            return type;

        }

        if (
                transactionType != null &&
                        !transactionType.trim().isEmpty()
        ) {

            return transactionType;

        }

        return null;

    }


    // =========================================================
    // RESOLVED DATE
    // =========================================================

    public LocalDate getResolvedDate() {

        if (nextDate != null) {

            return nextDate;

        }

        return startDate;

    }


    // =========================================================
    // RESOLVED ACTIVE
    // =========================================================

    public boolean getResolvedActive() {

        if (active != null) {

            return active;

        }

        if (isActive != null) {

            return isActive;

        }

        return true;

    }


    // =========================================================
    // GETTERS
    // =========================================================

    public String getName() {
        return name;
    }


    public String getTitle() {
        return title;
    }


    public String getType() {
        return type;
    }


    public String getTransactionType() {
        return transactionType;
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


    public LocalDate getStartDate() {
        return startDate;
    }


    public String getDescription() {
        return description;
    }


    public Boolean getActive() {
        return active;
    }


    public Boolean getIsActive() {
        return isActive;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setName(String name) {
        this.name = name;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    public void setType(String type) {
        this.type = type;
    }


    public void setTransactionType(
            String transactionType
    ) {
        this.transactionType =
                transactionType;
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


    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public void setActive(Boolean active) {
        this.active = active;
    }


    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

}