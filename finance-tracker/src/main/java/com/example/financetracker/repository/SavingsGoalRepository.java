package com.example.financetracker.repository;

import com.example.financetracker.entity.SavingsGoal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingsGoalRepository
        extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findByStatusIgnoreCase(
            String status
    );

}