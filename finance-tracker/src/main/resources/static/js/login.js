"use strict";

/*
=========================================================
FINANCE TRACKER
LOGIN
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeLogin();

    }
);


/*
=========================================================
INITIALIZE
=========================================================
*/

function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        console.error(
            "loginForm not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        handleLogin
    );


    setupPasswordToggle();

}


/*
=========================================================
LOGIN
=========================================================
*/

async function handleLogin(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    const errorBox =
        document.getElementById(
            "loginError"
        );


    const email =
        emailInput?.value.trim();


    const password =
        passwordInput?.value;


    /*
    -----------------------------------------------------
    CLEAR ERROR
    -----------------------------------------------------
    */

    if (errorBox) {

        errorBox.textContent =
            "";

        errorBox.style.display =
            "none";
    }


    /*
    -----------------------------------------------------
    VALIDATION
    -----------------------------------------------------
    */

    if (!email) {

        showLoginError(
            "Please enter your email address."
        );

        emailInput?.focus();

        return;
    }


    if (!password) {

        showLoginError(
            "Please enter your password."
        );

        passwordInput?.focus();

        return;
    }


    /*
    -----------------------------------------------------
    CHECK FINANCE API
    -----------------------------------------------------
    */

    if (
        !window.FinanceAPI ||
        !FinanceAPI.auth ||
        typeof FinanceAPI.auth.login !==
            "function"
    ) {

        console.error(
            "FinanceAPI is not loaded."
        );


        showLoginError(
            "Finance API is not loaded. Please refresh the page."
        );


        return;
    }


    /*
    -----------------------------------------------------
    LOADING STATE
    -----------------------------------------------------
    */

    setLoginLoading(
        submitButton,
        true
    );


    try {

        /*
        -------------------------------------------------
        LOGIN API
        -------------------------------------------------
        */

        const response =
            await FinanceAPI.auth.login(
                email,
                password
            );


        console.log(
            "Login successful:",
            response
        );


        /*
        -------------------------------------------------
        REMEMBER ME
        -------------------------------------------------
        */

        const rememberMe =
            document.getElementById(
                "rememberMe"
            )?.checked;


        if (
            rememberMe
        ) {

            localStorage.setItem(
                "financeTrackerRememberEmail",
                email
            );

        } else {

            localStorage.removeItem(
                "financeTrackerRememberEmail"
            );
        }


        /*
        -------------------------------------------------
        SAVE LOGIN STATE
        -------------------------------------------------
        */

        sessionStorage.setItem(
            "financeTrackerLoggedIn",
            "true"
        );


        /*
        -------------------------------------------------
        REDIRECT
        -------------------------------------------------
        */

        window.location.href =
            "dashboard.html";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        let message =
            "Unable to sign in. Please check your email and password.";


        if (
            window.FinanceAPI &&
            typeof FinanceAPI.errorMessage ===
                "function"
        ) {

            message =
                FinanceAPI.errorMessage(
                    error
                );

        } else if (
            error?.message
        ) {

            message =
                error.message;
        }


        showLoginError(
            message
        );


    } finally {

        setLoginLoading(
            submitButton,
            false
        );
    }
}


/*
=========================================================
LOGIN ERROR
=========================================================
*/

function showLoginError(
    message
) {

    const errorBox =
        document.getElementById(
            "loginError"
        );


    if (!errorBox) {

        alert(
            message
        );

        return;
    }


    errorBox.textContent =
        message;


    errorBox.style.display =
        "block";
}


/*
=========================================================
LOADING
=========================================================
*/

function setLoginLoading(
    button,
    loading
) {

    if (!button) {

        return;
    }


    if (loading) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.innerHTML;


        button.innerHTML = `
            <span class="login-spinner"></span>
            Signing in...
        `;

    } else {

        button.disabled =
            false;


        if (
            button.dataset.originalText
        ) {

            button.innerHTML =
                button.dataset.originalText;
        }
    }
}


/*
=========================================================
PASSWORD TOGGLE
=========================================================
*/

function setupPasswordToggle() {

    const passwordInput =
        document.getElementById(
            "password"
        );


    const toggleButton =
        document.getElementById(
            "togglePassword"
        );


    if (
        !passwordInput ||
        !toggleButton
    ) {

        return;
    }


    toggleButton.addEventListener(
        "click",
        function () {

            const isPassword =
                passwordInput.type ===
                "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            const icon =
                toggleButton.querySelector(
                    "i"
                );


            if (icon) {

                icon.className =
                    isPassword
                        ? "fa-regular fa-eye-slash"
                        : "fa-regular fa-eye";
            }

        }
    );
}
