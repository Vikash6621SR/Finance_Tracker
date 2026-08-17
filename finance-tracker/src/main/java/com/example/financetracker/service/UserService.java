package com.example.financetracker.service;

import com.example.financetracker.entity.User;
import com.example.financetracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================================================
    // CHECK WHETHER PROFILE EXISTS
    // =========================================================

    @Transactional(readOnly = true)
    public boolean profileExists() {

        return userRepository.count() > 0;
    }


    // =========================================================
    // GET THE SINGLE USER
    // =========================================================

    @Transactional(readOnly = true)
    public User getUser() {

        List<User> users =
                userRepository.findAll();

        if (users.isEmpty()) {
            return null;
        }

        return users.get(0);
    }


    // =========================================================
    // GET USER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public User getUserById(Long id) {

        return userRepository
                .findById(id)
                .orElse(null);
    }


    // =========================================================
    // CREATE PERSONAL PROFILE
    // =========================================================

    public User createUser(
            String name,
            String email,
            String phone,
            String occupation,
            String password
    ) {

        // -----------------------------------------------------
        // Only one profile is allowed
        // -----------------------------------------------------

        if (profileExists()) {

            throw new IllegalStateException(
                    "A personal profile already exists."
            );
        }


        // -----------------------------------------------------
        // Create user
        // -----------------------------------------------------

        User user =
                new User();


        user.setName(
                clean(name)
        );


        user.setEmail(
                clean(email)
        );


        user.setPhone(
                clean(phone)
        );


        user.setOccupation(
                clean(occupation)
        );


        // -----------------------------------------------------
        // NEVER store plain-text passwords
        // -----------------------------------------------------

        if (
                password != null &&
                        !password.isBlank()
        ) {

            user.setPassword(
                    passwordEncoder.encode(password)
            );

        }


        // -----------------------------------------------------
        // Save
        // -----------------------------------------------------

        return userRepository.save(user);
    }


    // =========================================================
    // UPDATE PERSONAL PROFILE
    // =========================================================

    public User updateProfile(
            String name,
            String email,
            String phone,
            String occupation
    ) {

        User user =
                getUser();


        if (user == null) {

            throw new IllegalStateException(
                    "Personal profile does not exist."
            );
        }


        user.setName(
                clean(name)
        );


        user.setEmail(
                clean(email)
        );


        user.setPhone(
                clean(phone)
        );


        user.setOccupation(
                clean(occupation)
        );


        return userRepository.save(user);
    }


    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    public void changePassword(
            String currentPassword,
            String newPassword
    ) {

        User user =
                getUser();


        if (user == null) {

            throw new IllegalStateException(
                    "Personal profile does not exist."
            );
        }


        // -----------------------------------------------------
        // Check current password
        // -----------------------------------------------------

        if (
                user.getPassword() == null ||
                        user.getPassword().isBlank()
        ) {

            throw new IllegalStateException(
                    "No password is configured."
            );
        }


        boolean matches =
                passwordEncoder.matches(
                        currentPassword,
                        user.getPassword()
                );


        if (!matches) {

            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }


        // -----------------------------------------------------
        // Validate new password
        // -----------------------------------------------------

        validatePassword(
                newPassword
        );


        // -----------------------------------------------------
        // Encode new password
        // -----------------------------------------------------

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );


        userRepository.save(user);
    }


    // =========================================================
    // VERIFY PASSWORD
    // =========================================================

    @Transactional(readOnly = true)
    public boolean verifyPassword(
            String password
    ) {

        User user =
                getUser();


        if (
                user == null ||
                        user.getPassword() == null
        ) {

            return false;
        }


        return passwordEncoder.matches(
                password,
                user.getPassword()
        );
    }


    // =========================================================
    // DELETE PERSONAL PROFILE
    // =========================================================

    public void deleteUser() {

        userRepository.deleteAll();

    }


    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    private void validatePassword(
            String password
    ) {

        if (
                password == null ||
                        password.length() < 8
        ) {

            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters."
            );
        }


        if (!password.matches(".*[A-Z].*")) {

            throw new IllegalArgumentException(
                    "Password must contain at least one uppercase letter."
            );
        }


        if (!password.matches(".*[0-9].*")) {

            throw new IllegalArgumentException(
                    "Password must contain at least one number."
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

    // =========================================================
// VERIFY LOGIN
// =========================================================

    @Transactional(readOnly = true)
    public boolean verifyLogin(
            String email,
            String password
    ) {

        User user = getUser();

        if (user == null) {
            return false;
        }

        if (
                user.getEmail() == null ||
                        !user.getEmail().equalsIgnoreCase(
                                clean(email)
                        )
        ) {
            return false;
        }

        if (
                user.getPassword() == null ||
                        user.getPassword().isBlank()
        ) {
            return false;
        }

        return passwordEncoder.matches(
                password,
                user.getPassword()
        );
    }

    // =========================================================
    // TEMPORARY PASSWORD RESET
    // DEVELOPMENT ONLY
    // =========================================================

    public void resetPasswordForDevelopment(
            String newPassword
    ) {

        User user = getUser();

        if (user == null) {

            throw new IllegalStateException(
                    "Personal profile does not exist."
            );
        }

        // Validate password using the existing rules
        validatePassword(newPassword);

        // Encode password with BCrypt
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        // Save updated password
        userRepository.save(user);
    }

}