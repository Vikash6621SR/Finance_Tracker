package com.example.financetracker.service;

import com.example.financetracker.entity.Account;
import com.example.financetracker.repository.AccountRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AccountService(
            AccountRepository accountRepository
    ) {

        this.accountRepository =
                accountRepository;

    }


    // =========================================================
    // GET ALL ACCOUNTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Account> getAllAccounts() {

        return accountRepository.findAll();

    }


    // =========================================================
    // GET ACTIVE ACCOUNTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Account> getActiveAccounts() {

        return accountRepository
                .findByActiveTrue();

    }


    // =========================================================
    // GET ACCOUNT BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Account getAccountById(
            Long id
    ) {

        return accountRepository
                .findById(id)
                .orElse(null);

    }


    // =========================================================
    // CREATE ACCOUNT
    // =========================================================

    public Account createAccount(
            String name,
            String type,
            BigDecimal balance,
            String institution,
            String description
    ) {

        validateAccount(
                name,
                type,
                balance
        );


        Account account =
                new Account();


        account.setName(
                name.trim()
        );


        account.setType(
                type.trim()
        );


        account.setBalance(
                balance
        );


        account.setInstitution(
                clean(institution)
        );


        account.setDescription(
                clean(description)
        );


        account.setActive(
                true
        );


        return accountRepository.save(
                account
        );

    }


    // =========================================================
    // UPDATE ACCOUNT
    // =========================================================

    public Account updateAccount(
            Long id,
            String name,
            String type,
            BigDecimal balance,
            String institution,
            String description,
            boolean active
    ) {

        Account account =
                getAccountById(id);


        if (account == null) {

            throw new IllegalArgumentException(
                    "Account not found."
            );

        }


        validateAccount(
                name,
                type,
                balance
        );


        account.setName(
                name.trim()
        );


        account.setType(
                type.trim()
        );


        account.setBalance(
                balance
        );


        account.setInstitution(
                clean(institution)
        );


        account.setDescription(
                clean(description)
        );


        account.setActive(
                active
        );


        return accountRepository.save(
                account
        );

    }


    // =========================================================
    // DELETE ACCOUNT
    // =========================================================

    public void deleteAccount(
            Long id
    ) {

        if (
                !accountRepository.existsById(id)
        ) {

            throw new IllegalArgumentException(
                    "Account not found."
            );

        }


        accountRepository.deleteById(
                id
        );

    }


    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateAccount(
            String name,
            String type,
            BigDecimal balance
    ) {

        if (
                name == null ||
                        name.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Account name is required."
            );

        }


        if (
                type == null ||
                        type.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Account type is required."
            );

        }


        if (balance == null) {

            throw new IllegalArgumentException(
                    "Account balance is required."
            );

        }


        if (
                balance.compareTo(
                        BigDecimal.ZERO
                ) < 0
        ) {

            throw new IllegalArgumentException(
                    "Account balance cannot be negative."
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