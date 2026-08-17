package com.example.financetracker.service;

import com.example.financetracker.entity.Account;
import com.example.financetracker.entity.Budget;
import com.example.financetracker.entity.SavingsGoal;
import com.example.financetracker.entity.Transaction;
import com.example.financetracker.repository.AccountRepository;
import com.example.financetracker.repository.BudgetRepository;
import com.example.financetracker.repository.SavingsGoalRepository;
import com.example.financetracker.repository.TransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReportService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository,
            SavingsGoalRepository savingsGoalRepository
    ) {

        this.accountRepository =
                accountRepository;

        this.transactionRepository =
                transactionRepository;

        this.budgetRepository =
                budgetRepository;

        this.savingsGoalRepository =
                savingsGoalRepository;

    }


    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    public Map<String, Object> getDashboardSummary() {

        List<Account> accounts =
                accountRepository.findAll();

        List<Transaction> transactions =
                transactionRepository
                        .findAllByOrderByTransactionDateDesc();

        List<SavingsGoal> savingsGoals =
                savingsGoalRepository.findAll();


        BigDecimal totalBalance =
                BigDecimal.ZERO;

        BigDecimal totalIncome =
                BigDecimal.ZERO;

        BigDecimal totalExpense =
                BigDecimal.ZERO;


        // -----------------------------------------------------
        // ACCOUNT BALANCE
        // -----------------------------------------------------

        for (Account account : accounts) {

            if (account.getBalance() != null) {

                totalBalance =
                        totalBalance.add(
                                account.getBalance()
                        );

            }

        }


        // -----------------------------------------------------
        // TRANSACTIONS
        // -----------------------------------------------------

        for (Transaction transaction : transactions) {

            if (
                    transaction.getAmount() == null ||
                            transaction.getType() == null
            ) {
                continue;
            }


            if (
                    "INCOME".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                totalIncome =
                        totalIncome.add(
                                transaction.getAmount()
                        );

            }


            if (
                    "EXPENSE".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                totalExpense =
                        totalExpense.add(
                                transaction.getAmount()
                        );

            }

        }


        BigDecimal netIncome =
                totalIncome.subtract(
                        totalExpense
                );


        BigDecimal totalSaved =
                BigDecimal.ZERO;


        for (SavingsGoal goal : savingsGoals) {

            if (goal.getCurrentAmount() != null) {

                totalSaved =
                        totalSaved.add(
                                goal.getCurrentAmount()
                        );

            }

        }


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "totalBalance",
                totalBalance
        );


        response.put(
                "totalIncome",
                totalIncome
        );


        response.put(
                "totalExpense",
                totalExpense
        );


        response.put(
                "netIncome",
                netIncome
        );


        response.put(
                "totalSaved",
                totalSaved
        );


        response.put(
                "accountCount",
                accounts.size()
        );


        response.put(
                "transactionCount",
                transactions.size()
        );


        response.put(
                "savingsGoalCount",
                savingsGoals.size()
        );


        return response;

    }


    // =========================================================
    // INCOME / EXPENSE REPORT
    // =========================================================

    public Map<String, Object> getIncomeExpenseReport(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );


        List<Transaction> transactions =
                transactionRepository
                        .findAllByOrderByTransactionDateDesc();


        BigDecimal income =
                BigDecimal.ZERO;

        BigDecimal expense =
                BigDecimal.ZERO;


        int incomeTransactions = 0;
        int expenseTransactions = 0;


        for (Transaction transaction : transactions) {

            LocalDate date =
                    transaction.getTransactionDate();


            if (
                    date == null ||
                            date.isBefore(startDate) ||
                            date.isAfter(endDate)
            ) {
                continue;
            }


            if (
                    transaction.getAmount() == null ||
                            transaction.getType() == null
            ) {
                continue;
            }


            if (
                    "INCOME".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                income =
                        income.add(
                                transaction.getAmount()
                        );

                incomeTransactions++;

            }


            if (
                    "EXPENSE".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                expense =
                        expense.add(
                                transaction.getAmount()
                        );

                expenseTransactions++;

            }

        }


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "startDate",
                startDate
        );


        response.put(
                "endDate",
                endDate
        );


        response.put(
                "income",
                income
        );


        response.put(
                "expense",
                expense
        );


        response.put(
                "net",
                income.subtract(expense)
        );


        response.put(
                "incomeTransactions",
                incomeTransactions
        );


        response.put(
                "expenseTransactions",
                expenseTransactions
        );


        return response;

    }


    // =========================================================
    // CATEGORY EXPENSE REPORT
    // =========================================================

    public List<Map<String, Object>> getCategoryExpenseReport(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(
                startDate,
                endDate
        );


        List<Transaction> transactions =
                transactionRepository
                        .findAllByOrderByTransactionDateDesc();


        Map<String, BigDecimal> categoryTotals =
                new LinkedHashMap<>();


        for (Transaction transaction : transactions) {

            if (
                    transaction.getAmount() == null ||
                            transaction.getType() == null
            ) {
                continue;
            }


            if (
                    !"EXPENSE".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {
                continue;
            }


            LocalDate date =
                    transaction.getTransactionDate();


            if (
                    date == null ||
                            date.isBefore(startDate) ||
                            date.isAfter(endDate)
            ) {
                continue;
            }


            String category =
                    transaction.getCategory();


            if (
                    category == null ||
                            category.isBlank()
            ) {

                category = "Uncategorized";

            }


            categoryTotals.merge(
                    category,
                    transaction.getAmount(),
                    BigDecimal::add
            );

        }


        List<Map<String, Object>> result =
                new ArrayList<>();


        for (
                Map.Entry<String, BigDecimal> entry :
                categoryTotals.entrySet()
        ) {

            Map<String, Object> item =
                    new LinkedHashMap<>();


            item.put(
                    "category",
                    entry.getKey()
            );


            item.put(
                    "amount",
                    entry.getValue()
            );


            result.add(item);

        }


        result.sort(
                (a, b) ->
                        ((BigDecimal) b.get("amount"))
                                .compareTo(
                                        (BigDecimal) a.get("amount")
                                )
        );


        return result;

    }


    // =========================================================
    // MONTHLY REPORT
    // =========================================================

    public Map<String, Object> getMonthlyReport(
            int year,
            int month
    ) {

        if (
                month < 1 ||
                        month > 12
        ) {

            throw new IllegalArgumentException(
                    "Month must be between 1 and 12."
            );

        }


        YearMonth yearMonth =
                YearMonth.of(
                        year,
                        month
                );


        LocalDate startDate =
                yearMonth.atDay(1);


        LocalDate endDate =
                yearMonth.atEndOfMonth();


        return getIncomeExpenseReport(
                startDate,
                endDate
        );

    }


    // =========================================================
    // ACCOUNT REPORT
    // =========================================================

    public Map<String, Object> getAccountReport(
            Long accountId
    ) {

        Account account =
                accountRepository
                        .findById(accountId)
                        .orElse(null);


        if (account == null) {

            throw new IllegalArgumentException(
                    "Account not found."
            );

        }


        List<Transaction> transactions =
                transactionRepository
                        .findByAccountIdOrderByTransactionDateDesc(
                                accountId
                        );


        BigDecimal income =
                BigDecimal.ZERO;

        BigDecimal expense =
                BigDecimal.ZERO;


        for (Transaction transaction : transactions) {

            if (
                    transaction.getAmount() == null ||
                            transaction.getType() == null
            ) {
                continue;
            }


            if (
                    "INCOME".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                income =
                        income.add(
                                transaction.getAmount()
                        );

            } else if (
                    "EXPENSE".equalsIgnoreCase(
                            transaction.getType()
                    )
            ) {

                expense =
                        expense.add(
                                transaction.getAmount()
                        );

            }

        }


        Map<String, Object> response =
                new LinkedHashMap<>();


        response.put(
                "accountId",
                account.getId()
        );


        response.put(
                "accountName",
                account.getName()
        );


        response.put(
                "accountType",
                account.getType()
        );


        response.put(
                "balance",
                account.getBalance()
        );


        response.put(
                "income",
                income
        );


        response.put(
                "expense",
                expense
        );


        response.put(
                "transactionCount",
                transactions.size()
        );


        return response;

    }


    // =========================================================
    // BUDGET REPORT
    // =========================================================

    public List<Map<String, Object>> getBudgetReport() {

        List<Budget> budgets =
                budgetRepository.findAll();


        List<Transaction> transactions =
                transactionRepository
                        .findAllByOrderByTransactionDateDesc();


        List<Map<String, Object>> result =
                new ArrayList<>();


        for (Budget budget : budgets) {

            BigDecimal spent =
                    BigDecimal.ZERO;


            for (
                    Transaction transaction :
                    transactions
            ) {

                if (
                        transaction.getAmount() == null ||
                                transaction.getType() == null
                ) {
                    continue;
                }


                if (
                        !"EXPENSE".equalsIgnoreCase(
                                transaction.getType()
                        )
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


                spent =
                        spent.add(
                                transaction.getAmount()
                        );

            }


            BigDecimal remaining =
                    budget.getAmount()
                            .subtract(spent);


            BigDecimal percentage =
                    BigDecimal.ZERO;


            if (
                    budget.getAmount()
                            .compareTo(
                                    BigDecimal.ZERO
                            ) > 0
            ) {

                percentage =
                        spent
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .divide(
                                        budget.getAmount(),
                                        2,
                                        java.math.RoundingMode.HALF_UP
                                );

            }


            if (
                    percentage.compareTo(
                            BigDecimal.valueOf(100)
                    ) > 0
            ) {

                percentage =
                        BigDecimal.valueOf(100);

            }


            Map<String, Object> item =
                    new LinkedHashMap<>();


            item.put(
                    "budgetId",
                    budget.getId()
            );


            item.put(
                    "name",
                    budget.getName()
            );


            item.put(
                    "category",
                    budget.getCategory()
            );


            item.put(
                    "budgetAmount",
                    budget.getAmount()
            );


            item.put(
                    "spentAmount",
                    spent
            );


            item.put(
                    "remainingAmount",
                    remaining
            );


            item.put(
                    "percentageUsed",
                    percentage
            );


            item.put(
                    "overBudget",
                    remaining.compareTo(
                            BigDecimal.ZERO
                    ) < 0
            );


            result.add(item);

        }


        return result;

    }


    // =========================================================
    // SAVINGS REPORT
    // =========================================================

    public List<Map<String, Object>> getSavingsReport() {

        List<SavingsGoal> goals =
                savingsGoalRepository.findAll();


        List<Map<String, Object>> result =
                new ArrayList<>();


        for (SavingsGoal goal : goals) {

            BigDecimal target =
                    goal.getTargetAmount();


            BigDecimal current =
                    goal.getCurrentAmount();


            if (current == null) {

                current =
                        BigDecimal.ZERO;

            }


            BigDecimal remaining =
                    target.subtract(current);


            if (
                    remaining.compareTo(
                            BigDecimal.ZERO
                    ) < 0
            ) {

                remaining =
                        BigDecimal.ZERO;

            }


            BigDecimal percentage =
                    BigDecimal.ZERO;


            if (
                    target != null &&
                            target.compareTo(
                                    BigDecimal.ZERO
                            ) > 0
            ) {

                percentage =
                        current
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .divide(
                                        target,
                                        2,
                                        java.math.RoundingMode.HALF_UP
                                );

            }


            if (
                    percentage.compareTo(
                            BigDecimal.valueOf(100)
                    ) > 0
            ) {

                percentage =
                        BigDecimal.valueOf(100);

            }


            Map<String, Object> item =
                    new LinkedHashMap<>();


            item.put(
                    "goalId",
                    goal.getId()
            );


            item.put(
                    "name",
                    goal.getName()
            );


            item.put(
                    "targetAmount",
                    target
            );


            item.put(
                    "currentAmount",
                    current
            );


            item.put(
                    "remainingAmount",
                    remaining
            );


            item.put(
                    "progressPercentage",
                    percentage
            );


            item.put(
                    "status",
                    goal.getStatus()
            );


            item.put(
                    "targetDate",
                    goal.getTargetDate()
            );


            result.add(item);

        }


        return result;

    }


    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

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

}