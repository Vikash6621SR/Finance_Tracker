package com.example.financetracker.controller;

import com.example.financetracker.dto.BudgetRequest;
import com.example.financetracker.entity.Budget;
import com.example.financetracker.service.BudgetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public BudgetController(
            BudgetService budgetService
    ) {

        this.budgetService =
                budgetService;

    }


    // =========================================================
    // GET ALL BUDGETS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getBudgets() {

        return ResponseEntity.ok(
                budgetService.getAllBudgets()
        );

    }


    // =========================================================
    // GET ACTIVE BUDGETS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveBudgets() {

        return ResponseEntity.ok(
                budgetService.getActiveBudgets()
        );

    }


    // =========================================================
    // GET BUDGET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBudget(
            @PathVariable Long id
    ) {

        Budget budget =
                budgetService.getBudgetById(id);


        if (budget == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Budget not found."
            );

        }


        return ResponseEntity.ok(
                budget
        );

    }


    // =========================================================
    // CREATE BUDGET
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createBudget(
            @Valid @RequestBody BudgetRequest request
    ) {

        try {

            Budget budget =
                    budgetService.createBudget(

                            request.getName(),

                            request.getCategory(),

                            request.getAmount(),

                            request.getPeriod(),

                            request.getStartDate(),

                            request.getEndDate()

                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(budget);


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // UPDATE BUDGET
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request
    ) {

        try {

            Budget budget =
                    budgetService.updateBudget(

                            id,

                            request.getName(),

                            request.getCategory(),

                            request.getAmount(),

                            request.getPeriod(),

                            request.getStartDate(),

                            request.getEndDate(),

                            request.isActive()

                    );


            return ResponseEntity.ok(
                    budget
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // BUDGET SUMMARY
    // =========================================================

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getBudgetSummary(
            @PathVariable Long id
    ) {

        Budget budget =
                budgetService.getBudgetById(id);


        if (budget == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Budget not found."
            );

        }


        BigDecimal spent =
                budgetService.getSpentAmount(
                        budget
                );


        BigDecimal remaining =
                budgetService.getRemainingAmount(
                        budget
                );


        BigDecimal percentage =
                budgetService.getPercentageUsed(
                        budget
                );


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "budgetId",
                budget.getId()
        );


        response.put(
                "budgetAmount",
                budget.getAmount()
        );


        response.put(
                "spentAmount",
                spent
        );


        response.put(
                "remainingAmount",
                remaining
        );


        response.put(
                "percentageUsed",
                percentage
        );


        response.put(
                "overBudget",
                remaining.compareTo(
                        BigDecimal.ZERO
                ) < 0
        );


        return ResponseEntity.ok(
                response
        );

    }


    // =========================================================
    // DELETE BUDGET
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(
            @PathVariable Long id
    ) {

        try {

            budgetService.deleteBudget(id);


            Map<String, Object> response =
                    new LinkedHashMap<>();


            response.put(
                    "success",
                    true
            );


            response.put(
                    "message",
                    "Budget deleted successfully."
            );


            return ResponseEntity.ok(
                    response
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
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