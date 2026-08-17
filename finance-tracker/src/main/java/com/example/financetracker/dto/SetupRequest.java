package com.example.financetracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SetupRequest {

    // =========================================================
    // NAME
    // =========================================================

    @NotBlank(message = "Name is required")
    @Size(
            max = 100,
            message = "Name cannot exceed 100 characters"
    )
    private String name;


    // =========================================================
    // EMAIL
    // =========================================================

    @Email(message = "Enter a valid email address")
    @Size(
            max = 150,
            message = "Email cannot exceed 150 characters"
    )
    private String email;


    // =========================================================
    // PHONE
    // =========================================================

    @Size(
            max = 20,
            message = "Phone number cannot exceed 20 characters"
    )
    private String phone;


    // =========================================================
    // OCCUPATION
    // =========================================================

    @Size(
            max = 100,
            message = "Occupation cannot exceed 100 characters"
    )
    private String occupation;


    // =========================================================
    // PASSWORD
    // =========================================================

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            max = 100,
            message = "Password must contain 8 to 100 characters"
    )
    private String password;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SetupRequest() {
    }


    // =========================================================
    // GETTERS
    // =========================================================

    public String getName() {
        return name;
    }


    public String getEmail() {
        return email;
    }


    public String getPhone() {
        return phone;
    }


    public String getOccupation() {
        return occupation;
    }


    public String getPassword() {
        return password;
    }


    // =========================================================
    // SETTERS
    // =========================================================

    public void setName(String name) {
        this.name = name;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public void setPhone(String phone) {
        this.phone = phone;
    }


    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }


    public void setPassword(String password) {
        this.password = password;
    }

}