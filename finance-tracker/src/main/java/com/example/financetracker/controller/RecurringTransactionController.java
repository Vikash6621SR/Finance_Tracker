package com.example.financetracker.controller;

import com.example.financetracker.dto.RecurringTransactionRequest;
import com.example.financetracker.entity.RecurringTransaction;
import com.example.financetracker.service.RecurringTransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recurring")
public class RecurringTransactionController {


    private final RecurringTransactionService
            recurringTransactionService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RecurringTransactionController(
            RecurringTransactionService
                    recurringTransactionService
    ) {

        this.recurringTransactionService =
                recurringTransactionService;

    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getRecurringTransactions() {

        List<RecurringTransaction>
                recurringTransactions =
                recurringTransactionService
                        .getAllRecurringTransactions();


        return ResponseEntity.ok(
                recurringTransactions
        );

    }


    // =========================================================
    // GET ACTIVE
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveRecurringTransactions() {

        return ResponseEntity.ok(
                recurringTransactionService
                        .getActiveRecurringTransactions()
        );

    }


    // =========================================================
    // GET BY TYPE
    // =========================================================

    @GetMapping("/type/{type}")
    public ResponseEntity<?> getByType(
            @PathVariable String type
    ) {

        try {

            return ResponseEntity.ok(
                    recurringTransactionService
                            .getRecurringTransactionsByType(
                                    type
                            )
            );

        } catch (
                IllegalArgumentException exception
        ) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // GET DUE
    // =========================================================

    @GetMapping("/due")
    public ResponseEntity<?> getDueRecurringTransactions() {

        return ResponseEntity.ok(
                recurringTransactionService
                        .getDueRecurringTransactions()
        );

    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecurringTransaction(
            @PathVariable Long id
    ) {

        RecurringTransaction recurring =
                recurringTransactionService
                        .getRecurringTransactionById(id);


        if (recurring == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Recurring transaction not found."
            );

        }


        return ResponseEntity.ok(
                recurring
        );

    }


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createRecurringTransaction(
            @Valid
            @RequestBody
            RecurringTransactionRequest request
    ) {

        try {

            RecurringTransaction recurring =
                    recurringTransactionService
                            .createRecurringTransaction(
                                    request
                            );


            return ResponseEntity
                    .status(
                            HttpStatus.CREATED
                    )
                    .body(
                            recurring
                    );

        } catch (
                IllegalArgumentException exception
        ) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRecurringTransaction(
            @PathVariable Long id,

            @Valid
            @RequestBody
            RecurringTransactionRequest request
    ) {

        try {

            RecurringTransaction recurring =
                    recurringTransactionService
                            .updateRecurringTransaction(
                                    id,
                                    request
                            );


            return ResponseEntity.ok(
                    recurring
            );

        } catch (
                IllegalArgumentException exception
        ) {

            HttpStatus status =
                    exception.getMessage()
                            .contains("not found")
                            ? HttpStatus.NOT_FOUND
                            : HttpStatus.BAD_REQUEST;


            return errorResponse(
                    status,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // ACTIVATE
    // =========================================================

    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateRecurringTransaction(
            @PathVariable Long id
    ) {

        try {

            RecurringTransaction recurring =
                    recurringTransactionService
                            .setActiveStatus(
                                    id,
                                    true
                            );


            return ResponseEntity.ok(
                    recurring
            );

        } catch (
                IllegalArgumentException exception
        ) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // PAUSE
    // =========================================================

    @PatchMapping("/{id}/pause")
    public ResponseEntity<?> pauseRecurringTransaction(
            @PathVariable Long id
    ) {

        try {

            RecurringTransaction recurring =
                    recurringTransactionService
                            .setActiveStatus(
                                    id,
                                    false
                            );


            return ResponseEntity.ok(
                    recurring
            );

        } catch (
                IllegalArgumentException exception
        ) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecurringTransaction(
            @PathVariable Long id
    ) {

        try {

            recurringTransactionService
                    .deleteRecurringTransaction(
                            id
                    );


            Map<String, Object>
                    response =
                    new LinkedHashMap<>();


            response.put(
                    "success",
                    true
            );


            response.put(
                    "message",
                    "Recurring transaction deleted successfully."
            );


            return ResponseEntity.ok(
                    response
            );

        } catch (
                IllegalArgumentException exception
        ) {

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

        Map<String, Object>
                response =
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