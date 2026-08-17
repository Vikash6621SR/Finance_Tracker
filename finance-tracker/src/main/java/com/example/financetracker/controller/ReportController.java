package com.example.financetracker.controller;

import com.example.financetracker.service.ReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReportController(
            ReportService reportService
    ) {

        this.reportService =
                reportService;

    }


    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {

        return ResponseEntity.ok(
                reportService.getDashboardSummary()
        );

    }


    // =========================================================
    // INCOME / EXPENSE REPORT
    // =========================================================

    @GetMapping("/income-expense")
    public ResponseEntity<?> incomeExpense(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        try {

            return ResponseEntity.ok(
                    reportService
                            .getIncomeExpenseReport(
                                    startDate,
                                    endDate
                            )
            );

        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // CATEGORY EXPENSE REPORT
    // =========================================================

    @GetMapping("/categories")
    public ResponseEntity<?> categories(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {

        try {

            return ResponseEntity.ok(
                    reportService
                            .getCategoryExpenseReport(
                                    startDate,
                                    endDate
                            )
            );

        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // MONTHLY REPORT
    // =========================================================

    @GetMapping("/monthly")
    public ResponseEntity<?> monthly(
            @RequestParam int year,
            @RequestParam int month
    ) {

        try {

            return ResponseEntity.ok(
                    reportService
                            .getMonthlyReport(
                                    year,
                                    month
                            )
            );

        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // ACCOUNT REPORT
    // =========================================================

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> account(
            @PathVariable Long accountId
    ) {

        try {

            return ResponseEntity.ok(
                    reportService
                            .getAccountReport(
                                    accountId
                            )
            );

        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // BUDGET REPORT
    // =========================================================

    @GetMapping("/budgets")
    public ResponseEntity<?> budgets() {

        return ResponseEntity.ok(
                reportService.getBudgetReport()
        );

    }


    // =========================================================
    // SAVINGS REPORT
    // =========================================================

    @GetMapping("/savings")
    public ResponseEntity<?> savings() {

        return ResponseEntity.ok(
                reportService.getSavingsReport()
        );

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