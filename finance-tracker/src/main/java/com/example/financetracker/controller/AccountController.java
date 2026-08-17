package com.example.financetracker.controller;

import com.example.financetracker.dto.AccountRequest;
import com.example.financetracker.entity.Account;
import com.example.financetracker.service.AccountService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AccountController(
            AccountService accountService
    ) {

        this.accountService =
                accountService;

    }


    // =========================================================
    // GET ALL ACCOUNTS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAccounts() {

        List<Account> accounts =
                accountService.getAllAccounts();


        return ResponseEntity.ok(
                accounts
        );

    }


    // =========================================================
    // GET ACTIVE ACCOUNTS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAccounts() {

        return ResponseEntity.ok(
                accountService.getActiveAccounts()
        );

    }


    // =========================================================
    // GET ACCOUNT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getAccount(
            @PathVariable Long id
    ) {

        Account account =
                accountService.getAccountById(
                        id
                );


        if (account == null) {

            return errorResponse(
                    HttpStatus.NOT_FOUND,
                    "Account not found."
            );

        }


        return ResponseEntity.ok(
                account
        );

    }


    // =========================================================
    // CREATE ACCOUNT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody AccountRequest request
    ) {

        try {

            Account account =
                    accountService.createAccount(

                            request.getName(),

                            request.getType(),

                            request.getBalance(),

                            request.getInstitution(),

                            request.getDescription()

                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(account);


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // UPDATE ACCOUNT
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request
    ) {

        try {

            Account account =
                    accountService.updateAccount(

                            id,

                            request.getName(),

                            request.getType(),

                            request.getBalance(),

                            request.getInstitution(),

                            request.getDescription(),

                            request.isActive()

                    );


            return ResponseEntity.ok(
                    account
            );


        } catch (IllegalArgumentException exception) {

            return errorResponse(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
            );

        }

    }


    // =========================================================
    // DELETE ACCOUNT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(
            @PathVariable Long id
    ) {

        try {

            accountService.deleteAccount(
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
                    "Account deleted successfully."
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