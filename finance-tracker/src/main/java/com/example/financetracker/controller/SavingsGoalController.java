package com.example.financetracker.controller;

import com.example.financetracker.dto.SavingsContributionRequest;
import com.example.financetracker.dto.SavingsGoalRequest;
import com.example.financetracker.entity.SavingsGoal;
import com.example.financetracker.service.SavingsGoalService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SavingsGoalController(
            SavingsGoalService savingsGoalService
    ) {

        this.savingsGoalService =
                savingsGoalService;

    }


    // =========================================================
    // GET ALL GOALS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllGoals() {

        return ResponseEntity.ok(
                savingsGoalService.getAllGoals()
        );

    }


    // =========================================================
    // GET ACTIVE GOALS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveGoals() {

        return ResponseEntity.ok(
                savingsGoalService.getActiveGoals()
        );

    }


    // =========================================================
    // GET COMPLETED GOALS
    // =========================================================

    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedGoals() {

        return ResponseEntity.ok(
                savingsGoalService.getCompletedGoals()
        );

    }


    // =========================================================
    // GET GOAL BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getGoal(
            @PathVariable Long id
    ) {

        SavingsGoal goal =
                savingsGoalService.getGoalById(id);


        if (goal == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Savings goal not found."
            );

        }


        return ResponseEntity.ok(
                goal
        );

    }


    // =========================================================
    // CREATE GOAL
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createGoal(
            @Valid @RequestBody SavingsGoalRequest request
    ) {

        try {

            SavingsGoal goal =
                    savingsGoalService.createGoal(

                            request.getName(),

                            request.getTargetAmount(),

                            request.getCurrentAmount(),

                            request.getTargetDate(),

                            request.getDescription()

                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(goal);


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // UPDATE GOAL
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequest request
    ) {

        try {

            SavingsGoal goal =
                    savingsGoalService.updateGoal(

                            id,

                            request.getName(),

                            request.getTargetAmount(),

                            request.getCurrentAmount(),

                            request.getTargetDate(),

                            request.getDescription()

                    );


            return ResponseEntity.ok(
                    goal
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // ADD CONTRIBUTION
    // =========================================================

    @PostMapping("/{id}/contribute")
    public ResponseEntity<?> addContribution(
            @PathVariable Long id,
            @Valid @RequestBody
            SavingsContributionRequest request
    ) {

        try {

            SavingsGoal goal =
                    savingsGoalService.addContribution(

                            id,

                            request.getAmount()

                    );


            return ResponseEntity.ok(
                    goal
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // REMOVE CONTRIBUTION
    // =========================================================

    @PostMapping("/{id}/remove-contribution")
    public ResponseEntity<?> removeContribution(
            @PathVariable Long id,
            @Valid @RequestBody
            SavingsContributionRequest request
    ) {

        try {

            SavingsGoal goal =
                    savingsGoalService.removeContribution(

                            id,

                            request.getAmount()

                    );


            return ResponseEntity.ok(
                    goal
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // SAVINGS SUMMARY
    // =========================================================

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSummary(
            @PathVariable Long id
    ) {

        SavingsGoal goal =
                savingsGoalService.getGoalById(id);


        if (goal == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Savings goal not found."
            );

        }


        BigDecimal remaining =
                savingsGoalService
                        .getRemainingAmount(goal);


        BigDecimal progress =
                savingsGoalService
                        .getProgressPercentage(goal);


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "goalId",
                goal.getId()
        );


        response.put(
                "name",
                goal.getName()
        );


        response.put(
                "targetAmount",
                goal.getTargetAmount()
        );


        response.put(
                "currentAmount",
                goal.getCurrentAmount()
        );


        response.put(
                "remainingAmount",
                remaining
        );


        response.put(
                "progressPercentage",
                progress
        );


        response.put(
                "status",
                goal.getStatus()
        );


        response.put(
                "targetDate",
                goal.getTargetDate()
        );


        return ResponseEntity.ok(
                response
        );

    }


    // =========================================================
    // DELETE GOAL
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(
            @PathVariable Long id
    ) {

        try {

            savingsGoalService.deleteGoal(id);


            Map<String, Object> response =
                    new LinkedHashMap<>();


            response.put(
                    "success",
                    true
            );


            response.put(
                    "message",
                    "Savings goal deleted successfully."
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