package com.example.financetracker.service;

import com.example.financetracker.entity.AppSettings;
import com.example.financetracker.repository.AppSettingsRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SettingsService {

    private final AppSettingsRepository settingsRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SettingsService(
            AppSettingsRepository settingsRepository
    ) {

        this.settingsRepository =
                settingsRepository;

    }


    // =========================================================
    // GET SETTINGS
    // =========================================================

    @Transactional(readOnly = true)
    public AppSettings getSettings() {

        return settingsRepository
                .findAll()
                .stream()
                .findFirst()
                .orElse(null);

    }


    // =========================================================
    // CREATE DEFAULT SETTINGS
    // =========================================================

    public AppSettings createSettings() {

        AppSettings existing =
                getSettings();


        if (existing != null) {

            return existing;

        }


        AppSettings settings =
                new AppSettings();


        settings.setCurrency("INR");

        settings.setDateFormat("DD/MM/YYYY");

        settings.setTheme("SYSTEM");

        settings.setStartOfWeek("MONDAY");

        settings.setNotificationsEnabled(true);

        settings.setDefaultTransactionType(
                "EXPENSE"
        );


        return settingsRepository.save(
                settings
        );

    }


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    public AppSettings updateSettings(
            String currency,
            String dateFormat,
            String theme,
            String startOfWeek,
            boolean notificationsEnabled,
            String defaultTransactionType
    ) {

        AppSettings settings =
                getSettings();


        if (settings == null) {

            settings =
                    new AppSettings();

        }


        settings.setCurrency(
                normalizeCurrency(currency)
        );


        settings.setDateFormat(
                normalizeDateFormat(dateFormat)
        );


        settings.setTheme(
                normalizeTheme(theme)
        );


        settings.setStartOfWeek(
                normalizeStartOfWeek(
                        startOfWeek
                )
        );


        settings.setNotificationsEnabled(
                notificationsEnabled
        );


        settings.setDefaultTransactionType(
                normalizeTransactionType(
                        defaultTransactionType
                )
        );


        return settingsRepository.save(
                settings
        );

    }


    // =========================================================
    // CURRENCY
    // =========================================================

    private String normalizeCurrency(
            String currency
    ) {

        if (
                currency == null ||
                        currency.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Currency is required."
            );

        }


        String value =
                currency.trim()
                        .toUpperCase();


        if (value.length() > 10) {

            throw new IllegalArgumentException(
                    "Currency cannot exceed 10 characters."
            );

        }


        return value;

    }


    // =========================================================
    // DATE FORMAT
    // =========================================================

    private String normalizeDateFormat(
            String dateFormat
    ) {

        if (
                dateFormat == null ||
                        dateFormat.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Date format is required."
            );

        }


        String value =
                dateFormat.trim()
                        .toUpperCase();


        if (
                !value.equals("DD/MM/YYYY") &&
                        !value.equals("MM/DD/YYYY") &&
                        !value.equals("YYYY-MM-DD")
        ) {

            throw new IllegalArgumentException(
                    "Invalid date format."
            );

        }


        return value;

    }


    // =========================================================
    // THEME
    // =========================================================

    private String normalizeTheme(
            String theme
    ) {

        if (
                theme == null ||
                        theme.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Theme is required."
            );

        }


        String value =
                theme.trim()
                        .toUpperCase();


        if (
                !value.equals("LIGHT") &&
                        !value.equals("DARK") &&
                        !value.equals("SYSTEM")
        ) {

            throw new IllegalArgumentException(
                    "Theme must be LIGHT, DARK or SYSTEM."
            );

        }


        return value;

    }


    // =========================================================
    // START OF WEEK
    // =========================================================

    private String normalizeStartOfWeek(
            String startOfWeek
    ) {

        if (
                startOfWeek == null ||
                        startOfWeek.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Start of week is required."
            );

        }


        String value =
                startOfWeek.trim()
                        .toUpperCase();


        if (
                !value.equals("MONDAY") &&
                        !value.equals("SUNDAY")
        ) {

            throw new IllegalArgumentException(
                    "Start of week must be MONDAY or SUNDAY."
            );

        }


        return value;

    }


    // =========================================================
    // DEFAULT TRANSACTION TYPE
    // =========================================================

    private String normalizeTransactionType(
            String type
    ) {

        if (
                type == null ||
                        type.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Default transaction type is required."
            );

        }


        String value =
                type.trim()
                        .toUpperCase();


        if (
                !value.equals("INCOME") &&
                        !value.equals("EXPENSE")
        ) {

            throw new IllegalArgumentException(
                    "Transaction type must be INCOME or EXPENSE."
            );

        }


        return value;

    }

}