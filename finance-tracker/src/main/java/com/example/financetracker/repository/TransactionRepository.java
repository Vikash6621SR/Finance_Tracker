package com.example.financetracker.repository;

import com.example.financetracker.entity.Transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountIdOrderByTransactionDateDesc(
            Long accountId
    );

    List<Transaction> findAllByOrderByTransactionDateDesc();

}