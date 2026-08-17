package com.example.financetracker.controller;

import com.example.financetracker.dto.SettingsRequest;
import com.example.financetracker.entity.AppSettings;
import com.example.financetracker.service.SettingsService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SettingsController(
            SettingsService settingsService
    ) {

        this.settingsService =
                settingsService;

    }


    // =========================================================
    // GET SETTINGS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getSettings() {

        AppSettings settings =
                settingsService.getSettings();


        if (settings == null) {

            return ResponseEntity.ok(
                    settingsService.createSettings()
            );

        }


        return ResponseEntity.ok(
                settings
        );

    }


    // =========================================================
    // CREATE DEFAULT SETTINGS
    // =========================================================

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeSettings() {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        settingsService
                                .createSettings()
                );

    }


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    @PutMapping
    public ResponseEntity<?> updateSettings(
            @Valid @RequestBody SettingsRequest request
    ) {

        try {

            AppSettings settings =
                    settingsService.updateSettings(

                            request.getCurrency(),

                            request.getDateFormat(),

                            request.getTheme(),

                            request.getStartOfWeek(),

                            request.isNotificationsEnabled(),

                            request.getDefaultTransactionType()

                    );


            return ResponseEntity.ok(
                    settings
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

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

}