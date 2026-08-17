/* =========================================================
   FINANCE TRACKER
   REGISTER.JS

   FLOW:

   index.html
        ↓
   register.html
        ↓
   login.html
        ↓
   dashboard.html

   ========================================================= */

"use strict";

/* =========================================================
   SINGLE STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeRegister, {
  once: true,
});

/* =========================================================
   INITIALIZE REGISTER PAGE
   ========================================================= */

function initializeRegister() {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("Registration form not found.");

    return;
  }

  form.addEventListener("submit", handleRegistration);

  setupPasswordToggle("password", "togglePassword");

  setupPasswordToggle("confirmPassword", "toggleConfirmPassword");
}

/* =========================================================
   REGISTRATION
   ========================================================= */

async function handleRegistration(event) {
  event.preventDefault();

  const form = event.currentTarget;

  const nameInput = document.getElementById("name");

  const emailInput = document.getElementById("email");

  const passwordInput = document.getElementById("password");

  const confirmPasswordInput = document.getElementById("confirmPassword");

  /*
   * Make sure all required fields
   * exist in register.html.
   */

  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    showRegisterMessage("Registration form fields are missing.", "error");

    return;
  }

  const name = nameInput.value.trim();

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  const confirmPassword = confirmPasswordInput.value;

  /* =====================================================
       VALIDATION
       ===================================================== */

  if (!name) {
    showRegisterMessage("Please enter your name.", "error");

    nameInput.focus();

    return;
  }

  if (name.length < 2) {
    showRegisterMessage("Name must contain at least 2 characters.", "error");

    nameInput.focus();

    return;
  }

  if (!email) {
    showRegisterMessage("Please enter your email.", "error");

    emailInput.focus();

    return;
  }

  if (!isValidEmail(email)) {
    showRegisterMessage("Please enter a valid email address.", "error");

    emailInput.focus();

    return;
  }

  if (!password) {
    showRegisterMessage("Please enter a password.", "error");

    passwordInput.focus();

    return;
  }

  if (password.length < 6) {
    showRegisterMessage(
      "Password must contain at least 6 characters.",
      "error",
    );

    passwordInput.focus();

    return;
  }

  if (!confirmPassword) {
    showRegisterMessage("Please confirm your password.", "error");

    confirmPasswordInput.focus();

    return;
  }

  if (password !== confirmPassword) {
    showRegisterMessage("Passwords do not match.", "error");

    confirmPasswordInput.focus();

    return;
  }

  /*
   * Clear previous message.
   */

  clearRegisterMessage();

  /*
   * Disable form while the request
   * is being processed.
   */

  setRegisterLoading(true);

  try {
    /* =================================================
           BACKEND REGISTRATION
           ================================================= */

    const response = await FinanceAPI.auth.register({
      name,
      email,
      password,
    });

    /*
     * Registration failed.
     */

    if (!response || !response.success) {
      showRegisterMessage(getRegisterResponseMessage(response), "error");

      setRegisterLoading(false);

      return;
    }

    /*
     * Registration succeeded.
     *
     * IMPORTANT:
     *
     * Do NOT automatically log the user in.
     *
     * The required project flow is:
     *
     * register → login → dashboard
     */

    showRegisterMessage(
      "Registration successful. Redirecting to login...",
      "success",
    );

    /*
     * Remember the email only for
     * convenience on the login page.
     *
     * This is NOT authentication.
     */

    try {
      localStorage.setItem("financeTrackerRememberedEmail", email);
    } catch (storageError) {
      console.warn("Unable to save remembered email:", storageError);
    }

    /*
     * IMPORTANT:
     *
     * No setTimeout().
     * No page reload.
     * No automatic login.
     *
     * Go directly to login.html.
     */

    window.location.replace("login.html");
  } catch (error) {
    console.error("Registration error:", error);

    showRegisterMessage(getErrorMessage(error), "error");

    setRegisterLoading(false);
  }
}

/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

function setupPasswordToggle(passwordId, toggleId) {
  const password = document.getElementById(passwordId);

  const toggle = document.getElementById(toggleId);

  if (!password || !toggle) {
    return;
  }

  toggle.addEventListener("click", function () {
    const isPassword = password.type === "password";

    password.type = isPassword ? "text" : "password";

    const icon = toggle.querySelector("i");

    if (icon) {
      icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
    }
  });
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function setRegisterLoading(loading) {
  const form = document.getElementById("registerForm");

  if (!form) {
    return;
  }

  const button = form.querySelector('button[type="submit"]');

  if (!button) {
    return;
  }

  if (loading) {
    button.disabled = true;

    /*
     * Store original button
     * text only once.
     */

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }

    button.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <span>
                Creating account...
            </span>

        `;
  } else {
    button.disabled = false;

    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }
}

/* =========================================================
   MESSAGE
   ========================================================= */

function showRegisterMessage(message, type = "error") {
  /*
   * Supports the common IDs used
   * by the registration page.
   */

  const element =
    document.getElementById("registerMessage") ||
    document.getElementById("errorMessage") ||
    document.getElementById("message");

  if (!element) {
    console.error(message);

    return;
  }

  element.textContent = message;

  element.classList.remove("success", "error", "show");

  element.classList.add(type, "show");

  element.style.display = "block";
}

/* =========================================================
   CLEAR MESSAGE
   ========================================================= */

function clearRegisterMessage() {
  const element =
    document.getElementById("registerMessage") ||
    document.getElementById("errorMessage") ||
    document.getElementById("message");

  if (!element) {
    return;
  }

  element.textContent = "";

  element.classList.remove("success", "error", "show");

  element.style.display = "none";
}

/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
   RESPONSE ERROR MESSAGE
   ========================================================= */

function getRegisterResponseMessage(response) {
  if (response && response.message) {
    return response.message;
  }

  return "Unable to create your account.";
}

/* =========================================================
   API ERROR MESSAGE
   ========================================================= */

function getErrorMessage(error) {
  if (
    typeof FinanceAPI !== "undefined" &&
    typeof FinanceAPI.errorMessage === "function"
  ) {
    return FinanceAPI.errorMessage(error);
  }

  if (error && error.message) {
    return error.message;
  }

  return "Unable to connect to the server. " + "Please try again.";
}

