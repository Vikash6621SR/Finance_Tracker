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

  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");

  const applyFilter = document.getElementById("applyFilter");
  const resetFilter = document.getElementById("resetFilter");

  const totalIncome = document.getElementById("totalIncome");
  const totalExpense = document.getElementById("totalExpense");
  const netBalance = document.getElementById("netBalance");
  const transactionCount = document.getElementById("transactionCount");

  const incomeExpenseChart = document.getElementById("incomeExpenseChart");

  const netPositionValue = document.getElementById("netPositionValue");

  const netPositionText = document.getElementById("netPositionText");

  const categoryList = document.getElementById("categoryList");

  const monthlyTable = document.getElementById("monthlyTable");

  const expenseBreakdown = document.getElementById("expenseBreakdown");

  const emptyState = document.getElementById("emptyState");

  const errorState = document.getElementById("errorState");

  const errorMessage = document.getElementById("errorMessage");

  const toast = document.getElementById("toast");

  const toastIcon = document.getElementById("toastIcon");

  const toastMessage = document.getElementById("toastMessage");

  /* =====================================================
       STATE
       ===================================================== */

  let transactions = [];
  let toastTimer = null;

  /* =====================================================
       API CHECK
       ===================================================== */

  if (typeof apiGet !== "function") {
    console.error("api.js is required.");

    showToast("api.js is not loaded.", "error");

    return;
  }

  /* =====================================================
       INITIALIZE
       ===================================================== */

  init();

  async function init() {
    setupEvents();

    await loadUser();

    await loadReports();
  }

  /* =====================================================
       EVENTS
       ===================================================== */

  function setupEvents() {
    if (menuButton) {
      menuButton.addEventListener("click", openSidebar);
    }

    if (closeSidebar) {
      closeSidebar.addEventListener("click", closeSidebarMenu);
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", closeSidebarMenu);
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth > 950) {
        closeSidebarMenu();
      }
    });

    if (logoutButton) {
      logoutButton.addEventListener("click", handleLogout);
    }

    if (refreshButton) {
      refreshButton.addEventListener("click", refreshReports);
    }

    if (applyFilter) {
      applyFilter.addEventListener("click", loadReports);
    }

    if (resetFilter) {
      resetFilter.addEventListener("click", resetFilters);
    }
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
       LOAD REPORTS
       
       IMPORTANT:
       There is NO /reports API call here.

       Reports are calculated directly from:
       
       GET /api/transactions

       api.js already adds /api.
       Therefore we use:
       
       apiGet("/transactions")
       
       NOT:
       
       apiGet("/api/transactions")
       ===================================================== */

  async function loadReports() {
    hideError();

    showLoading();

    const from = startDate?.value || "";

    const to = endDate?.value || "";

    try {
      const url = buildTransactionUrl(from, to);

      console.log("Loading report data from:", url);

      const response = await apiGet(url);

      transactions = extractTransactions(response);

      transactions = transactions
        .map(normalizeTransaction)
        .filter(Boolean)
        .filter((transaction) => matchesDateFilter(transaction));

      console.log("Reports transactions loaded:", transactions);

      renderReports();
    } catch (error) {
      console.error("Reports loading failed:", error);

      transactions = [];

      clearReportData();

      showError(getErrorMessage(error));
    }
  }

  /* =====================================================
       TRANSACTION URL
       ===================================================== */

  function buildTransactionUrl(from, to) {
    const params = new URLSearchParams();

    /*
     * We don't actually need to send the dates
     * to the backend because the frontend applies
     * the date filter.
     *
     * However, sending them is okay if the backend
     * supports them.
     */

    if (from) {
      params.append("startDate", from);
    }

    if (to) {
      params.append("endDate", to);
    }

    const query = params.toString();

    /*
     * CORRECT:
     *
     * /transactions
     *
     * api.js adds:
     *
     * /api
     *
     * Final:
     *
     * http://127.0.0.1:8080/api/transactions
     */

    return "/transactions" + (query ? "?" + query : "");
  }

  /* =====================================================
       EXTRACT TRANSACTIONS
       ===================================================== */

  function extractTransactions(response) {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== "object") {
      return [];
    }

    const possibleKeys = [
      "transactions",
      "data",
      "content",
      "items",
      "results",
    ];

    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }

    return [];
  }

  /* =====================================================
       NORMALIZE TRANSACTION
       ===================================================== */

  function normalizeTransaction(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const type = normalizeType(
      item.type ?? item.transactionType ?? item.transaction_type,
    );

    const amount = Number(item.amount ?? item.value ?? 0);

    if (!Number.isFinite(amount)) {
      return null;
    }

    return {
      id: item.id ?? item.transactionId ?? item.transaction_id,

      type: type,

      amount: Math.abs(amount),

      category: String(
        item.category ?? item.categoryName ?? item.category_name ?? "Other",
      ),

      description: String(item.description ?? item.name ?? item.title ?? ""),

      date:
        item.date ??
        item.transactionDate ??
        item.transaction_date ??
        item.createdAt ??
        "",
    };
  }

  function normalizeType(value) {
    const text = String(value || "")
      .trim()
      .toLowerCase();

    if (
      text === "income" ||
      text === "credit" ||
      text === "deposit" ||
      text === "earning"
    ) {
      return "income";
    }

    return "expense";
  }

  /* =====================================================
       DATE FILTER
       ===================================================== */

  function matchesDateFilter(transaction) {
    if (!transaction.date) {
      return true;
    }

    const date = normalizeDate(transaction.date);

    if (!date) {
      return true;
    }

    const from = startDate?.value || "";

    const to = endDate?.value || "";

    if (from && date < from) {
      return false;
    }

    if (to && date > to) {
      return false;
    }

    return true;
  }

  function normalizeDate(value) {
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

  /* =====================================================
       RENDER REPORTS
       ===================================================== */

  function renderReports() {
    if (transactions.length === 0) {
      clearReportData();

      if (emptyState) {
        emptyState.classList.add("show");
      }

      return;
    }

    if (emptyState) {
      emptyState.classList.remove("show");
    }

    const income = calculateIncome();

    const expense = calculateExpense();

    const net = income - expense;

    renderSummary(income, expense, net);

    renderIncomeExpenseChart(income, expense);

    renderNetPosition(net);

    renderCategories();

    renderMonthly();

    renderBreakdown();
  }

  /* =====================================================
       SUMMARY
       ===================================================== */

  function calculateIncome() {
    return transactions
      .filter((item) => item.type === "income")
      .reduce((total, item) => total + item.amount, 0);
  }

  function calculateExpense() {
    return transactions
      .filter((item) => item.type === "expense")
      .reduce((total, item) => total + item.amount, 0);
  }

  function renderSummary(income, expense, net) {
    if (totalIncome) {
      totalIncome.textContent = formatCurrency(income);
    }

    if (totalExpense) {
      totalExpense.textContent = formatCurrency(expense);
    }

    if (netBalance) {
      netBalance.textContent = formatCurrency(net);

      netBalance.style.color = net >= 0 ? "var(--green)" : "var(--red)";
    }

    if (transactionCount) {
      transactionCount.textContent = transactions.length;
    }
  }

  /* =====================================================
       INCOME / EXPENSE CHART
       ===================================================== */

  function renderIncomeExpenseChart(income, expense) {
    if (!incomeExpenseChart) {
      return;
    }

    const max = Math.max(income, expense, 1);

    const incomeHeight = (income / max) * 100;

    const expenseHeight = (expense / max) * 100;

    incomeExpenseChart.innerHTML = `

            <div class="chart-group">

                <div class="bar-wrapper">

                    <div
                        class="chart-bar income"
                        style="height:${incomeHeight}%"
                        title="${formatCurrency(income)}"
                    ></div>

                    <span class="bar-label">
                        Income
                    </span>

                </div>

                <div class="bar-wrapper">

                    <div
                        class="chart-bar expense"
                        style="height:${expenseHeight}%"
                        title="${formatCurrency(expense)}"
                    ></div>

                    <span class="bar-label">
                        Expense
                    </span>

                </div>

            </div>

        `;
  }

  /* =====================================================
       NET POSITION
       ===================================================== */

  function renderNetPosition(net) {
    if (netPositionValue) {
      netPositionValue.textContent = formatCurrency(net);

      netPositionValue.classList.remove("positive", "negative");

      if (net > 0) {
        netPositionValue.classList.add("positive");
      } else if (net < 0) {
        netPositionValue.classList.add("negative");
      }
    }

    if (!netPositionText) {
      return;
    }

    if (net > 0) {
      netPositionText.textContent =
        "Your income is greater than your expenses for the selected period.";
    } else if (net < 0) {
      netPositionText.textContent =
        "Your expenses are greater than your income for the selected period.";
    } else {
      netPositionText.textContent =
        "Income and expenses are equal for the selected period.";
    }
  }

  /* =====================================================
       CATEGORY REPORT
       ===================================================== */

  function getCategoryTotals() {
    const totals = {};

    transactions
      .filter((item) => item.type === "expense")
      .forEach((item) => {
        const category = item.category || "Other";

        if (!totals[category]) {
          totals[category] = 0;
        }

        totals[category] += item.amount;
      });

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }

  function renderCategories() {
    if (!categoryList) {
      return;
    }

    const categories = getCategoryTotals();

    if (categories.length === 0) {
      categoryList.innerHTML = `

                <div class="chart-loading">
                    No expense categories available.
                </div>

            `;

      return;
    }

    const total = categories.reduce((sum, item) => sum + item[1], 0);

    categoryList.innerHTML = "";

    categories.slice(0, 6).forEach(([category, amount]) => {
      const percentage = total > 0 ? (amount / total) * 100 : 0;

      const row = document.createElement("div");

      row.className = "category-row";

      row.innerHTML = `

                        <div>

                            <div class="category-info">

                                <span class="category-name">
                                    ${escapeHtml(category)}
                                </span>

                                <span class="category-value">
                                    ${formatCurrency(amount)}
                                </span>

                            </div>

                            <div class="category-track">

                                <div
                                    class="category-bar"
                                    style="width:${percentage}%"
                                ></div>

                            </div>

                        </div>

                    `;

      categoryList.appendChild(row);
    });
  }

  /* =====================================================
       MONTHLY REPORT
       ===================================================== */

  function renderMonthly() {
    if (!monthlyTable) {
      return;
    }

    const monthly = getMonthlyTotals();

    const entries = Object.entries(monthly)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6);

    if (entries.length === 0) {
      monthlyTable.innerHTML = `

                <div class="chart-loading">
                    No monthly data available.
                </div>

            `;

      return;
    }

    let html = `

            <table>

                <thead>

                    <tr>

                        <th>MONTH</th>
                        <th>INCOME</th>
                        <th>EXPENSE</th>
                        <th>NET</th>

                    </tr>

                </thead>

                <tbody>

        `;

    entries.forEach(([month, values]) => {
      const net = values.income - values.expense;

      html += `

                    <tr>

                        <td>
                            ${formatMonth(month)}
                        </td>

                        <td class="income-text">
                            ${formatCurrency(values.income)}
                        </td>

                        <td class="expense-text">
                            ${formatCurrency(values.expense)}
                        </td>

                        <td
                            class="net-text-table"
                            style="color:${
                              net >= 0 ? "var(--green)" : "var(--red)"
                            }"
                        >
                            ${formatCurrency(net)}
                        </td>

                    </tr>

                `;
    });

    html += `

                </tbody>

            </table>

        `;

    monthlyTable.innerHTML = html;
  }

  function getMonthlyTotals() {
    const monthly = {};

    transactions.forEach((item) => {
      const date = normalizeDate(item.date);

      if (!date) {
        return;
      }

      const month = date.substring(0, 7);

      if (!monthly[month]) {
        monthly[month] = {
          income: 0,
          expense: 0,
        };
      }

      if (item.type === "income") {
        monthly[month].income += item.amount;
      } else {
        monthly[month].expense += item.amount;
      }
    });

    return monthly;
  }

  function formatMonth(value) {
    const parts = value.split("-");

    if (parts.length !== 2) {
      return value;
    }

    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);

    return new Intl.DateTimeFormat("en-IN", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  /* =====================================================
       EXPENSE BREAKDOWN
       ===================================================== */

  function renderBreakdown() {
    if (!expenseBreakdown) {
      return;
    }

    const categories = getCategoryTotals();

    if (categories.length === 0) {
      expenseBreakdown.innerHTML = `

                <div class="chart-loading">
                    No expense data available.
                </div>

            `;

      return;
    }

    const total = categories.reduce((sum, item) => sum + item[1], 0);

    expenseBreakdown.innerHTML = "";

    categories.slice(0, 8).forEach(([category, amount]) => {
      const percentage = total > 0 ? (amount / total) * 100 : 0;

      const item = document.createElement("div");

      item.className = "breakdown-item";

      item.innerHTML = `

                        <h4>
                            ${escapeHtml(category)}
                        </h4>

                        <strong>
                            ${formatCurrency(amount)}
                        </strong>

                        <span>
                            ${percentage.toFixed(1)}% of expenses
                        </span>

                    `;

      expenseBreakdown.appendChild(item);
    });
  }

  /* =====================================================
       CLEAR REPORT DATA
       ===================================================== */

  function clearReportData() {
    if (totalIncome) {
      totalIncome.textContent = "₹0.00";
    }

    if (totalExpense) {
      totalExpense.textContent = "₹0.00";
    }

    if (netBalance) {
      netBalance.textContent = "₹0.00";
    }

    if (transactionCount) {
      transactionCount.textContent = "0";
    }

    if (incomeExpenseChart) {
      incomeExpenseChart.innerHTML = `

                <div class="chart-loading">
                    No data available.
                </div>

            `;
    }

    if (netPositionValue) {
      netPositionValue.textContent = "₹0.00";

      netPositionValue.classList.remove("positive", "negative");
    }

    if (netPositionText) {
      netPositionText.textContent = "No financial activity yet.";
    }

    if (categoryList) {
      categoryList.innerHTML = `

                <div class="chart-loading">
                    No category data available.
                </div>

            `;
    }

    if (monthlyTable) {
      monthlyTable.innerHTML = `

                <div class="chart-loading">
                    No monthly data available.
                </div>

            `;
    }

    if (expenseBreakdown) {
      expenseBreakdown.innerHTML = `

                <div class="chart-loading">
                    No expense data available.
                </div>

            `;
    }
  }

  /* =====================================================
       LOADING
       ===================================================== */

  function showLoading() {
    if (emptyState) {
      emptyState.classList.remove("show");
    }

    if (incomeExpenseChart) {
      incomeExpenseChart.innerHTML = `

                <div class="chart-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading...

                </div>

            `;
    }

    if (categoryList) {
      categoryList.innerHTML = `

                <div class="chart-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading...

                </div>

            `;
    }

    if (monthlyTable) {
      monthlyTable.innerHTML = `

                <div class="chart-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading...

                </div>

            `;
    }

    if (expenseBreakdown) {
      expenseBreakdown.innerHTML = `

                <div class="chart-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading...

                </div>

            `;
    }
  }

  /* =====================================================
       RESET FILTER
       ===================================================== */

  function resetFilters() {
    if (startDate) {
      startDate.value = "";
    }

    if (endDate) {
      endDate.value = "";
    }

    loadReports();
  }

  /* =====================================================
       REFRESH
       ===================================================== */

  async function refreshReports() {
    if (refreshButton) {
      refreshButton.disabled = true;

      refreshButton.querySelector("i")?.classList.add("fa-spin");
    }

    try {
      await loadReports();

      showToast("Reports refreshed.");
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
       ERROR
       ===================================================== */

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
    }

    if (errorState) {
      errorState.classList.add("show");
    }
  }

  function hideError() {
    if (errorState) {
      errorState.classList.remove("show");
    }
  }

  function getErrorMessage(error) {
    return error?.message || "Unable to load report data.";
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
