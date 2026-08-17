/* =========================================================
   FINANCE TRACKER
   FIRST-TIME SETUP
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", async function () {
  /* =====================================================
           ELEMENTS
        ===================================================== */

  const setupForm = document.getElementById("setupForm");

  const nameInput = document.getElementById("name");

  const emailInput = document.getElementById("email");

  const phoneInput = document.getElementById("phone");

  const occupationInput = document.getElementById("occupation");

  const passwordInput = document.getElementById("password");

  const confirmPasswordInput = document.getElementById("confirmPassword");

  const termsInput = document.getElementById("terms");

  const setupButton = document.getElementById("setupButton");

  const message = document.getElementById("setupMessage");

  const leftYear = document.getElementById("leftYear");

  /* =====================================================
           YEAR
        ===================================================== */

  if (leftYear) {
    leftYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
           MESSAGE
        ===================================================== */

  function showMessage(text, type = "error") {
    message.textContent = text;

    message.className = `message show ${type}`;
  }

  function clearMessage() {
    message.textContent = "";

    message.className = "message";
  }

  /* =====================================================
           PASSWORD TOGGLE
        ===================================================== */

  document.querySelectorAll(".password-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.dataset.target;

      const target = document.getElementById(targetId);

      const icon = button.querySelector("i");

      if (!target) {
        return;
      }

      if (target.type === "password") {
        target.type = "text";

        icon.className = "fa-regular fa-eye-slash";

        button.setAttribute("aria-label", "Hide password");
      } else {
        target.type = "password";

        icon.className = "fa-regular fa-eye";

        button.setAttribute("aria-label", "Show password");
      }
    });
  });

  /* =====================================================
           PHONE
        ===================================================== */

  phoneInput.addEventListener("input", function () {
    /*
     * Allow:
     * digits
     * spaces
     * +
     * -
     * parentheses
     */

    this.value = this.value.replace(/[^0-9+\-\s()]/g, "");
  });

  /* =====================================================
           VALIDATION
        ===================================================== */

  function validateForm() {
    clearMessage();

    const name = nameInput.value.trim();

    const email = emailInput.value.trim();

    const phone = phoneInput.value.trim();

    const occupation = occupationInput.value;

    const password = passwordInput.value;

    const confirmPassword = confirmPasswordInput.value;

    /* -------------------------------------------------
               NAME
            ------------------------------------------------- */

    if (!name) {
      showMessage("Please enter your full name.");

      nameInput.focus();

      return false;
    }

    if (name.length < 2) {
      showMessage("Name must contain at least 2 characters.");

      nameInput.focus();

      return false;
    }

    /* -------------------------------------------------
               EMAIL
            ------------------------------------------------- */

    if (!email) {
      showMessage("Please enter your email address.");

      emailInput.focus();

      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showMessage("Please enter a valid email address.");

      emailInput.focus();

      return false;
    }

    /* -------------------------------------------------
               PHONE
            ------------------------------------------------- */

    if (!phone) {
      showMessage("Please enter your phone number.");

      phoneInput.focus();

      return false;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 7) {
      showMessage("Please enter a valid phone number.");

      phoneInput.focus();

      return false;
    }

    /* -------------------------------------------------
               OCCUPATION
            ------------------------------------------------- */

    if (!occupation) {
      showMessage("Please select your occupation.");

      occupationInput.focus();

      return false;
    }

    /* -------------------------------------------------
               PASSWORD
            ------------------------------------------------- */

    if (!password) {
      showMessage("Please create a password.");

      passwordInput.focus();

      return false;
    }

    if (password.length < 6) {
      showMessage("Password must contain at least 6 characters.");

      passwordInput.focus();

      return false;
    }

    /* -------------------------------------------------
               CONFIRM PASSWORD
            ------------------------------------------------- */

    if (!confirmPassword) {
      showMessage("Please confirm your password.");

      confirmPasswordInput.focus();

      return false;
    }

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.");

      confirmPasswordInput.focus();

      return false;
    }

    /* -------------------------------------------------
               TERMS
            ------------------------------------------------- */

    if (!termsInput.checked) {
      showMessage("Please confirm that the information provided is correct.");

      termsInput.focus();

      return false;
    }

    return true;
  }

  /* =====================================================
           SUBMIT
        ===================================================== */

  setupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const name = nameInput.value.trim();

    const email = emailInput.value.trim();

    const phone = phoneInput.value.trim();

    const occupation = occupationInput.value;

    const password = passwordInput.value;

    /* ------------------------------------------------
                   LOADING
                ------------------------------------------------ */

    setupButton.disabled = true;

    setupButton.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <span>Creating Profile...</span>

                `;

    try {
      /*
       * Backend:
       *
       * POST /api/auth/setup
       *
       * SetupRequest contains:
       *
       * name
       * email
       * phone
       * occupation
       * password
       */

      const response = await FinanceAPI.auth.setup({
        name,

        email,

        phone,

        occupation,

        password,
      });

      console.log("Setup response:", response);

      if (!response || response.success !== true) {
        throw new Error(response?.message || "Unable to create your profile.");
      }

      /* ------------------------------------------------
                       SAVE LIGHTWEIGHT USER DATA ONLY
                    ------------------------------------------------ */

      if (response.user) {
        localStorage.setItem(
          "financeTrackerUser",
          JSON.stringify(response.user),
        );
      }

      /*
       * Email can be remembered.
       *
       * Password is NEVER stored.
       */

      localStorage.setItem("financeTrackerRememberedEmail", email);

      /* ------------------------------------------------
                       SUCCESS
                    ------------------------------------------------ */

      showMessage(
        "Profile created successfully. Redirecting to login...",
        "success",
      );

      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      console.error("SETUP ERROR:", error);

      showMessage(FinanceAPI.errorMessage(error));
    } finally {
      setupButton.disabled = false;

      setupButton.innerHTML = `

                        <span>Create Profile</span>

                        <i class="fa-solid fa-arrow-right"></i>

                    `;
    }
  });

  /* =====================================================
           CLEAR MESSAGE
        ===================================================== */

  [
    nameInput,
    emailInput,
    phoneInput,
    occupationInput,
    passwordInput,
    confirmPasswordInput,
  ].forEach(function (input) {
    input.addEventListener("input", clearMessage);

    input.addEventListener("change", clearMessage);
  });

  /* =====================================================
           PASSWORD MATCH
        ===================================================== */

  confirmPasswordInput.addEventListener("input", function () {
    if (passwordInput.value && confirmPasswordInput.value) {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.style.borderColor = "#fca5a5";
      } else {
        confirmPasswordInput.style.borderColor = "";
      }
    }
  });

  /* =====================================================
           CHECK SETUP STATUS
        ===================================================== */

  try {
    const status = await FinanceAPI.auth.setupStatus();

    console.log("Setup status:", status);

    /*
     * If a profile already exists,
     * this page should not be used
     * for another first-time setup.
     */

    if (status && status.profileExists === true) {
      showMessage("A profile already exists. Please sign in instead.", "error");

      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);

      return;
    }
  } catch (error) {
    console.error("Unable to check setup status:", error);

    /*
     * Do not block the form.
     * The POST request will give the final
     * backend response.
     */
  }

  console.log("Finance Tracker Setup loaded.");
});
