package com.example.financetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SettingsRequest {

    // =========================================================
    // CURRENCY
    // =========================================================

    @NotBlank(message = "Currency is required")
    @Size(
            max = 10,
            message = "Currency cannot exceed 10 characters"
    )
    private String currency;


    // =========================================================
    // DATE FORMAT
    // =========================================================

    @NotBlank(message = "Date format is required")
    private String dateFormat;


    // =========================================================
    // THEME
    // =========================================================

    @NotBlank(message = "Theme is required")
    private String theme;


    // =========================================================
    // START OF WEEK
    // =========================================================

    @NotBlank(message = "Start of week is required")
    private String startOfWeek;


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    private boolean notificationsEnabled;


    // =========================================================
    // DEFAULT TRANSACTION TYPE
    // =========================================================

    @NotBlank(
            message = "Default transaction type is required"
    )
    private String defaultTransactionType;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SettingsRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public String getCurrency() {
        return currency;
    }


    public String getDateFormat() {
        return dateFormat;
    }


    public String getTheme() {
        return theme;
    }


    public String getStartOfWeek() {
        return startOfWeek;
    }


    public boolean isNotificationsEnabled() {
        return notificationsEnabled;
    }


    public String getDefaultTransactionType() {
        return defaultTransactionType;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setCurrency(String currency) {
        this.currency = currency;
    }


    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }


    public void setTheme(String theme) {
        this.theme = theme;
    }


    public void setStartOfWeek(String startOfWeek) {
        this.startOfWeek = startOfWeek;
    }


    public void setNotificationsEnabled(
            boolean notificationsEnabled
    ) {
        this.notificationsEnabled =
                notificationsEnabled;
    }


    public void setDefaultTransactionType(
            String defaultTransactionType
    ) {
        this.defaultTransactionType =
                defaultTransactionType;
    }

}