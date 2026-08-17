"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
       ELEMENTS
       ===================================================== */

  const sidebar = document.getElementById("sidebar");

  const sidebarOverlay = document.getElementById("sidebarOverlay");

  const menuButton = document.getElementById("menuButton");

  const closeSidebar = document.getElementById("closeSidebar");

  const logoutButton = document.getElementById("logoutButton");

  const topAvatar = document.getElementById("topAvatar");

  const topUserName = document.getElementById("topUserName");

  const topUserEmail = document.getElementById("topUserEmail");

  const profileAvatar = document.getElementById("profileAvatar");

  const profileDisplayName = document.getElementById("profileDisplayName");

  const profileDisplayEmail = document.getElementById("profileDisplayEmail");

  const memberSince = document.getElementById("memberSince");

  const profileForm = document.getElementById("profileForm");

  const fullName = document.getElementById("fullName");

  const email = document.getElementById("email");

  const phone = document.getElementById("phone");

  const username = document.getElementById("username");

  const bio = document.getElementById("bio");

  const resetButton = document.getElementById("resetButton");

  const saveButton = document.getElementById("saveButton");

  const profileMessage = document.getElementById("profileMessage");

  const passwordForm = document.getElementById("passwordForm");

  const currentPassword = document.getElementById("currentPassword");

  const newPassword = document.getElementById("newPassword");

  const confirmPassword = document.getElementById("confirmPassword");

  const passwordSaveButton = document.getElementById("passwordSaveButton");

  const passwordMessage = document.getElementById("passwordMessage");

  const toast = document.getElementById("toast");

  const toastIcon = document.getElementById("toastIcon");

  const toastMessage = document.getElementById("toastMessage");

  /* =====================================================
       STATE
       ===================================================== */

  let currentUser = null;

  let originalProfile = null;

  let toastTimer = null;

  /* =====================================================
       API CHECK
       ===================================================== */

  if (typeof FinanceAPI === "undefined") {
    console.error("FinanceAPI is not loaded.");

    showToast("FinanceAPI is not loaded. Check api.js.", "error");

    return;
  }

  if (!FinanceAPI.auth) {
    console.error("FinanceAPI.auth is not available.");

    showToast("Authentication API is unavailable.", "error");

    return;
  }

  /* =====================================================
       INITIALIZE
       ===================================================== */

  init();

  async function init() {
    setupEvents();

    await loadProfile();
  }

  /* =====================================================
       EVENTS
       ===================================================== */

  function setupEvents() {
    /* Hamburger menu */

    if (menuButton) {
      menuButton.addEventListener("click", openSidebar);
    }

    /* Close sidebar */

    if (closeSidebar) {
      closeSidebar.addEventListener("click", closeSidebarMenu);
    }

    /* Overlay */

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", closeSidebarMenu);
    }

    /* Resize */

    window.addEventListener("resize", () => {
      if (window.innerWidth > 950) {
        closeSidebarMenu();
      }
    });

    /* Logout */

    if (logoutButton) {
      logoutButton.addEventListener("click", handleLogout);
    }

    /* Profile form */

    if (profileForm) {
      profileForm.addEventListener("submit", saveProfile);
    }

    /* Reset */

    if (resetButton) {
      resetButton.addEventListener("click", resetProfile);
    }

    /* Password form */

    if (passwordForm) {
      passwordForm.addEventListener("submit", changePassword);
    }

    /* Password visibility */

    document.querySelectorAll(".password-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        togglePassword(button);
      });
    });
  }

  /* =====================================================
       SIDEBAR
       ===================================================== */

  function openSidebar() {
    if (sidebar) {
      sidebar.classList.add("open");
    }

    if (sidebarOverlay) {
      sidebarOverlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";
  }

  function closeSidebarMenu() {
    if (sidebar) {
      sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("active");
    }

    document.body.style.overflow = "";
  }

  /* =====================================================
       LOAD PROFILE
       
       CORRECT BACKEND ENDPOINT:
       
       GET /api/auth/me
       
       We use:
       
       FinanceAPI.auth.me()
       
       api.js automatically adds /api.
       ===================================================== */

  async function loadProfile() {
    hideProfileMessage();

    try {
      console.log("Loading current user profile...");

      const response = await FinanceAPI.auth.me();

      console.log("Current user response:", response);

      /*
       * Backend returns:
       *
       * {
       *     success: true,
       *     user: {...}
       * }
       */

      if (!response || !response.user) {
        throw new Error("User profile was not returned by the server.");
      }

      currentUser = response.user;

      originalProfile = buildProfileObject(currentUser);

      populateProfile(originalProfile);

      console.log("Profile loaded successfully:", originalProfile);
    } catch (error) {
      console.error("Could not load profile:", error);

      /*
       * If session expired,
       * send user to login.
       */

      if (error.status === 401 || error.status === 403) {
        showProfileMessage(
          "Your session has expired. Please login again.",
          "error",
        );

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);

        return;
      }

      showProfileMessage(getErrorMessage(error), "error");
    }
  }

  /* =====================================================
       BUILD PROFILE OBJECT
       ===================================================== */

  function buildProfileObject(user) {
    if (!user) {
      return {
        id: null,

        name: "",

        email: "",

        phone: "",

        username: "",

        bio: "",

        createdAt: "",
      };
    }

    return {
      id: user.id ?? user.userId ?? user.user_id ?? null,

      name: user.name ?? user.fullName ?? user.full_name ?? user.username ?? "",

      email: user.email ?? "",

      phone: user.phone ?? user.phoneNumber ?? user.phone_number ?? "",

      username: user.username ?? "",

      bio: user.bio ?? user.about ?? "",

      createdAt:
        user.createdAt ??
        user.created_at ??
        user.registeredAt ??
        user.registrationDate ??
        "",
    };
  }

  /* =====================================================
       POPULATE PROFILE
       ===================================================== */

  function populateProfile(profile) {
    if (!profile) {
      return;
    }

    /* Form fields */

    if (fullName) {
      fullName.value = profile.name || "";
    }

    if (email) {
      email.value = profile.email || "";
    }

    if (phone) {
      phone.value = profile.phone || "";
    }

    if (username) {
      username.value = profile.username || "";
    }

    if (bio) {
      bio.value = profile.bio || "";
    }

    /* Display name */

    const displayName =
      profile.name || profile.username || profile.email || "User";

    /* Display email */

    const displayEmail = profile.email || "Account";

    /* Top bar */

    if (topUserName) {
      topUserName.textContent = displayName;
    }

    if (topUserEmail) {
      topUserEmail.textContent = displayEmail;
    }

    /* Profile card */

    if (profileDisplayName) {
      profileDisplayName.textContent = displayName;
    }

    if (profileDisplayEmail) {
      profileDisplayEmail.textContent = displayEmail;
    }

    /* Avatar */

    const initials = getInitials(displayName);

    if (topAvatar) {
      topAvatar.textContent = initials;
    }

    if (profileAvatar) {
      profileAvatar.textContent = initials;
    }

    /* Member since */

    if (memberSince) {
      memberSince.textContent = formatMemberDate(profile.createdAt);
    }
  }

  /* =====================================================
       SAVE PROFILE
       
       CORRECT BACKEND ENDPOINT:
       
       PUT /api/auth/profile
       
       Using:
       
       FinanceAPI.auth.updateProfile(data)
       ===================================================== */

  async function saveProfile(event) {
    event.preventDefault();

    /* Get values */

    const name = fullName?.value.trim() || "";

    const userEmail = email?.value.trim() || "";

    const userPhone = phone?.value.trim() || "";

    const userUsername = username?.value.trim() || "";

    const userBio = bio?.value.trim() || "";

    /* Validate name */

    if (!name) {
      showProfileMessage("Please enter your full name.", "error");

      fullName?.focus();

      return;
    }

    /* Validate email */

    if (!userEmail) {
      showProfileMessage("Please enter your email address.", "error");

      email?.focus();

      return;
    }

    if (!isValidEmail(userEmail)) {
      showProfileMessage("Please enter a valid email address.", "error");

      email?.focus();

      return;
    }

    /* Payload */

    const payload = {
      name: name,

      email: userEmail,

      phone: userPhone,

      username: userUsername,

      bio: userBio,
    };

    /* Button loading */

    if (saveButton) {
      saveButton.disabled = true;

      saveButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Saving...

            `;
    }

    hideProfileMessage();

    try {
      console.log("Updating profile:", payload);

      /*
       * Correct endpoint:
       *
       * PUT /api/auth/profile
       *
       * FinanceAPI already adds /api.
       */

      const response = await FinanceAPI.auth.updateProfile(payload);

      console.log("Profile update response:", response);

      /*
       * Backend may return:
       *
       * {
       *     success: true,
       *     user: {...}
       * }
       */

      if (response && response.user) {
        currentUser = response.user;

        originalProfile = buildProfileObject(response.user);
      } else {
        /*
         * If backend doesn't return
         * the complete user object,
         * update local display from
         * submitted values.
         */

        originalProfile = {
          ...originalProfile,

          name: name,

          email: userEmail,

          phone: userPhone,

          username: userUsername,

          bio: userBio,
        };
      }

      populateProfile(originalProfile);

      showProfileMessage("Profile updated successfully.", "success");

      showToast("Profile saved successfully.");
    } catch (error) {
      console.error("Profile update failed:", error);

      if (error.status === 401 || error.status === 403) {
        showProfileMessage(
          "Your session has expired. Please login again.",
          "error",
        );

        return;
      }

      showProfileMessage(getErrorMessage(error), "error");
    } finally {
      if (saveButton) {
        saveButton.disabled = false;

        saveButton.innerHTML = `

                    <i class="fa-solid fa-check"></i>

                    Save Changes

                `;
      }
    }
  }

  /* =====================================================
       RESET PROFILE
       ===================================================== */

  function resetProfile() {
    if (!originalProfile) {
      return;
    }

    populateProfile(originalProfile);

    hideProfileMessage();

    showToast("Profile changes reset.");
  }

  /* =====================================================
       CHANGE PASSWORD
       
       CORRECT BACKEND ENDPOINT:
       
       POST /api/auth/change-password
       
       Using:
       
       FinanceAPI.auth.changePassword(...)
       ===================================================== */

  async function changePassword(event) {
    event.preventDefault();

    const current = currentPassword?.value || "";

    const newPass = newPassword?.value || "";

    const confirm = confirmPassword?.value || "";

    /* Current password */

    if (!current) {
      showPasswordMessage("Please enter your current password.", "error");

      currentPassword?.focus();

      return;
    }

    /* New password */

    if (newPass.length < 8) {
      showPasswordMessage(
        "New password must contain at least 8 characters.",
        "error",
      );

      newPassword?.focus();

      return;
    }

    /* Confirm password */

    if (newPass !== confirm) {
      showPasswordMessage(
        "New password and confirmation do not match.",
        "error",
      );

      confirmPassword?.focus();

      return;
    }

    /* Loading */

    if (passwordSaveButton) {
      passwordSaveButton.disabled = true;

      passwordSaveButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Updating...

            `;
    }

    hidePasswordMessage();

    try {
      console.log("Changing password...");

      /*
       * Correct endpoint:
       *
       * POST /api/auth/change-password
       */

      await FinanceAPI.auth.changePassword(current, newPass);

      /* Clear form */

      if (passwordForm) {
        passwordForm.reset();
      }

      showPasswordMessage("Password updated successfully.", "success");

      showToast("Password changed successfully.");
    } catch (error) {
      console.error("Password update failed:", error);

      if (error.status === 401 || error.status === 403) {
        showPasswordMessage(
          "Current password is incorrect or your session has expired.",
          "error",
        );
      } else {
        showPasswordMessage(getErrorMessage(error), "error");
      }
    } finally {
      if (passwordSaveButton) {
        passwordSaveButton.disabled = false;

        passwordSaveButton.innerHTML = `

                    <i class="fa-solid fa-shield-halved"></i>

                    Update Password

                `;
      }
    }
  }

  /* =====================================================
       PASSWORD VISIBILITY
       ===================================================== */

  function togglePassword(button) {
    if (!button) {
      return;
    }

    const targetId = button.dataset.target;

    if (!targetId) {
      return;
    }

    const input = document.getElementById(targetId);

    if (!input) {
      return;
    }

    const icon = button.querySelector("i");

    if (input.type === "password") {
      input.type = "text";

      if (icon) {
        icon.className = "fa-regular fa-eye-slash";
      }
    } else {
      input.type = "password";

      if (icon) {
        icon.className = "fa-regular fa-eye";
      }
    }
  }

  /* =====================================================
       EMAIL VALIDATION
       ===================================================== */

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* =====================================================
       INITIALS
       ===================================================== */

  function getInitials(name) {
    const value = String(name || "").trim();

    if (!value) {
      return "U";
    }

    const parts = value.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* =====================================================
       MEMBER SINCE
       ===================================================== */

  function formatMemberDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      month: "short",

      year: "numeric",
    }).format(date);
  }

  /* =====================================================
       PROFILE MESSAGE
       ===================================================== */

  function showProfileMessage(message, type) {
    if (!profileMessage) {
      return;
    }

    profileMessage.textContent = message;

    profileMessage.className = "profile-message show " + type;
  }

  function hideProfileMessage() {
    if (!profileMessage) {
      return;
    }

    profileMessage.textContent = "";

    profileMessage.className = "profile-message";
  }

  /* =====================================================
       PASSWORD MESSAGE
       ===================================================== */

  function showPasswordMessage(message, type) {
    if (!passwordMessage) {
      return;
    }

    passwordMessage.textContent = message;

    passwordMessage.className = "profile-message show " + type;
  }

  function hidePasswordMessage() {
    if (!passwordMessage) {
      return;
    }

    passwordMessage.textContent = "";

    passwordMessage.className = "profile-message";
  }

  /* =====================================================
       ERROR MESSAGE
       ===================================================== */

  function getErrorMessage(error) {
    if (
      typeof FinanceAPI !== "undefined" &&
      typeof FinanceAPI.errorMessage === "function"
    ) {
      return FinanceAPI.errorMessage(error);
    }

    return error?.message || "Something went wrong. Please try again.";
  }

  /* =====================================================
       TOAST
       ===================================================== */

  function showToast(message, type = "success") {
    clearTimeout(toastTimer);

    if (toastMessage) {
      toastMessage.textContent = message;
    }

    if (toastIcon) {
      if (type === "error") {
        toastIcon.className = "fa-solid fa-circle-exclamation";

        toastIcon.style.color = "#f87171";
      } else {
        toastIcon.className = "fa-solid fa-circle-check";

        toastIcon.style.color = "#4ade80";
      }
    }

    if (!toast) {
      return;
    }

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  /* =====================================================
       LOGOUT
       
       Correct backend:
       
       POST /api/auth/logout
       ===================================================== */

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (!confirmed) {
      return;
    }

    try {
      /*
       * FinanceAPI.session.logout()
       * calls AuthAPI.logout()
       * and clears frontend session.
       */

      if (
        FinanceAPI.session &&
        typeof FinanceAPI.session.logout === "function"
      ) {
        await FinanceAPI.session.logout();

        return;
      }

      /*
       * Fallback:
       */

      await FinanceAPI.auth.logout();
    } catch (error) {
      console.warn("Logout error:", error);

      /*
       * Even if backend logout
       * fails, remove local
       * session information.
       */

      try {
        localStorage.removeItem("financeTrackerUser");

        sessionStorage.clear();
      } catch (storageError) {
        console.warn("Storage cleanup error:", storageError);
      }

      window.location.href = "index.html";
    }
  }
});
