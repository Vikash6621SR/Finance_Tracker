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

  const settingsLogout = document.getElementById("settingsLogout");

  const userAvatar = document.getElementById("userAvatar");

  const userName = document.getElementById("userName");

  const userEmail = document.getElementById("userEmail");

  const currency = document.getElementById("currency");

  const dateFormat = document.getElementById("dateFormat");

  const weekStart = document.getElementById("weekStart");

  const budgetAlerts = document.getElementById("budgetAlerts");

  const recurringAlerts = document.getElementById("recurringAlerts");

  const monthlySummary = document.getElementById("monthlySummary");

  const saveSettings = document.getElementById("saveSettings");

  const resetSettings = document.getElementById("resetSettings");

  const toast = document.getElementById("toast");

  const toastIcon = document.getElementById("toastIcon");

  const toastMessage = document.getElementById("toastMessage");

  /* =====================================================
       STATE
       ===================================================== */

  const STORAGE_KEY = "financeTrackerSettings";

  let toastTimer = null;

  /* =====================================================
       INIT
       ===================================================== */

  init();

  function init() {
    setupEvents();

    loadUser();

    loadSettings();
  }

  /* =====================================================
       EVENTS
       ===================================================== */

  function setupEvents() {
    menuButton?.addEventListener("click", openSidebar);

    closeSidebar?.addEventListener("click", closeSidebarMenu);

    sidebarOverlay?.addEventListener("click", closeSidebarMenu);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 950) {
        closeSidebarMenu();
      }
    });

    saveSettings?.addEventListener("click", savePreferences);

    resetSettings?.addEventListener("click", resetPreferences);

    logoutButton?.addEventListener("click", handleLogout);

    settingsLogout?.addEventListener("click", handleLogout);
  }

  /* =====================================================
       SIDEBAR
       ===================================================== */

  function openSidebar() {
    sidebar.classList.add("open");

    sidebarOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");

    document.body.style.overflow = "";
  }

  /* =====================================================
       USER
       ===================================================== */

  async function loadUser() {
    /*
     * The settings page can work without
     * the user endpoint, so failure here
     * does not break settings.
     */

    try {
      if (typeof getCurrentUser === "function") {
        const response = await getCurrentUser();

        const user = response?.user || response?.data || response;

        if (user) {
          const name =
            user.name || user.fullName || user.username || user.email || "User";

          const email = user.email || "Account";

          userName.textContent = name;

          userEmail.textContent = email;

          userAvatar.textContent = getInitials(name);
        }
      }
    } catch (error) {
      console.warn("Could not load user information.", error);
    }
  }

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
       LOAD SETTINGS
       ===================================================== */

  function loadSettings() {
    let saved = null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch (error) {
      console.warn("Could not read saved settings.", error);
    }

    /*
     * These are preferences, not financial
     * records. We use sensible application
     * defaults only when the user has never
     * saved preferences.
     */

    const settings = {
      currency: saved?.currency || "INR",

      dateFormat: saved?.dateFormat || "DD/MM/YYYY",

      weekStart: saved?.weekStart || "monday",

      budgetAlerts: saved?.budgetAlerts ?? true,

      recurringAlerts: saved?.recurringAlerts ?? true,

      monthlySummary: saved?.monthlySummary ?? true,
    };

    applySettings(settings);
  }

  /* =====================================================
       APPLY
       ===================================================== */

  function applySettings(settings) {
    currency.value = settings.currency;

    dateFormat.value = settings.dateFormat;

    weekStart.value = settings.weekStart;

    budgetAlerts.checked = Boolean(settings.budgetAlerts);

    recurringAlerts.checked = Boolean(settings.recurringAlerts);

    monthlySummary.checked = Boolean(settings.monthlySummary);
  }

  /* =====================================================
       GET SETTINGS
       ===================================================== */

  function getSettings() {
    return {
      currency: currency.value,

      dateFormat: dateFormat.value,

      weekStart: weekStart.value,

      budgetAlerts: budgetAlerts.checked,

      recurringAlerts: recurringAlerts.checked,

      monthlySummary: monthlySummary.checked,
    };
  }

  /* =====================================================
       SAVE
       ===================================================== */

  function savePreferences() {
    const settings = getSettings();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      /*
       * Keep the currency preference
       * available to other pages.
       */

      localStorage.setItem("financeTrackerCurrency", settings.currency);

      localStorage.setItem("financeTrackerDateFormat", settings.dateFormat);

      showToast("Settings saved successfully.");
    } catch (error) {
      console.error("Settings save failed:", error);

      showToast("Unable to save settings.", "error");
    }
  }

  /* =====================================================
       RESET
       ===================================================== */

  function resetPreferences() {
    const confirmed = window.confirm("Reset your application preferences?");

    if (!confirmed) {
      return;
    }

    const defaults = {
      currency: "INR",

      dateFormat: "DD/MM/YYYY",

      weekStart: "monday",

      budgetAlerts: true,

      recurringAlerts: true,

      monthlySummary: true,
    };

    applySettings(defaults);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));

      localStorage.setItem("financeTrackerCurrency", defaults.currency);

      localStorage.setItem("financeTrackerDateFormat", defaults.dateFormat);

      showToast("Settings reset successfully.");
    } catch (error) {
      console.error("Could not reset settings.", error);

      showToast("Unable to reset settings.", "error");
    }
  }

  /* =====================================================
       LOGOUT
       ===================================================== */

  async function handleLogout() {
    try {
      if (typeof logoutUser === "function") {
        await logoutUser();
      }
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      window.location.href = "login.html";
    }
  }

  /* =====================================================
       TOAST
       ===================================================== */

  function showToast(message, type = "success") {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;

    if (type === "error") {
      toastIcon.className = "fa-solid fa-circle-exclamation";

      toastIcon.style.color = "#f87171";
    } else {
      toastIcon.className = "fa-solid fa-circle-check";

      toastIcon.style.color = "#4ade80";
    }

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
});
