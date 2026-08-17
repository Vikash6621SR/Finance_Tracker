/* =========================================================
   FINANCE TRACKER
   LOGIN.JS
   ========================================================= */

"use strict";

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeLogin, {
  once: true,
});

/* =========================================================
   INITIALIZE LOGIN
   ========================================================= */

function initializeLogin() {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Login form not found.");

    return;
  }

  form.addEventListener("submit", handleLogin);

  setupPasswordToggle();

  /*
   * Restore remembered email if available.
   */

  const emailInput = document.getElementById("email");

  if (emailInput) {
    try {
      const rememberedEmail = localStorage.getItem(
        "financeTrackerRememberedEmail",
      );

      if (rememberedEmail && !emailInput.value) {
        emailInput.value = rememberedEmail;
      }
    } catch (error) {
      console.warn("Unable to read remembered email.", error);
    }
  }
}

/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");

  const passwordInput = document.getElementById("password");

  if (!emailInput || !passwordInput) {
    showLoginMessage("Login form fields are missing.", "error");

    return;
  }

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  /* =====================================================
       VALIDATION
       ===================================================== */

  if (!email) {
    showLoginMessage("Please enter your email.", "error");

    emailInput.focus();

    return;
  }

  if (!isValidEmail(email)) {
    showLoginMessage("Please enter a valid email address.", "error");

    emailInput.focus();

    return;
  }

  if (!password) {
    showLoginMessage("Please enter your password.", "error");

    passwordInput.focus();

    return;
  }

  clearLoginMessage();

  setLoginLoading(true);

  try {
    /* =================================================
           IMPORTANT FIX
           =================================================

           Your api.js has:

               login(email, password)

           NOT:

               login({ email, password })

           ================================================= */

    const response = await FinanceAPI.auth.login(email, password);

    console.log("Login response:", response);

    /* =================================================
           LOGIN FAILED
           ================================================= */

    if (!response || response.success !== true) {
      showLoginMessage(
        response?.message || "Invalid email or password.",
        "error",
      );

      setLoginLoading(false);

      return;
    }

    /* =================================================
           SAVE LIGHTWEIGHT USER INFORMATION
           ================================================= */

    if (response.user) {
      try {
        localStorage.setItem(
          "financeTrackerUser",
          JSON.stringify(response.user),
        );
      } catch (error) {
        console.warn("Unable to save user information.", error);
      }
    }

    /*
     * Save remembered email.
     */

    try {
      const rememberCheckbox = document.getElementById("rememberMe");

      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem("financeTrackerRememberedEmail", email);
      } else {
        localStorage.removeItem("financeTrackerRememberedEmail");
      }
    } catch (error) {
      console.warn("Unable to save remembered email.", error);
    }

    /* =================================================
           SUCCESS
           ================================================= */

    showLoginMessage("Login successful. Opening dashboard...", "success");

    /*
     * IMPORTANT:
     *
     * No setTimeout().
     * No reload().
     * No second login request.
     */

    window.location.replace("dashboard.html");
  } catch (error) {
    console.error("Login error:", error);

    showLoginMessage(getErrorMessage(error), "error");

    setLoginLoading(false);
  }
}

/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

function setupPasswordToggle() {
  const toggle = document.getElementById("togglePassword");

  const password = document.getElementById("password");

  if (!toggle || !password) {
    return;
  }

  toggle.addEventListener("click", function () {
    const showingPassword = password.type === "password";

    password.type = showingPassword ? "text" : "password";

    const icon = toggle.querySelector("i");

    if (icon) {
      icon.className = showingPassword
        ? "fa-solid fa-eye-slash"
        : "fa-solid fa-eye";
    }
  });
}

/* =========================================================
   BUTTON LOADING
   ========================================================= */

function setLoginLoading(loading) {
  const form = document.getElementById("loginForm");

  if (!form) {
    return;
  }

  const button = form.querySelector('button[type="submit"]');

  if (!button) {
    return;
  }

  if (loading) {
    button.disabled = true;

    if (!button.dataset.originalText) {
      button.dataset.originalText = button.innerHTML;
    }

    button.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <span>
                Signing in...
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
   SHOW MESSAGE
   ========================================================= */

function showLoginMessage(message, type = "error") {
  const element =
    document.getElementById("loginMessage") ||
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

function clearLoginMessage() {
  const element =
    document.getElementById("loginMessage") ||
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
   ERROR MESSAGE
   ========================================================= */

function getErrorMessage(error) {
  if (error && error.message) {
    return error.message;
  }

  return "Unable to connect to the server. " + "Please try again.";
}

