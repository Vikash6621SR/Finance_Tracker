package com.example.financetracker.service;

import com.example.financetracker.entity.Account;
import com.example.financetracker.entity.Transaction;
import com.example.financetracker.repository.AccountRepository;
import com.example.financetracker.repository.TransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    private final AccountRepository accountRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository
    ) {

        this.transactionRepository =
                transactionRepository;

        this.accountRepository =
                accountRepository;

    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Transaction> getAllTransactions() {

        return transactionRepository
                .findAllByOrderByTransactionDateDesc();

    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Transaction getTransactionById(
            Long id
    ) {

        return transactionRepository
                .findById(id)
                .orElse(null);

    }


    // =========================================================
    // GET TRANSACTIONS BY ACCOUNT
    // =========================================================

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByAccount(
            Long accountId
    ) {

        return transactionRepository
                .findByAccountIdOrderByTransactionDateDesc(
                        accountId
                );

    }


    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    public Transaction createTransaction(
            String title,
            BigDecimal amount,
            String type,
            String category,
            String description,
            LocalDate transactionDate,
            Long accountId
    ) {

        validateTransaction(
                title,
                amount,
                type,
                transactionDate
        );


        Account account =
                accountRepository
                        .findById(accountId)
                        .orElse(null);


        if (account == null) {

            throw new IllegalArgumentException(
                    "Account not found."
            );

        }


        if (!account.isActive()) {

            throw new IllegalArgumentException(
                    "Cannot add a transaction to an inactive account."
            );

        }


        Transaction transaction =
                new Transaction();


        transaction.setTitle(
                title.trim()
        );


        transaction.setAmount(
                amount
        );


        transaction.setType(
                normalizeType(type)
        );


        transaction.setCategory(
                clean(category)
        );


        transaction.setDescription(
                clean(description)
        );


        transaction.setTransactionDate(
                transactionDate
        );


        transaction.setAccount(
                account
        );


        // -----------------------------------------------------
        // UPDATE ACCOUNT BALANCE
        // -----------------------------------------------------

        updateAccountBalance(
                account,
                transaction.getType(),
                amount
        );


        accountRepository.save(
                account
        );


        return transactionRepository.save(
                transaction
        );

    }


    // =========================================================
    // UPDATE TRANSACTION
    // =========================================================

    public Transaction updateTransaction(
            Long id,
            String title,
            BigDecimal amount,
            String type,
            String category,
            String description,
            LocalDate transactionDate,
            Long accountId
    ) {

        validateTransaction(
                title,
                amount,
                type,
                transactionDate
        );


        Transaction transaction =
                getTransactionById(id);


        if (transaction == null) {

            throw new IllegalArgumentException(
                    "Transaction not found."
            );

        }


        Account oldAccount =
                transaction.getAccount();


        Account newAccount =
                accountRepository
                        .findById(accountId)
                        .orElse(null);


        if (newAccount == null) {

            throw new IllegalArgumentException(
                    "Account not found."
            );

        }


        if (!newAccount.isActive()) {

            throw new IllegalArgumentException(
                    "Cannot use an inactive account."
            );

        }


        String oldType =
                normalizeType(
                        transaction.getType()
                );


        String newType =
                normalizeType(type);


        BigDecimal oldAmount =
                transaction.getAmount();


        // -----------------------------------------------------
        // REVERSE OLD BALANCE EFFECT
        // -----------------------------------------------------

        reverseAccountBalance(
                oldAccount,
                oldType,
                oldAmount
        );


        // -----------------------------------------------------
        // APPLY NEW BALANCE EFFECT
        // -----------------------------------------------------

        updateAccountBalance(
                newAccount,
                newType,
                amount
        );


        // -----------------------------------------------------
        // UPDATE TRANSACTION
        // -----------------------------------------------------

        transaction.setTitle(
                title.trim()
        );


        transaction.setAmount(
                amount
        );


        transaction.setType(
                newType
        );


        transaction.setCategory(
                clean(category)
        );


        transaction.setDescription(
                clean(description)
        );


        transaction.setTransactionDate(
                transactionDate
        );


        transaction.setAccount(
                newAccount
        );


        accountRepository.save(
                oldAccount
        );


        if (
                !oldAccount
                        .getId()
                        .equals(newAccount.getId())
        ) {

            accountRepository.save(
                    newAccount
            );

        }


        return transactionRepository.save(
                transaction
        );

    }


    // =========================================================
    // DELETE TRANSACTION
    // =========================================================

    public void deleteTransaction(
            Long id
    ) {

        Transaction transaction =
                getTransactionById(id);


        if (transaction == null) {

            throw new IllegalArgumentException(
                    "Transaction not found."
            );

        }


        Account account =
                transaction.getAccount();


        // -----------------------------------------------------
        // REVERSE TRANSACTION EFFECT
        // -----------------------------------------------------

        reverseAccountBalance(
                account,
                normalizeType(
                        transaction.getType()
                ),
                transaction.getAmount()
        );


        accountRepository.save(
                account
        );


        transactionRepository.delete(
                transaction
        );

    }


    // =========================================================
    // UPDATE ACCOUNT BALANCE
    // =========================================================

    private void updateAccountBalance(
            Account account,
            String type,
            BigDecimal amount
    ) {

        BigDecimal currentBalance =
                account.getBalance();


        if (currentBalance == null) {

            currentBalance =
                    BigDecimal.ZERO;

        }


        if (
                "INCOME".equals(type)
        ) {

            account.setBalance(
                    currentBalance.add(
                            amount
                    )
            );

        } else {

            account.setBalance(
                    currentBalance.subtract(
                            amount
                    )
            );

        }

    }


    // =========================================================
    // REVERSE ACCOUNT BALANCE
    // =========================================================

    private void reverseAccountBalance(
            Account account,
            String type,
            BigDecimal amount
    ) {

        BigDecimal currentBalance =
                account.getBalance();


        if (currentBalance == null) {

            currentBalance =
                    BigDecimal.ZERO;

        }


        if (
                "INCOME".equals(type)
        ) {

            account.setBalance(
                    currentBalance.subtract(
                            amount
                    )
            );

        } else {

            account.setBalance(
                    currentBalance.add(
                            amount
                    )
            );

        }

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateTransaction(
            String title,
            BigDecimal amount,
            String type,
            LocalDate transactionDate
    ) {

        if (
                title == null ||
                        title.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Transaction title is required."
            );

        }


        if (
                amount == null ||
                        amount.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero."
            );

        }


        normalizeType(type);


        if (transactionDate == null) {

            throw new IllegalArgumentException(
                    "Transaction date is required."
            );

        }

    }


    // =========================================================
    // NORMALIZE TYPE
    // =========================================================

    private String normalizeType(
            String type
    ) {

        if (type == null) {

            throw new IllegalArgumentException(
                    "Transaction type is required."
            );

        }


        String normalized =
                type.trim()
                        .toUpperCase();


        if (
                !normalized.equals("INCOME") &&
                        !normalized.equals("EXPENSE")
        ) {

            throw new IllegalArgumentException(
                    "Transaction type must be INCOME or EXPENSE."
            );

        }


        return normalized;

    }


    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String clean(
            String value
    ) {

        if (
                value == null ||
                        value.isBlank()
        ) {

            return null;

        }


        return value.trim();

    }

}