package com.example.financetracker.service;

import com.example.financetracker.entity.SavingsGoal;
import com.example.financetracker.repository.SavingsGoalRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SavingsGoalService(
            SavingsGoalRepository savingsGoalRepository
    ) {

        this.savingsGoalRepository =
                savingsGoalRepository;

    }


    // =========================================================
    // GET ALL GOALS
    // =========================================================

    @Transactional(readOnly = true)
    public List<SavingsGoal> getAllGoals() {

        return savingsGoalRepository.findAll();

    }


    // =========================================================
    // GET ACTIVE GOALS
    // =========================================================

    @Transactional(readOnly = true)
    public List<SavingsGoal> getActiveGoals() {

        return savingsGoalRepository
                .findByStatusIgnoreCase("ACTIVE");

    }


    // =========================================================
    // GET COMPLETED GOALS
    // =========================================================

    @Transactional(readOnly = true)
    public List<SavingsGoal> getCompletedGoals() {

        return savingsGoalRepository
                .findByStatusIgnoreCase("COMPLETED");

    }


    // =========================================================
    // GET GOAL BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public SavingsGoal getGoalById(
            Long id
    ) {

        return savingsGoalRepository
                .findById(id)
                .orElse(null);

    }


    // =========================================================
    // CREATE GOAL
    // =========================================================

    public SavingsGoal createGoal(
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount,
            LocalDate targetDate,
            String description
    ) {

        validateGoal(
                name,
                targetAmount,
                currentAmount
        );


        if (currentAmount == null) {

            currentAmount =
                    BigDecimal.ZERO;

        }


        SavingsGoal goal =
                new SavingsGoal();


        goal.setName(
                name.trim()
        );


        goal.setTargetAmount(
                targetAmount
        );


        goal.setCurrentAmount(
                currentAmount
        );


        goal.setTargetDate(
                targetDate
        );


        goal.setDescription(
                clean(description)
        );


        if (
                currentAmount.compareTo(
                        targetAmount
                ) >= 0
        ) {

            goal.setStatus(
                    "COMPLETED"
            );

        } else {

            goal.setStatus(
                    "ACTIVE"
            );

        }


        return savingsGoalRepository.save(
                goal
        );

    }


    // =========================================================
    // UPDATE GOAL
    // =========================================================

    public SavingsGoal updateGoal(
            Long id,
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount,
            LocalDate targetDate,
            String description
    ) {

        SavingsGoal goal =
                getGoalById(id);


        if (goal == null) {

            throw new IllegalArgumentException(
                    "Savings goal not found."
            );

        }


        validateGoal(
                name,
                targetAmount,
                currentAmount
        );


        if (currentAmount == null) {

            currentAmount =
                    BigDecimal.ZERO;

        }


        goal.setName(
                name.trim()
        );


        goal.setTargetAmount(
                targetAmount
        );


        goal.setCurrentAmount(
                currentAmount
        );


        goal.setTargetDate(
                targetDate
        );


        goal.setDescription(
                clean(description)
        );


        updateStatus(goal);


        return savingsGoalRepository.save(
                goal
        );

    }


    // =========================================================
    // ADD CONTRIBUTION
    // =========================================================

    public SavingsGoal addContribution(
            Long id,
            BigDecimal contribution
    ) {

        SavingsGoal goal =
                getGoalById(id);


        if (goal == null) {

            throw new IllegalArgumentException(
                    "Savings goal not found."
            );

        }


        if (
                contribution == null ||
                        contribution.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Contribution must be greater than zero."
            );

        }


        if (
                "COMPLETED".equalsIgnoreCase(
                        goal.getStatus()
                )
        ) {

            throw new IllegalArgumentException(
                    "This savings goal is already completed."
            );

        }


        BigDecimal current =
                goal.getCurrentAmount();


        if (current == null) {

            current =
                    BigDecimal.ZERO;

        }


        goal.setCurrentAmount(
                current.add(
                        contribution
                )
        );


        updateStatus(goal);


        return savingsGoalRepository.save(
                goal
        );

    }


    // =========================================================
    // REMOVE CONTRIBUTION
    // =========================================================

    public SavingsGoal removeContribution(
            Long id,
            BigDecimal amount
    ) {

        SavingsGoal goal =
                getGoalById(id);


        if (goal == null) {

            throw new IllegalArgumentException(
                    "Savings goal not found."
            );

        }


        if (
                amount == null ||
                        amount.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Amount must be greater than zero."
            );

        }


        BigDecimal current =
                goal.getCurrentAmount();


        if (current == null) {

            current =
                    BigDecimal.ZERO;

        }


        if (
                amount.compareTo(
                        current
                ) > 0
        ) {

            throw new IllegalArgumentException(
                    "Cannot remove more than the saved amount."
            );

        }


        goal.setCurrentAmount(
                current.subtract(
                        amount
                )
        );


        updateStatus(goal);


        return savingsGoalRepository.save(
                goal
        );

    }


    // =========================================================
    // DELETE GOAL
    // =========================================================

    public void deleteGoal(
            Long id
    ) {

        if (
                !savingsGoalRepository
                        .existsById(id)
        ) {

            throw new IllegalArgumentException(
                    "Savings goal not found."
            );

        }


        savingsGoalRepository.deleteById(
                id
        );

    }


    // =========================================================
    // CALCULATE REMAINING
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal getRemainingAmount(
            SavingsGoal goal
    ) {

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

            return BigDecimal.ZERO;

        }


        return remaining;

    }


    // =========================================================
    // CALCULATE PROGRESS
    // =========================================================

    @Transactional(readOnly = true)
    public BigDecimal getProgressPercentage(
            SavingsGoal goal
    ) {

        if (
                goal.getTargetAmount() == null ||
                        goal.getTargetAmount()
                                .compareTo(
                                        BigDecimal.ZERO
                                ) <= 0
        ) {

            return BigDecimal.ZERO;

        }


        BigDecimal current =
                goal.getCurrentAmount();


        if (current == null) {

            current =
                    BigDecimal.ZERO;

        }


        BigDecimal percentage =
                current
                        .multiply(
                                BigDecimal.valueOf(100)
                        )
                        .divide(
                                goal.getTargetAmount(),
                                2,
                                RoundingMode.HALF_UP
                        );


        if (
                percentage.compareTo(
                        BigDecimal.valueOf(100)
                ) > 0
        ) {

            return BigDecimal.valueOf(100);

        }


        return percentage;

    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    private void updateStatus(
            SavingsGoal goal
    ) {

        BigDecimal current =
                goal.getCurrentAmount();


        if (current == null) {

            current =
                    BigDecimal.ZERO;

        }


        if (
                current.compareTo(
                        goal.getTargetAmount()
                ) >= 0
        ) {

            goal.setStatus(
                    "COMPLETED"
            );

        } else {

            goal.setStatus(
                    "ACTIVE"
            );

        }

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateGoal(
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount
    ) {

        if (
                name == null ||
                        name.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Savings goal name is required."
            );

        }


        if (
                targetAmount == null ||
                        targetAmount.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {

            throw new IllegalArgumentException(
                    "Target amount must be greater than zero."
            );

        }


        if (
                currentAmount != null &&
                        currentAmount.compareTo(
                                BigDecimal.ZERO
                        ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Current amount cannot be negative."
            );

        }

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
