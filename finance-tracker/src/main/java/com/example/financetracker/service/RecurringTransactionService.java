package com.example.financetracker.service;

import com.example.financetracker.dto.RecurringTransactionRequest;
import com.example.financetracker.entity.RecurringTransaction;
import com.example.financetracker.repository.RecurringTransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class RecurringTransactionService {


    private final RecurringTransactionRepository
            recurringTransactionRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public RecurringTransactionService(
            RecurringTransactionRepository
                    recurringTransactionRepository
    ) {

        this.recurringTransactionRepository =
                recurringTransactionRepository;

    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<RecurringTransaction>
    getAllRecurringTransactions() {

        return recurringTransactionRepository
                .findAllByOrderByNextDateAsc();

    }


    // =========================================================
    // GET ACTIVE
    // =========================================================

    @Transactional(readOnly = true)
    public List<RecurringTransaction>
    getActiveRecurringTransactions() {

        return recurringTransactionRepository
                .findByActiveTrueOrderByNextDateAsc();

    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public RecurringTransaction
    getRecurringTransactionById(
            Long id
    ) {

        return recurringTransactionRepository
                .findById(id)
                .orElse(null);

    }


    // =========================================================
    // GET BY TYPE
    // =========================================================

    @Transactional(readOnly = true)
    public List<RecurringTransaction>
    getRecurringTransactionsByType(
            String type
    ) {

        return recurringTransactionRepository
                .findByTypeIgnoreCaseOrderByNextDateAsc(
                        normalizeType(type)
                );

    }


    // =========================================================
    // CREATE
    // =========================================================

    public RecurringTransaction
    createRecurringTransaction(
            RecurringTransactionRequest request
    ) {

        validateRequest(request);


        RecurringTransaction recurring =
                new RecurringTransaction();


        recurring.setName(
                request.getResolvedName()
        );


        recurring.setType(
                normalizeType(
                        request.getResolvedType()
                )
        );


        recurring.setCategory(
                clean(request.getCategory())
        );


        recurring.setAmount(
                request.getAmount()
        );


        recurring.setFrequency(
                normalizeFrequency(
                        request.getFrequency()
                )
        );


        recurring.setNextDate(
                request.getResolvedDate()
        );


        recurring.setDescription(
                clean(request.getDescription())
        );


        recurring.setActive(
                request.getResolvedActive()
        );


        return recurringTransactionRepository
                .save(recurring);

    }


    // =========================================================
    // UPDATE
    // =========================================================

    public RecurringTransaction
    updateRecurringTransaction(
            Long id,
            RecurringTransactionRequest request
    ) {

        validateRequest(request);


        RecurringTransaction recurring =
                getRecurringTransactionById(id);


        if (recurring == null) {

            throw new IllegalArgumentException(
                    "Recurring transaction not found."
            );

        }


        recurring.setName(
                request.getResolvedName()
        );


        recurring.setType(
                normalizeType(
                        request.getResolvedType()
                )
        );


        recurring.setCategory(
                clean(request.getCategory())
        );


        recurring.setAmount(
                request.getAmount()
        );


        recurring.setFrequency(
                normalizeFrequency(
                        request.getFrequency()
                )
        );


        recurring.setNextDate(
                request.getResolvedDate()
        );


        recurring.setDescription(
                clean(request.getDescription())
        );


        recurring.setActive(
                request.getResolvedActive()
        );


        return recurringTransactionRepository
                .save(recurring);

    }


    // =========================================================
    // PAUSE / ACTIVATE
    // =========================================================

    public RecurringTransaction
    setActiveStatus(
            Long id,
            boolean active
    ) {

        RecurringTransaction recurring =
                getRecurringTransactionById(id);


        if (recurring == null) {

            throw new IllegalArgumentException(
                    "Recurring transaction not found."
            );

        }


        recurring.setActive(
                active
        );


        return recurringTransactionRepository
                .save(recurring);

    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteRecurringTransaction(
            Long id
    ) {

        RecurringTransaction recurring =
                getRecurringTransactionById(id);


        if (recurring == null) {

            throw new IllegalArgumentException(
                    "Recurring transaction not found."
            );

        }


        recurringTransactionRepository
                .delete(recurring);

    }


    // =========================================================
    // GET DUE TRANSACTIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<RecurringTransaction>
    getDueRecurringTransactions() {

        return recurringTransactionRepository
                .findByActiveTrueAndNextDateLessThanEqualOrderByNextDateAsc(
                        LocalDate.now()
                );

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateRequest(
            RecurringTransactionRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Recurring transaction data is required."
            );

        }


        String name =
                request.getResolvedName();


        if (
                name == null ||
                        name.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Recurring transaction name is required."
            );

        }


        if (name.length() > 100) {

            throw new IllegalArgumentException(
                    "Name cannot exceed 100 characters."
            );

        }


        String type =
                request.getResolvedType();


        if (
                type == null ||
                        type.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Recurring transaction type is required."
            );

        }


        String normalizedType =
                normalizeType(type);


        if (
                !normalizedType.equals("INCOME") &&
                        !normalizedType.equals("EXPENSE")
        ) {

            throw new IllegalArgumentException(
                    "Type must be INCOME or EXPENSE."
            );

        }


        BigDecimal amount =
                request.getAmount();


        if (amount == null) {

            throw new IllegalArgumentException(
                    "Recurring transaction amount is required."
            );

        }


        if (
                amount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Amount must be greater than zero."
            );

        }


        String frequency =
                request.getFrequency();


        if (
                frequency == null ||
                        frequency.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Frequency is required."
            );

        }


        normalizeFrequency(
                frequency
        );


        if (
                request.getResolvedDate() == null
        ) {

            throw new IllegalArgumentException(
                    "Next date is required."
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

            return "";

        }


        String normalized =
                type.trim()
                        .toUpperCase();


        if (
                normalized.equals("CREDIT")
        ) {

            return "INCOME";

        }


        if (
                normalized.equals("DEBIT")
        ) {

            return "EXPENSE";

        }


        return normalized;

    }


    // =========================================================
    // NORMALIZE FREQUENCY
    // =========================================================

    private String normalizeFrequency(
            String frequency
    ) {

        if (frequency == null) {

            throw new IllegalArgumentException(
                    "Frequency is required."
            );

        }


        String normalized =
                frequency
                        .trim()
                        .toUpperCase()
                        .replace(
                                "-",
                                "_"
                        )
                        .replace(
                                " ",
                                "_"
                        );


        if (
                normalized.equals("DAILY") ||
                        normalized.equals("WEEKLY") ||
                        normalized.equals("MONTHLY") ||
                        normalized.equals("YEARLY")
        ) {

            return normalized;

        }


        throw new IllegalArgumentException(
                "Frequency must be DAILY, WEEKLY, MONTHLY, or YEARLY."
        );

    }


    // =========================================================
    // CLEAN STRING
    // =========================================================

    private String clean(
            String value
    ) {

        if (value == null) {

            return null;

        }


        String cleaned =
                value.trim();


        return cleaned.isEmpty()
                ? null
                : cleaned;

    }

}