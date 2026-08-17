package com.example.financetracker.controller;

import com.example.financetracker.dto.ChangePasswordRequest;
import com.example.financetracker.dto.LoginRequest;
import com.example.financetracker.dto.ProfileUpdateRequest;
import com.example.financetracker.dto.SetupRequest;
import com.example.financetracker.entity.User;
import com.example.financetracker.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.context.SecurityContextRepository;

import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    private final SecurityContextRepository securityContextRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AuthController(
            UserService userService,
            SecurityContextRepository securityContextRepository
    ) {

        this.userService = userService;

        this.securityContextRepository = securityContextRepository;
    }


    // =========================================================
    // CHECK SETUP STATUS
    // =========================================================

    @GetMapping("/setup-status")
    public ResponseEntity<?> setupStatus() {

        boolean profileExists =
                userService.profileExists();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "profileExists",
                profileExists
        );

        response.put(
                "setupRequired",
                !profileExists
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // FIRST-TIME SETUP
    // =========================================================

    @PostMapping("/setup")
    public ResponseEntity<?> setup(
            @Valid @RequestBody SetupRequest request
    ) {

        try {

            User user =
                    userService.createUser(
                            request.getName(),
                            request.getEmail(),
                            request.getPhone(),
                            request.getOccupation(),
                            request.getPassword()
                    );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Personal profile created successfully."
            );

            response.put(
                    "user",
                    createUserResponse(user)
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalStateException exception) {

            return errorResponse(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        boolean valid =
                userService.verifyLogin(
                        request.getEmail(),
                        request.getPassword()
                );

        if (!valid) {

            return errorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password."
            );
        }

        User user =
                userService.getUser();

        // -----------------------------------------------------
        // CREATE AUTHENTICATION
        // -----------------------------------------------------

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        null,
                        Collections.emptyList()
                );


        // -----------------------------------------------------
        // CREATE SECURITY CONTEXT
        // -----------------------------------------------------

        SecurityContext context =
                SecurityContextHolder
                        .createEmptyContext();

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);


        // -----------------------------------------------------
        // SAVE SECURITY CONTEXT
        // -----------------------------------------------------

        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );


        // -----------------------------------------------------
        // STORE USER ID IN SESSION
        // -----------------------------------------------------

        HttpSession session =
                httpRequest.getSession(true);

        session.setAttribute(
                "FINANCE_USER_ID",
                user.getId()
        );


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "Login successful."
        );

        response.put(
                "user",
                createUserResponse(user)
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request
    ) {

        SecurityContextHolder.clearContext();

        HttpSession session =
                request.getSession(false);

        if (session != null) {

            session.invalidate();
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "Logout successful."
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<?> currentUser() {

        User user =
                userService.getUser();

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (
                user == null ||
                        authentication == null ||
                        !authentication.isAuthenticated()
        ) {

            return errorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Not authenticated."
            );
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "user",
                createUserResponse(user)
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE PROFILE
    // =========================================================
    //
    // PUT /api/auth/profile
    //
    // Used to change:
    // - Name
    // - Email
    // - Phone
    // - Occupation
    //
    // =========================================================

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        try {

            User user =
                    userService.updateProfile(
                            request.getName(),
                            request.getEmail(),
                            request.getPhone(),
                            request.getOccupation()
                    );


            // -------------------------------------------------
            // UPDATE SECURITY AUTHENTICATION
            // -------------------------------------------------

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            Collections.emptyList()
                    );


            SecurityContext context =
                    SecurityContextHolder
                            .getContext();

            context.setAuthentication(authentication);


            // -------------------------------------------------
            // SAVE UPDATED SECURITY CONTEXT
            // -------------------------------------------------

            securityContextRepository.saveContext(
                    context,
                    httpRequest,
                    httpResponse
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Profile updated successfully."
            );

            response.put(
                    "user",
                    createUserResponse(user)
            );

            return ResponseEntity.ok(response);

        } catch (IllegalStateException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        } catch (Exception exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    "Unable to update profile."
            );
        }
    }


    // =========================================================
    // CHANGE PASSWORD
    // =========================================================
    //
    // POST /api/auth/change-password
    //
    // =========================================================

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {

        try {

            userService.changePassword(
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Password changed successfully."
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        } catch (IllegalStateException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }


    // =========================================================
    // USER RESPONSE
    // =========================================================

    private Map<String, Object> createUserResponse(
            User user
    ) {

        Map<String, Object> userData =
                new LinkedHashMap<>();

        userData.put(
                "id",
                user.getId()
        );

        userData.put(
                "name",
                user.getName()
        );

        userData.put(
                "email",
                user.getEmail()
        );

        userData.put(
                "phone",
                user.getPhone()
        );

        userData.put(
                "occupation",
                user.getOccupation()
        );

        userData.put(
                "createdAt",
                user.getCreatedAt()
        );

        return userData;
    }


    // =========================================================
    // ERROR RESPONSE
    // =========================================================

    private ResponseEntity<?> errorResponse(
            HttpStatus status,
            String message
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "success",
                false
        );

        response.put(
                "message",
                message
        );

        return ResponseEntity
                .status(status)
                .body(response);
    }

    // =========================================================
    // TEMPORARY PASSWORD RESET
    // DEVELOPMENT ONLY
    // =========================================================

    @PostMapping("/dev-reset-password")
    public ResponseEntity<?> resetPasswordForDevelopment(
            @RequestBody Map<String, String> request
    ) {

        try {

            String newPassword =
                    request.get("newPassword");

            userService.resetPasswordForDevelopment(
                    newPassword
            );

            Map<String, Object> response =
                    new LinkedHashMap<>();

            response.put(
                    "success",
                    true
            );

            response.put(
                    "message",
                    "Password reset successfully."
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException |
                 IllegalStateException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );
        }
    }
}