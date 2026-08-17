package com.example.financetracker.service;

import com.example.financetracker.entity.Budget;
import com.example.financetracker.entity.Transaction;
import com.example.financetracker.repository.BudgetRepository;
import com.example.financetracker.repository.TransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;

    private final TransactionRepository transactionRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public BudgetService(
            BudgetRepository budgetRepository,
            TransactionRepository transactionRepository
    ) {

        this.budgetRepository =
                budgetRepository;

        this.transactionRepository =
                transactionRepository;

    }


    // =========================================================
    // GET ALL BUDGETS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Budget> getAllBudgets() {

        return budgetRepository.findAll();

    }


    // =========================================================
    // GET ACTIVE BUDGETS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Budget> getActiveBudgets() {

        return budgetRepository
                .findByActiveTrue();

    }


    // =========================================================
    // GET BUDGET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Budget getBudgetById(
            Long id
    ) {

        return budgetRepository
                .findById(id)
                .orElse(null);

    }


    // =========================================================
    // CREATE BUDGET
    // =========================================================

    public Budget createBudget(
            String name,
            String category,
            BigDecimal amount,
            String period,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateBudget(
                name,
                category,
                amount,
                period,
                startDate,
                endDate
        );


        Budget budget =
                new Budget();


        budget.setName(
                name.trim()
        );


        budget.setCategory(
                category.trim()
        );


        budget.setAmount(
                amount
        );


        budget.setPeriod(
                normalizePeriod(period)
        );


        budget.setStartDate(
                startDate
        );


        budget.setEndDate(
                endDate
        );


        budget.setActive(
                true
        );


        return budgetRepository.save(
                budget
        );

    }


    // =========================================================
    // UPDATE BUDGET
    // =========================================================

    public Budget updateBudget(
            Long id,
            String name,
            String category,
            BigDecimal amount,
            String period,
            LocalDate startDate,
            LocalDate endDate,
            boolean active
    ) {

        Budget budget =
                getBudgetById(id);


        if (budget == null) {

            throw new IllegalArgumentException(
                    "Budget not found."
            );

        }


        validateBudget(
                name,
                category,
                amount,
                period,
                startDate,
                endDate
        );


        budget.setName(
                name.trim()
        );


        budget.setCategory(
                category.trim()
        );


        budget.setAmount(
                amount
        );


        budget.setPeriod(
                normalizePeriod(period)
        );


        budget.setStartDate(
                startDate
        );


        budget.setEndDate(
                endDate
        );


        budget.setActive(
                active
        );


        return budgetRepository.save(
                budget
        );

    }


    // =========================================================
    // DELETE BUDGET
    // =========================================================

    public void deleteBudget(
            Long id
    ) {

        if (
                !budgetRepository.existsById(id)
        ) {

            throw new IllegalArgumentException(
                    "Budget not found."
            );

        }


        budgetRepository.deleteById(id);

    }


    // =========================================================
    // GET SPENT AMOUNT
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal getSpentAmount(
            Budget budget
    ) {

        List<Transaction> transactions =
                transactionRepository
                        .findAllByOrderByTransactionDateDesc();


        BigDecimal spent =
                BigDecimal.ZERO;


        for (
                Transaction transaction :
                transactions
        ) {

            if (
                    transaction.getType() == null ||
                            !transaction.getType()
                                    .equalsIgnoreCase("EXPENSE")
            ) {
                continue;
            }


            if (
                    transaction.getCategory() == null ||
                            !transaction.getCategory()
                                    .equalsIgnoreCase(
                                            budget.getCategory()
                                    )
            ) {
                continue;
            }


            LocalDate date =
                    transaction.getTransactionDate();


            if (
                    date == null ||
                            date.isBefore(
                                    budget.getStartDate()
                            ) ||
                            date.isAfter(
                                    budget.getEndDate()
                            )
            ) {
                continue;
            }


            if (
                    transaction.getAmount() != null
            ) {

                spent =
                        spent.add(
                                transaction.getAmount()
                        );

            }

        }


        return spent;

    }


    // =========================================================
    // GET REMAINING AMOUNT
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal getRemainingAmount(
            Budget budget
    ) {

        BigDecimal spent =
                getSpentAmount(budget);


        return budget.getAmount()
                .subtract(spent);

    }


    // =========================================================
    // GET PERCENTAGE USED
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal getPercentageUsed(
            Budget budget
    ) {

        BigDecimal spent =
                getSpentAmount(budget);


        if (
                budget.getAmount() == null ||
                        budget.getAmount()
                                .compareTo(
                                        BigDecimal.ZERO
                                ) == 0
        ) {

            return BigDecimal.ZERO;

        }


        return spent
                .multiply(
                        BigDecimal.valueOf(100)
                )
                .divide(
                        budget.getAmount(),
                        2,
                        java.math.RoundingMode.HALF_UP
                );

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateBudget(
            String name,
            String category,
            BigDecimal amount,
            String period,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (
                name == null ||
                        name.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Budget name is required."
            );

        }


        if (
                category == null ||
                        category.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Budget category is required."
            );

        }


        if (
                amount == null ||
                        amount.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Budget amount must be greater than zero."
            );

        }


        normalizePeriod(period);


        if (startDate == null) {

            throw new IllegalArgumentException(
                    "Start date is required."
            );

        }


        if (endDate == null) {

            throw new IllegalArgumentException(
                    "End date is required."
            );

        }


        if (
                endDate.isBefore(startDate)
        ) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date."
            );

        }

    }


    // =========================================================
    // NORMALIZE PERIOD
    // =========================================================

    private String normalizePeriod(
            String period
    ) {

        if (
                period == null ||
                        period.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Budget period is required."
            );

        }


        String normalized =
                period.trim()
                        .toUpperCase();


        if (
                !normalized.equals("WEEKLY") &&
                        !normalized.equals("MONTHLY") &&
                        !normalized.equals("YEARLY") &&
                        !normalized.equals("CUSTOM")
        ) {

            throw new IllegalArgumentException(
                    "Budget period must be WEEKLY, MONTHLY, YEARLY or CUSTOM."
            );

        }


        return normalized;

    }

}