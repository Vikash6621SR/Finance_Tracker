package com.example.financetracker.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_settings")
public class AppSettings {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // CURRENCY
    // =========================================================

    @Column(
            nullable = false,
            length = 10
    )
    private String currency = "INR";


    // =========================================================
    // DATE FORMAT
    // =========================================================

    @Column(
            nullable = false,
            length = 30
    )
    private String dateFormat = "DD/MM/YYYY";


    // =========================================================
    // THEME
    // =========================================================

    @Column(
            nullable = false,
            length = 20
    )
    private String theme = "SYSTEM";


    // =========================================================
    // START OF WEEK
    // =========================================================

    @Column(
            nullable = false,
            length = 15
    )
    private String startOfWeek = "MONDAY";


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    @Column(
            nullable = false
    )
    private boolean notificationsEnabled = true;


    // =========================================================
    // DEFAULT TRANSACTION TYPE
    // =========================================================

    @Column(
            nullable = false,
            length = 20
    )
    private String defaultTransactionType = "EXPENSE";


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

    public AppSettings() {
    }


    // =========================================================
    // CREATE
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

    }


    // =========================================================
    // UPDATE
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