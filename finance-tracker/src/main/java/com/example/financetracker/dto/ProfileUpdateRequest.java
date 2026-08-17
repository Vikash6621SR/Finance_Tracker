package com.example.financetracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(
            max = 100,
            message = "Name cannot exceed 100 characters"
    )
    private String name;


    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Size(
            max = 150,
            message = "Email cannot exceed 150 characters"
    )
    private String email;


    @Size(
            max = 30,
            message = "Phone cannot exceed 30 characters"
    )
    private String phone;


    @Size(
            max = 100,
            message = "Occupation cannot exceed 100 characters"
    )
    private String occupation;


    public ProfileUpdateRequest() {
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }
}