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
  const refreshButton = document.getElementById("refreshButton");

  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userAvatar = document.getElementById("userAvatar");

  const totalRecurring = document.getElementById("totalRecurring");
  const activeRecurring = document.getElementById("activeRecurring");
  const pausedRecurring = document.getElementById("pausedRecurring");
  const totalAmount = document.getElementById("totalAmount");

  const searchInput = document.getElementById("searchInput");
  const typeFilter = document.getElementById("typeFilter");
  const statusFilter = document.getElementById("statusFilter");
  const clearFilters = document.getElementById("clearFilters");

  const recurringGrid = document.getElementById("recurringGrid");
  const emptyState = document.getElementById("emptyState");
  const resultText = document.getElementById("resultText");

  const addRecurringButton = document.getElementById("addRecurringButton");

  const panelAddButton = document.getElementById("panelAddButton");

  const emptyAddButton = document.getElementById("emptyAddButton");

  const recurringModal = document.getElementById("recurringModal");

  const modalTitle = document.getElementById("modalTitle");

  const modalClose = document.getElementById("modalClose");

  const cancelButton = document.getElementById("cancelButton");

  const modalMessage = document.getElementById("modalMessage");

  const recurringForm = document.getElementById("recurringForm");

  const recurringId = document.getElementById("recurringId");

  const recurringName = document.getElementById("recurringName");

  const recurringType = document.getElementById("recurringType");

  const recurringCategory = document.getElementById("recurringCategory");

  const recurringAmount = document.getElementById("recurringAmount");

  const recurringFrequency = document.getElementById("recurringFrequency");

  const recurringStartDate = document.getElementById("recurringStartDate");

  const recurringDescription = document.getElementById("recurringDescription");

  const recurringActive = document.getElementById("recurringActive");

  const saveButton = document.getElementById("saveButton");

  const confirmOverlay = document.getElementById("confirmOverlay");

  const confirmCancel = document.getElementById("confirmCancel");

  const confirmDelete = document.getElementById("confirmDelete");

  const toast = document.getElementById("toast");

  const toastIcon = document.getElementById("toastIcon");

  const toastMessage = document.getElementById("toastMessage");

  /* =====================================================
       STATE
     ===================================================== */

  let recurringTransactions = [];

  let editingId = null;

  let deletingId = null;

  let toastTimer = null;

  /* =====================================================
       API CHECK
     ===================================================== */

  if (typeof apiGet !== "function") {
    console.error("api.js is required.");

    if (typeof showToast === "function") {
      showToast("api.js is not loaded.", "error");
    }

    return;
  }

  /* =====================================================
       INIT
     ===================================================== */

  init();

  async function init() {
    setupEvents();

    setDefaultDate();

    await loadUser();

    await loadRecurring();
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

    logoutButton?.addEventListener("click", handleLogout);

    refreshButton?.addEventListener("click", refreshData);

    addRecurringButton?.addEventListener("click", openAddModal);

    panelAddButton?.addEventListener("click", openAddModal);

    emptyAddButton?.addEventListener("click", openAddModal);

    modalClose?.addEventListener("click", closeModal);

    cancelButton?.addEventListener("click", closeModal);

    recurringModal?.addEventListener("click", (event) => {
      if (event.target === recurringModal) {
        closeModal();
      }
    });

    recurringForm?.addEventListener("submit", handleSubmit);

    searchInput?.addEventListener("input", renderRecurring);

    typeFilter?.addEventListener("change", renderRecurring);

    statusFilter?.addEventListener("change", renderRecurring);

    clearFilters?.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }

      if (typeFilter) {
        typeFilter.value = "all";
      }

      if (statusFilter) {
        statusFilter.value = "all";
      }

      renderRecurring();
    });

    confirmCancel?.addEventListener("click", closeConfirm);

    confirmDelete?.addEventListener("click", deleteRecurring);

    confirmOverlay?.addEventListener("click", (event) => {
      if (event.target === confirmOverlay) {
        closeConfirm();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();

        closeConfirm();

        closeSidebarMenu();
      }
    });
  }

  /* =====================================================
       SIDEBAR
     ===================================================== */

  function openSidebar() {
    if (!sidebar) {
      return;
    }

    sidebar.classList.add("open");

    if (sidebarOverlay) {
      sidebarOverlay.classList.add("active");
    }

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "true");
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

    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
    }

    document.body.style.overflow = "";
  }

  /* =====================================================
       USER
     ===================================================== */

  async function loadUser() {
    if (typeof getCurrentUser !== "function") {
      return;
    }

    try {
      const response = await getCurrentUser();

      const user = response?.user || response?.data || response;

      if (!user) {
        return;
      }

      const name =
        user.name || user.fullName || user.username || user.email || "User";

      const email = user.email || "Finance Account";

      if (userName) {
        userName.textContent = name;
      }

      if (userEmail) {
        userEmail.textContent = email;
      }

      if (userAvatar) {
        userAvatar.textContent = getInitials(name);
      }
    } catch (error) {
      console.warn("Could not load user.", error);
    }
  }

  function getInitials(name) {
    const parts = String(name).trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* =====================================================
       DEFAULT DATE
     ===================================================== */

  function setDefaultDate() {
    if (recurringStartDate && !recurringStartDate.value) {
      const today = new Date();

      recurringStartDate.value = today.toISOString().split("T")[0];
    }
  }

  /* =====================================================
       LOAD
     ===================================================== */

  async function loadRecurring() {
    showLoading();

    try {
      /*
       * IMPORTANT:
       * api.js already contains /api
       *
       * CORRECT:
       * apiGet("/recurring")
       *
       * RESULT:
       * http://localhost:8080/api/recurring
       */

      const response = await apiGet("/recurring");

      recurringTransactions = extractArray(response, [
        "recurringTransactions",
        "recurring",
        "data",
        "content",
      ])
        .map(normalizeRecurring)
        .filter(Boolean);

      updateSummary();

      renderRecurring();
    } catch (error) {
      console.error("Could not load recurring transactions:", error);

      recurringTransactions = [];

      updateSummary();

      if (recurringGrid) {
        recurringGrid.innerHTML = `

          <div class="loading-state">

            <i class="fa-solid fa-triangle-exclamation"></i>

            Unable to load recurring transactions.

          </div>

        `;
      }

      if (resultText) {
        resultText.textContent = "Unable to load recurring transactions";
      }
    }
  }

  /* =====================================================
       NORMALIZE
     ===================================================== */

  function normalizeRecurring(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    return {
      id:
        item.id ??
        item.recurringId ??
        item.recurringTransactionId ??
        item.recurring_id,

      name:
        item.name ?? item.title ?? item.description ?? "Recurring Transaction",

      type: normalizeType(item.type ?? item.transactionType ?? "expense"),

      category: item.category ?? item.categoryName ?? "Other",

      amount: Number(item.amount ?? 0) || 0,

      frequency: normalizeFrequency(
        item.frequency ?? item.interval ?? item.period ?? "MONTHLY",
      ),

      nextDate:
        item.nextDate ??
        item.startDate ??
        item.date ??
        item.nextPaymentDate ??
        "",

      description: item.description ?? item.notes ?? "",

      active: normalizeActive(
        item.active ?? item.isActive ?? item.enabled ?? item.status,
      ),
    };
  }

  /* =====================================================
       ARRAY
     ===================================================== */

  function extractArray(response, keys) {
    if (Array.isArray(response)) {
      return response;
    }

    if (response && typeof response === "object") {
      for (const key of keys) {
        if (Array.isArray(response[key])) {
          return response[key];
        }
      }
    }

    return [];
  }

  /* =====================================================
       NORMALIZERS
     ===================================================== */

  function normalizeType(value) {
    const type = String(value || "")
      .trim()
      .toLowerCase();

    if (type === "income" || type === "credit") {
      return "income";
    }

    return "expense";
  }

  function normalizeFrequency(value) {
    const frequency = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

    const allowed = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

    return allowed.includes(frequency) ? frequency : "MONTHLY";
  }

  function normalizeActive(value) {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value !== 0;
    }

    const text = String(value ?? "")
      .trim()
      .toLowerCase();

    if (
      text === "paused" ||
      text === "inactive" ||
      text === "disabled" ||
      text === "false"
    ) {
      return false;
    }

    return true;
  }

  /* =====================================================
       SUMMARY
     ===================================================== */

  function updateSummary() {
    const total = recurringTransactions.length;

    const active = recurringTransactions.filter((item) => item.active).length;

    const paused = total - active;

    const amount = recurringTransactions
      .filter((item) => item.active)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    if (totalRecurring) {
      totalRecurring.textContent = total;
    }

    if (activeRecurring) {
      activeRecurring.textContent = active;
    }

    if (pausedRecurring) {
      pausedRecurring.textContent = paused;
    }

    if (totalAmount) {
      totalAmount.textContent = formatCurrency(amount);
    }
  }

  /* =====================================================
       RENDER
     ===================================================== */

  function renderRecurring() {
    if (!recurringGrid) {
      return;
    }

    const search = String(searchInput?.value || "")
      .trim()
      .toLowerCase();

    const type = typeFilter?.value || "all";

    const status = statusFilter?.value || "all";

    const filtered = recurringTransactions.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        String(item.category).toLowerCase().includes(search) ||
        String(item.description).toLowerCase().includes(search);

      const matchesType = type === "all" || item.type === type;

      const matchesStatus =
        status === "all" ||
        (status === "active" && item.active) ||
        (status === "paused" && !item.active);

      return matchesSearch && matchesType && matchesStatus;
    });

    recurringGrid.innerHTML = "";

    if (recurringTransactions.length === 0) {
      recurringGrid.style.display = "none";

      emptyState?.classList.add("show");

      if (resultText) {
        resultText.textContent = "0 recurring transactions";
      }

      return;
    }

    if (filtered.length === 0) {
      recurringGrid.style.display = "none";

      emptyState?.classList.add("show");

      const heading = emptyState?.querySelector("h3");

      const paragraph = emptyState?.querySelector("p");

      if (heading) {
        heading.textContent = "No matching transactions";
      }

      if (paragraph) {
        paragraph.textContent = "Try changing your search or filters.";
      }

      if (resultText) {
        resultText.textContent = "0 matching transactions";
      }

      return;
    }

    recurringGrid.style.display = "grid";

    emptyState?.classList.remove("show");

    const heading = emptyState?.querySelector("h3");

    const paragraph = emptyState?.querySelector("p");

    if (heading) {
      heading.textContent = "No recurring transactions yet";
    }

    if (paragraph) {
      paragraph.textContent = "Add your first recurring income or expense.";
    }

    if (resultText) {
      resultText.textContent =
        filtered.length +
        (filtered.length === 1
          ? " recurring transaction"
          : " recurring transactions");
    }

    filtered.forEach((item) => {
      recurringGrid.appendChild(createCard(item));
    });
  }

  /* =====================================================
       CARD
     ===================================================== */

  function createCard(item) {
    const card = document.createElement("article");

    card.className = "recurring-card";

    const typeClass = item.type === "income" ? "income" : "expense";

    const sign = item.type === "income" ? "+" : "-";

    const statusText = item.active ? "Active" : "Paused";

    const statusClass = item.active ? "" : "paused";

    card.innerHTML = `

      <div class="recurring-top">

        <div class="recurring-icon ${typeClass}">

          <i class="fa-solid fa-repeat"></i>

        </div>

        <div class="recurring-actions">

          <button
            class="recurring-action toggle"
            type="button"
            title="${item.active ? "Pause" : "Activate"}"
          >

            <i class="fa-solid ${item.active ? "fa-pause" : "fa-play"}"></i>

          </button>

          <button
            class="recurring-action edit"
            type="button"
            title="Edit"
          >

            <i class="fa-solid fa-pen"></i>

          </button>

          <button
            class="recurring-action delete"
            type="button"
            title="Delete"
          >

            <i class="fa-solid fa-trash"></i>

          </button>

        </div>

      </div>

      <h3 class="recurring-name">

        ${escapeHtml(item.name)}

      </h3>

      <span class="recurring-category">

        ${escapeHtml(item.category)}

      </span>

      <span class="recurring-status ${statusClass}">

        ${statusText}

      </span>

      <div class="recurring-amount ${typeClass}">

        ${sign}${formatCurrency(item.amount)}

      </div>

      <div class="recurring-frequency">

        <i class="fa-solid fa-arrows-rotate"></i>

        ${formatFrequency(item.frequency)}

      </div>

      ${
        item.nextDate
          ? `

            <div class="recurring-next">

              <i class="fa-regular fa-calendar"></i>

              Next:
              ${formatDate(item.nextDate)}

            </div>

          `
          : ""
      }

      <p class="recurring-description">

        ${escapeHtml(item.description || "No description added.")}

      </p>

    `;

    card
      .querySelector(".toggle")
      ?.addEventListener("click", () => toggleRecurring(item));

    card
      .querySelector(".edit")
      ?.addEventListener("click", () => openEditModal(item));

    card
      .querySelector(".delete")
      ?.addEventListener("click", () => openConfirm(item));

    return card;
  }

  /* =====================================================
       ADD MODAL
     ===================================================== */

  function openAddModal() {
    editingId = null;

    recurringForm?.reset();

    if (recurringId) {
      recurringId.value = "";
    }

    if (recurringActive) {
      recurringActive.checked = true;
    }

    if (modalTitle) {
      modalTitle.textContent = "Add Recurring Transaction";
    }

    if (saveButton) {
      saveButton.textContent = "Save Recurring";
    }

    hideModalMessage();

    setDefaultDate();

    recurringModal?.classList.add("show");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      recurringName?.focus();
    }, 100);
  }

  /* =====================================================
       EDIT MODAL
     ===================================================== */

  function openEditModal(item) {
    editingId = item.id;

    if (recurringId) {
      recurringId.value = item.id ?? "";
    }

    if (recurringName) {
      recurringName.value = item.name ?? "";
    }

    if (recurringType) {
      recurringType.value = item.type ?? "expense";
    }

    if (recurringCategory) {
      recurringCategory.value = item.category ?? "";
    }

    if (recurringAmount) {
      recurringAmount.value = item.amount ?? 0;
    }

    if (recurringFrequency) {
      recurringFrequency.value = item.frequency ?? "MONTHLY";
    }

    if (recurringStartDate) {
      recurringStartDate.value = normalizeDateInput(item.nextDate);
    }

    if (recurringDescription) {
      recurringDescription.value = item.description ?? "";
    }

    if (recurringActive) {
      recurringActive.checked = Boolean(item.active);
    }

    if (modalTitle) {
      modalTitle.textContent = "Edit Recurring Transaction";
    }

    if (saveButton) {
      saveButton.textContent = "Update Recurring";
    }

    hideModalMessage();

    recurringModal?.classList.add("show");

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      recurringName?.focus();
    }, 100);
  }

  /* =====================================================
       CLOSE MODAL
     ===================================================== */

  function closeModal() {
    recurringModal?.classList.remove("show");

    if (!confirmOverlay?.classList.contains("show")) {
      document.body.style.overflow = "";
    }
  }

  /* =====================================================
       SUBMIT
     ===================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    const name = recurringName?.value.trim() || "";

    const type = normalizeType(recurringType?.value);

    const category = recurringCategory?.value.trim() || "";

    const amount = Number(recurringAmount?.value);

    const frequency = normalizeFrequency(recurringFrequency?.value);

    const nextDate = recurringStartDate?.value || "";

    const description = recurringDescription?.value.trim() || "";

    const active = recurringActive?.checked ?? true;

    if (!name) {
      showModalMessage("Please enter a transaction name.");

      recurringName?.focus();

      return;
    }

    if (!type) {
      showModalMessage("Please select a transaction type.");

      recurringType?.focus();

      return;
    }

    if (!category) {
      showModalMessage("Please enter a category.");

      recurringCategory?.focus();

      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showModalMessage("Please enter an amount greater than zero.");

      recurringAmount?.focus();

      return;
    }

    if (!frequency) {
      showModalMessage("Please select a frequency.");

      recurringFrequency?.focus();

      return;
    }

    if (!nextDate) {
      showModalMessage("Please select the next date.");

      recurringStartDate?.focus();

      return;
    }

    const payload = {
      name: name,

      title: name,

      type: type,

      transactionType: type,

      category: category,

      amount: amount,

      frequency: frequency,

      nextDate: nextDate,

      startDate: nextDate,

      description: description,

      active: active,

      isActive: active,
    };

    if (saveButton) {
      saveButton.disabled = true;

      saveButton.textContent = editingId ? "Updating..." : "Saving...";
    }

    try {
      if (editingId) {
        /*
         * CORRECT:
         * api.js already adds /api
         */

        await apiPut(
          "/recurring/" + encodeURIComponent(String(editingId)),
          payload,
        );

        showToast("Recurring transaction updated.");
      } else {
        /*
         * CORRECT:
         * api.js already adds /api
         */

        await apiPost("/recurring", payload);

        showToast("Recurring transaction created.");
      }

      closeModal();

      await loadRecurring();

      updateSummary();

      renderRecurring();
    } catch (error) {
      console.error("Recurring transaction save failed:", error);

      showModalMessage(getErrorMessage(error));
    } finally {
      if (saveButton) {
        saveButton.disabled = false;

        saveButton.textContent = editingId
          ? "Update Recurring"
          : "Save Recurring";
      }
    }
  }

  /* =====================================================
       TOGGLE ACTIVE / PAUSED
     ===================================================== */

  async function toggleRecurring(item) {
    if (item.id === null || item.id === undefined) {
      showToast("This recurring transaction has no ID.", "error");

      return;
    }

    const newActive = !item.active;

    try {
      const payload = {
        name: item.name,

        title: item.name,

        type: item.type,

        transactionType: item.type,

        category: item.category,

        amount: item.amount,

        frequency: item.frequency,

        nextDate: normalizeDateInput(item.nextDate),

        startDate: normalizeDateInput(item.nextDate),

        description: item.description,

        active: newActive,

        isActive: newActive,
      };

      /*
       * CORRECT UPDATE PATH
       */

      await apiPut(
        "/recurring/" + encodeURIComponent(String(item.id)),
        payload,
      );

      showToast(
        newActive
          ? "Recurring transaction activated."
          : "Recurring transaction paused.",
      );

      await loadRecurring();

      updateSummary();

      renderRecurring();
    } catch (error) {
      console.error("Could not update recurring status:", error);

      showToast(getErrorMessage(error), "error");
    }
  }

  /* =====================================================
       DELETE CONFIRM
     ===================================================== */

  function openConfirm(item) {
    deletingId = item.id;

    confirmOverlay?.classList.add("show");

    document.body.style.overflow = "hidden";
  }

  function closeConfirm() {
    confirmOverlay?.classList.remove("show");

    deletingId = null;

    if (!recurringModal?.classList.contains("show")) {
      document.body.style.overflow = "";
    }
  }

  /* =====================================================
       DELETE
     ===================================================== */

  async function deleteRecurring() {
    if (deletingId === null || deletingId === undefined) {
      return;
    }

    if (confirmDelete) {
      confirmDelete.disabled = true;

      confirmDelete.textContent = "Deleting...";
    }

    try {
      /*
       * CORRECT DELETE PATH
       *
       * api.js adds /api automatically.
       */

      await apiDelete("/recurring/" + encodeURIComponent(String(deletingId)));

      closeConfirm();

      showToast("Recurring transaction deleted.");

      await loadRecurring();

      updateSummary();

      renderRecurring();
    } catch (error) {
      console.error("Could not delete recurring transaction:", error);

      showToast(getErrorMessage(error), "error");
    } finally {
      if (confirmDelete) {
        confirmDelete.disabled = false;

        confirmDelete.textContent = "Delete";
      }
    }
  }

  /* =====================================================
       REFRESH
     ===================================================== */

  async function refreshData() {
    if (refreshButton) {
      refreshButton.disabled = true;

      refreshButton.querySelector("i")?.classList.add("fa-spin");
    }

    try {
      await loadRecurring();

      showToast("Recurring transactions refreshed.");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;

        refreshButton.querySelector("i")?.classList.remove("fa-spin");
      }
    }
  }

  /* =====================================================
       DATE
     ===================================================== */

  function normalizeDateInput(value) {
    if (!value) {
      return "";
    }

    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  /* =====================================================
       FREQUENCY
     ===================================================== */

  function formatFrequency(value) {
    const names = {
      DAILY: "Daily",

      WEEKLY: "Weekly",

      MONTHLY: "Monthly",

      YEARLY: "Yearly",
    };

    return names[value] || String(value).replace(/_/g, " ");
  }

  /* =====================================================
       CURRENCY
     ===================================================== */

  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",

      currency: "INR",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  }

  /* =====================================================
       LOADING
     ===================================================== */

  function showLoading() {
    if (!recurringGrid) {
      return;
    }

    recurringGrid.style.display = "grid";

    emptyState?.classList.remove("show");

    recurringGrid.innerHTML = `

      <div class="loading-state">

        <i class="fa-solid fa-spinner fa-spin"></i>

        Loading recurring transactions...

      </div>

    `;
  }

  /* =====================================================
       MODAL MESSAGE
     ===================================================== */

  function showModalMessage(message) {
    if (!modalMessage) {
      return;
    }

    modalMessage.textContent = message;

    modalMessage.classList.add("show");
  }

  function hideModalMessage() {
    if (!modalMessage) {
      return;
    }

    modalMessage.textContent = "";

    modalMessage.classList.remove("show");
  }

  /* =====================================================
       TOAST
     ===================================================== */

  function showToast(message, type = "success") {
    if (!toast) {
      return;
    }

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

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  /* =====================================================
       ERROR
     ===================================================== */

  function getErrorMessage(error) {
    return error?.message || "Something went wrong. Please try again.";
  }

  /* =====================================================
       ESCAPE HTML
     ===================================================== */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
});
