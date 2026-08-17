package com.example.financetracker.controller;

import com.example.financetracker.dto.TransactionRequest;
import com.example.financetracker.entity.Transaction;
import com.example.financetracker.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TransactionController(
            TransactionService transactionService
    ) {

        this.transactionService =
                transactionService;

    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getTransactions() {

        List<Transaction> transactions =
                transactionService
                        .getAllTransactions();


        return ResponseEntity.ok(
                transactions
        );

    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransaction(
            @PathVariable Long id
    ) {

        Transaction transaction =
                transactionService
                        .getTransactionById(id);


        if (transaction == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Transaction not found."
            );

        }


        return ResponseEntity.ok(
                transaction
        );

    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT
    // =========================================================

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getByAccount(
            @PathVariable Long accountId
    ) {

        return ResponseEntity.ok(
                transactionService
                        .getTransactionsByAccount(
                                accountId
                        )
        );

    }


    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @Valid @RequestBody TransactionRequest request
    ) {

        try {

            Transaction transaction =
                    transactionService.createTransaction(

                            request.getTitle(),

                            request.getAmount(),

                            request.getType(),

                            request.getCategory(),

                            request.getDescription(),

                            request.getTransactionDate(),

                            request.getAccountId()

                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(transaction);


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // UPDATE TRANSACTION
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {

        try {

            Transaction transaction =
                    transactionService.updateTransaction(

                            id,

                            request.getTitle(),

                            request.getAmount(),

                            request.getType(),

                            request.getCategory(),

                            request.getDescription(),

                            request.getTransactionDate(),

                            request.getAccountId()

                    );


            return ResponseEntity.ok(
                    transaction
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @PathVariable Long id
    ) {

        try {

            transactionService.deleteTransaction(
                    id
            );


            Map<String, Object> response =
                    new LinkedHashMap<>();


            response.put(
                    "success",
                    true
            );


            response.put(
                    "message",
                    "Transaction deleted successfully."
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