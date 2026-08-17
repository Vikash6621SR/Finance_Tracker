package com.example.financetracker.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    // =========================================================
    // EMAIL
    // =========================================================

    @NotBlank(message = "Email is required")
    private String email;


    // =========================================================
    // PASSWORD
    // =========================================================

    @NotBlank(message = "Password is required")
    private String password;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LoginRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public String getEmail() {
        return email;
    }


    public String getPassword() {
        return password;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setEmail(String email) {
        this.email = email;
    }


    public void setPassword(String password) {
        this.password = password;
    }

}