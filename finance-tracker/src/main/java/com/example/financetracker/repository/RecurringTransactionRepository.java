package com.example.financetracker.repository;

import com.example.financetracker.entity.RecurringTransaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringTransactionRepository
        extends JpaRepository<RecurringTransaction, Long> {


    // =========================================================
    // GET ALL
    // =========================================================

    List<RecurringTransaction>
    findAllByOrderByNextDateAsc();


    // =========================================================
    // GET ACTIVE
    // =========================================================

    List<RecurringTransaction>
    findByActiveTrueOrderByNextDateAsc();


    // =========================================================
    // GET PAUSED
    // =========================================================

    List<RecurringTransaction>
    findByActiveFalseOrderByNextDateAsc();


    // =========================================================
    // GET BY TYPE
    // =========================================================

    List<RecurringTransaction>
    findByTypeIgnoreCaseOrderByNextDateAsc(
            String type
    );


    // =========================================================
    // GET DUE RECURRING TRANSACTIONS
    // =========================================================

    List<RecurringTransaction>
    findByActiveTrueAndNextDateLessThanEqualOrderByNextDateAsc(
            LocalDate date
    );

}