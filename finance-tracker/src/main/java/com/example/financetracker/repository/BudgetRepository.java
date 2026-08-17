package com.example.financetracker.repository;

import com.example.financetracker.entity.Budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository
        extends JpaRepository<Budget, Long> {

    List<Budget> findByActiveTrue();

    List<Budget> findByCategoryIgnoreCase(
            String category
    );

    List<Budget> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(
            LocalDate date1,
            LocalDate date2
    );

}