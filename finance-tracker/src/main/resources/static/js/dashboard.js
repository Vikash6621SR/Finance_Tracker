/* =========================================================
   FINANCE TRACKER
   DASHBOARD.JS
   CLEAN NO-FLICKER VERSION
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentUser = null;

let transactions = [];

let selectedPeriod = 30;

let incomeExpenseChart = null;

let expenseCategoryChart = null;

let toastTimer = null;

let dashboardStarted = false;

/* =========================================================
   SINGLE PAGE STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", initializeDashboard, {
  once: true,
});

/* =========================================================
   INITIALIZE DASHBOARD
   ========================================================= */

async function initializeDashboard() {
  if (dashboardStarted) {
    return;
  }

  dashboardStarted = true;

  try {
    /*
     * Authentication is checked BEFORE
     * the dashboard becomes visible.
     */

    const authenticated = await checkAuthentication();

    if (!authenticated) {
      return;
    }

    /*
     * Set up dashboard controls.
     */

    setupSidebar();

    setupPeriodSelector();

    setupLogout();

    setupNotification();

    updateDate();

    /*
     * Load real backend data.
     */

    await loadDashboardData();

    /*
     * Everything is ready.
     *
     * Remove loading state WITHOUT
     * any fade animation.
     */

    document.documentElement.classList.remove("dashboard-loading");

    document.documentElement.classList.add("dashboard-ready");

    hideDashboardLoader();
  } catch (error) {
    console.error("Dashboard initialization error:", error);

    /*
     * Do not create fake financial data.
     */

    transactions = [];

    renderDashboard();

    document.documentElement.classList.remove("dashboard-loading");

    document.documentElement.classList.add("dashboard-ready");

    hideDashboardLoader();

    showToast(getErrorMessage(error), "error");
  }
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

async function checkAuthentication() {
  try {
    const response = await FinanceAPI.auth.me();

    /*
     * No valid backend session.
     */

    if (!response || !response.success || !response.user) {
      redirectToLogin();

      return false;
    }

    currentUser = response.user;

    displayUser(currentUser);

    return true;
  } catch (error) {
    console.error("Authentication check failed:", error);

    /*
     * If the backend explicitly reports
     * unauthorized, go to login.
     */

    if (error && (error.status === 401 || error.status === 403)) {
      redirectToLogin();

      return false;
    }

    /*
     * For network/server errors, keep
     * the dashboard available instead
     * of creating a redirect loop.
     */

    showToast(getErrorMessage(error), "error");

    return false;
  }
}

/* =========================================================
   REDIRECT TO LOGIN
   ========================================================= */

function redirectToLogin() {
  /*
   * Avoid redirecting if already on login.
   */

  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  if (currentPage === "login.html") {
    return;
  }

  window.location.replace("login.html");
}

/* =========================================================
   USER DISPLAY
   ========================================================= */

function displayUser(user) {
  if (!user) {
    return;
  }

  const name = user.name || user.fullName || user.username || "User";

  const email = user.email || "";

  setText("userName", name);

  setText("userEmail", email);

  setText("welcomeName", getFirstName(name));

  setText("userAvatar", getInitials(name));

  setText("sidebarUserName", name);

  setText("topbarUserName", name);

  setText("sidebarUserInitial", getInitials(name));

  setText("topbarUserInitial", getInitials(name));
}

/* =========================================================
   LOAD DASHBOARD DATA
   ========================================================= */

async function loadDashboardData() {
  try {
    const response = await FinanceAPI.transactions.getAll();

    transactions = normalizeTransactions(response);

    renderDashboard();
  } catch (error) {
    console.error("Transaction loading error:", error);

    /*
     * Session expired.
     */

    if (error && (error.status === 401 || error.status === 403)) {
      redirectToLogin();

      return;
    }

    /*
     * No fake data.
     */

    transactions = [];

    renderDashboard();

    showToast(getErrorMessage(error), "error");
  }
}

/* =========================================================
   NORMALIZE API RESPONSE
   ========================================================= */

function normalizeTransactions(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && Array.isArray(response.data)) {
    return response.data;
  }

  if (response && Array.isArray(response.transactions)) {
    return response.transactions;
  }

  if (response && Array.isArray(response.content)) {
    return response.content;
  }

  return [];
}

/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {
  const currentRange = getPeriodRange(selectedPeriod);

  const previousRange = getPreviousPeriodRange(selectedPeriod);

  const currentTransactions = filterTransactions(
    transactions,
    currentRange.start,
    currentRange.end,
  );

  const previousTransactions = filterTransactions(
    transactions,
    previousRange.start,
    previousRange.end,
  );

  const currentSummary = calculateSummary(currentTransactions);

  const previousSummary = calculateSummary(previousTransactions);

  updateSummaryCards(currentSummary, previousSummary);

  renderIncomeExpenseChart(currentTransactions, currentRange);

  renderExpenseCategoryChart(currentTransactions);

  renderRecentTransactions(currentTransactions);
}

/* =========================================================
   SUMMARY
   ========================================================= */

function calculateSummary(data) {
  let income = 0;

  let expense = 0;

  data.forEach(function (transaction) {
    const amount = Math.abs(Number(transaction.amount) || 0);

    const type = String(transaction.type || "")
      .trim()
      .toLowerCase();

    if (type === "income" || type === "credit" || type === "cr") {
      income += amount;
    }

    if (type === "expense" || type === "debit" || type === "dr") {
      expense += amount;
    }
  });

  const savings = income - expense;

  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  return {
    income: roundMoney(income),

    expense: roundMoney(expense),

    savings: roundMoney(savings),

    savingsRate: roundMoney(savingsRate),
  };
}

/* =========================================================
   SUMMARY CARDS
   ========================================================= */

function updateSummaryCards(current, previous) {
  setText("totalIncome", formatCurrency(current.income));

  setText("totalExpense", formatCurrency(current.expense));

  setText("netSavings", formatCurrency(current.savings));

  setText("savingsRate", `${formatNumber(current.savingsRate)}%`);

  updateChange("incomeChange", current.income, previous.income, false);

  updateChange("expenseChange", current.expense, previous.expense, true);

  updateChange("savingsChange", current.savings, previous.savings, false);

  updateRateChange(current.savingsRate, previous.savingsRate);
}

/* =========================================================
   CHANGE INDICATOR
   ========================================================= */

function updateChange(id, current, previous, reverse) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  if (previous === 0) {
    if (current === 0) {
      element.textContent = "—";

      element.className = "change neutral";
    } else {
      element.textContent = "New";

      element.className = reverse ? "change negative" : "change positive";
    }

    return;
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;

  const sign = change > 0 ? "+" : "";

  element.textContent = `${sign}${formatNumber(change)}%`;

  if (change === 0) {
    element.className = "change neutral";

    return;
  }

  const positive = reverse ? change < 0 : change > 0;

  element.className = positive ? "change positive" : "change negative";
}

/* =========================================================
   SAVINGS RATE CHANGE
   ========================================================= */

function updateRateChange(current, previous) {
  const element = document.getElementById("rateChange");

  if (!element) {
    return;
  }

  const difference = current - previous;

  if (difference === 0) {
    element.textContent = "—";

    element.className = "change neutral";

    return;
  }

  const sign = difference > 0 ? "+" : "";

  element.textContent = `${sign}${formatNumber(difference)} pts`;

  element.className = difference > 0 ? "change positive" : "change negative";
}

/* =========================================================
   INCOME / EXPENSE CHART
   ========================================================= */

function renderIncomeExpenseChart(data, range) {
  const canvas = document.getElementById("incomeExpenseChart");

  const empty = document.getElementById("incomeExpenseEmpty");

  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  destroyIncomeExpenseChart();

  if (data.length === 0) {
    if (empty) {
      empty.classList.remove("hidden");
    }

    return;
  }

  if (empty) {
    empty.classList.add("hidden");
  }

  const chartData = createChartData(data, range);

  incomeExpenseChart = new Chart(canvas, {
    type: "line",

    data: {
      labels: chartData.labels,

      datasets: [
        {
          label: "Income",

          data: chartData.income,

          borderColor: "#16a34a",

          backgroundColor: "rgba(22, 163, 74, 0.08)",

          borderWidth: 2,

          tension: 0.35,

          fill: true,

          pointRadius: 2,

          pointHoverRadius: 4,
        },

        {
          label: "Expenses",

          data: chartData.expenses,

          borderColor: "#dc2626",

          backgroundColor: "rgba(220, 38, 38, 0.06)",

          borderWidth: 2,

          tension: 0.35,

          fill: true,

          pointRadius: 2,

          pointHoverRadius: 4,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      animation: false,

      interaction: {
        mode: "index",

        intersect: false,
      },

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            boxWidth: 8,

            boxHeight: 8,

            padding: 14,

            font: {
              size: 9,
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },

          ticks: {
            maxTicksLimit: 7,

            color: "#9ca3af",

            font: {
              size: 8,
            },
          },
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "#f0f3f1",
          },

          ticks: {
            color: "#9ca3af",

            font: {
              size: 8,
            },

            callback: function (value) {
              return formatCompactCurrency(value);
            },
          },
        },
      },
    },
  });
}

/* =========================================================
   CREATE CHART DATA
   ========================================================= */

function createChartData(data, range) {
  const labels = [];

  const income = [];

  const expenses = [];

  const cursor = new Date(range.start);

  while (cursor <= range.end) {
    const current = new Date(cursor);

    let incomeTotal = 0;

    let expenseTotal = 0;

    data.forEach(function (transaction) {
      const date = getTransactionDate(transaction);

      if (!date) {
        return;
      }

      if (date.getFullYear() !== current.getFullYear()) {
        return;
      }

      if (date.getMonth() !== current.getMonth()) {
        return;
      }

      if (date.getDate() !== current.getDate()) {
        return;
      }

      const amount = Math.abs(Number(transaction.amount) || 0);

      const type = getTransactionType(transaction);

      if (type === "income" || type === "credit" || type === "cr") {
        incomeTotal += amount;
      }

      if (type === "expense" || type === "debit" || type === "dr") {
        expenseTotal += amount;
      }
    });

    labels.push(
      current.toLocaleDateString("en-IN", {
        day: "numeric",

        month: "short",
      }),
    );

    income.push(roundMoney(incomeTotal));

    expenses.push(roundMoney(expenseTotal));

    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    labels,

    income,

    expenses,
  };
}

/* =========================================================
   EXPENSE CATEGORY CHART
   ========================================================= */

function renderExpenseCategoryChart(data) {
  const canvas = document.getElementById("expenseCategoryChart");

  const empty = document.getElementById("expenseCategoryEmpty");

  const list = document.getElementById("categoryList");

  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  destroyExpenseCategoryChart();

  const categories = {};

  data.forEach(function (transaction) {
    const type = getTransactionType(transaction);

    if (type !== "expense" && type !== "debit" && type !== "dr") {
      return;
    }

    const category = transaction.category || "Other";

    const amount = Math.abs(Number(transaction.amount) || 0);

    categories[category] = (categories[category] || 0) + amount;
  });

  const entries = Object.entries(categories).sort(function (a, b) {
    return b[1] - a[1];
  });

  if (entries.length === 0) {
    if (empty) {
      empty.classList.remove("hidden");
    }

    if (list) {
      list.innerHTML = "";
    }

    return;
  }

  if (empty) {
    empty.classList.add("hidden");
  }

  const labels = entries.map(function (item) {
    return formatCategoryName(item[0]);
  });

  const values = entries.map(function (item) {
    return roundMoney(item[1]);
  });

  const colors = [
    "#16a34a",

    "#2563eb",

    "#ea580c",

    "#7c3aed",

    "#0891b2",

    "#db2777",

    "#ca8a04",

    "#64748b",
  ];

  expenseCategoryChart = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels,

      datasets: [
        {
          data: values,

          backgroundColor: colors.slice(0, values.length),

          borderWidth: 0,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      animation: false,

      cutout: "68%",

      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  renderCategoryList(entries, colors);
}

/* =========================================================
   RECENT TRANSACTIONS
   ========================================================= */

function renderRecentTransactions(data) {
  const container = document.getElementById("recentTransactions");

  if (!container) {
    return;
  }

  const recent = [...data]
    .sort(function (a, b) {
      const first = getTransactionDate(a);

      const second = getTransactionDate(b);

      if (!first) {
        return 1;
      }

      if (!second) {
        return -1;
      }

      return second - first;
    })
    .slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `

            <div class="empty-transactions">

                <span>

                    <i
                        class="fa-solid fa-receipt"
                    ></i>

                </span>


                <strong>
                    No transactions yet
                </strong>


                <small>
                    Add your first transaction
                    to see it here.
                </small>

            </div>

        `;

    return;
  }

  container.innerHTML = "";

  recent.forEach(function (transaction) {
    const type = getTransactionType(transaction);

    const income = type === "income" || type === "credit" || type === "cr";

    const title =
      transaction.title ||
      transaction.name ||
      transaction.description ||
      "Transaction";

    const category = formatCategoryName(transaction.category || "Other");

    const date = formatDisplayDate(transaction);

    const amount = Math.abs(Number(transaction.amount) || 0);

    const item = document.createElement("div");

    item.className = "transaction-item";

    item.innerHTML = `

                <span
                    class="transaction-icon ${income ? "income" : "expense"}"
                >

                    <i
                        class="fa-solid ${
                          income ? "fa-arrow-down" : "fa-arrow-up"
                        }"
                    ></i>

                </span>


                <div
                    class="transaction-info"
                >

                    <strong>
                        ${escapeHtml(title)}
                    </strong>


                    <small>
                        ${escapeHtml(category)}
                        ·
                        ${escapeHtml(date)}
                    </small>

                </div>


                <span
                    class="transaction-amount ${income ? "income" : "expense"}"
                >

                    ${income ? "+" : "-"}

                    ${formatCurrency(amount)}

                </span>

            `;

    container.appendChild(item);
  });
}

/* =========================================================
   CATEGORY LIST
   ========================================================= */

function renderCategoryList(entries, colors) {
  const list = document.getElementById("categoryList");

  if (!list) {
    return;
  }

  const total = entries.reduce(function (sum, item) {
    return sum + item[1];
  }, 0);

  list.innerHTML = "";

  entries.slice(0, 5).forEach(function (item, index) {
    const percentage = total > 0 ? (item[1] / total) * 100 : 0;

    const row = document.createElement("div");

    row.className = "category-item";

    row.innerHTML = `

                    <div
                        class="category-item-left"
                    >

                        <span
                            class="category-dot"
                            style="
                                background:
                                ${colors[index % colors.length]};
                            "
                        ></span>


                        <span
                            class="category-name"
                        >
                            ${escapeHtml(formatCategoryName(item[0]))}
                        </span>

                    </div>


                    <span
                        class="category-amount"
                    >

                        ${formatCurrency(item[1])}

                        ·

                        ${formatNumber(percentage)}%

                    </span>

                `;

    list.appendChild(row);
  });
}

/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {
  const sidebar = document.getElementById("sidebar");

  const overlay = document.getElementById("sidebarOverlay");

  const menuButton = document.getElementById("menuButton");

  const closeButton = document.getElementById("closeSidebar");

  menuButton?.addEventListener("click", function () {
    sidebar?.classList.add("open");

    overlay?.classList.add("active");

    document.body.style.overflow = "hidden";
  });

  closeButton?.addEventListener("click", closeSidebar);

  overlay?.addEventListener("click", closeSidebar);

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", closeSidebar);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}

/* =========================================================
   CLOSE SIDEBAR
   ========================================================= */

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");

  document.getElementById("sidebarOverlay")?.classList.remove("active");

  document.body.style.overflow = "";
}

/* =========================================================
   PERIOD SELECTOR
   ========================================================= */

function setupPeriodSelector() {
  const select = document.getElementById("periodSelect");

  if (!select) {
    return;
  }

  selectedPeriod = Number(select.value) || 30;

  select.addEventListener("change", function () {
    selectedPeriod = Number(this.value) || 30;

    renderDashboard();
  });
}

/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {
  const button = document.getElementById("logoutButton");

  if (!button) {
    return;
  }

  button.addEventListener("click", async function () {
    const confirmed = window.confirm("Are you sure you want to sign out?");

    if (!confirmed) {
      return;
    }

    button.disabled = true;

    try {
      await FinanceAPI.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    /*
     * Do not delete transactions,
     * budgets, accounts or savings.
     */

    localStorage.removeItem("financeTrackerUser");

    localStorage.removeItem("financeTrackerRememberedEmail");

    window.location.replace("login.html");
  });
}

/* =========================================================
   NOTIFICATION
   ========================================================= */

function setupNotification() {
  const button = document.getElementById("notificationButton");

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    showToast("No new notifications.");
  });
}

/* =========================================================
   DATE
   ========================================================= */

function updateDate() {
  const element = document.getElementById("currentDate");

  if (!element) {
    return;
  }

  const now = new Date();

  element.textContent = now.toLocaleDateString("en-IN", {
    weekday: "long",

    day: "numeric",

    month: "long",

    year: "numeric",
  });
}

/* =========================================================
   DATE RANGE
   ========================================================= */

function getPeriodRange(days) {
  const end = new Date();

  end.setHours(23, 59, 59, 999);

  const start = new Date(end);

  start.setDate(start.getDate() - days + 1);

  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
}

/* =========================================================
   PREVIOUS PERIOD
   ========================================================= */

function getPreviousPeriodRange(days) {
  const current = getPeriodRange(days);

  const end = new Date(current.start);

  end.setDate(end.getDate() - 1);

  end.setHours(23, 59, 59, 999);

  const start = new Date(end);

  start.setDate(start.getDate() - days + 1);

  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
}

/* =========================================================
   FILTER
   ========================================================= */

function filterTransactions(data, start, end) {
  return data.filter(function (transaction) {
    const date = getTransactionDate(transaction);

    if (!date) {
      return false;
    }

    return date >= start && date <= end;
  });
}

/* =========================================================
   TRANSACTION DATE
   ========================================================= */

function getTransactionDate(transaction) {
  if (!transaction) {
    return null;
  }

  const value =
    transaction.transactionDate || transaction.date || transaction.createdAt;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* =========================================================
   TRANSACTION TYPE
   ========================================================= */

function getTransactionType(transaction) {
  return String(transaction?.type || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDisplayDate(transaction) {
  const date = getTransactionDate(transaction);

  if (!date) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
}

/* =========================================================
   CURRENCY
   ========================================================= */

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    minimumFractionDigits: 2,

    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

/* =========================================================
   COMPACT CURRENCY
   ========================================================= */

function formatCompactCurrency(amount) {
  const value = Number(amount) || 0;

  if (Math.abs(value) >= 10000000) {
    return "₹" + (value / 10000000).toFixed(1) + "Cr";
  }

  if (Math.abs(value) >= 100000) {
    return "₹" + (value / 100000).toFixed(1) + "L";
  }

  if (Math.abs(value) >= 1000) {
    return "₹" + (value / 1000).toFixed(1) + "K";
  }

  return formatCurrency(value);
}

/* =========================================================
   CATEGORY
   ========================================================= */

function formatCategoryName(value) {
  return String(value || "Other")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, function (letter) {
      return letter.toUpperCase();
    });
}

/* =========================================================
   FIRST NAME
   ========================================================= */

function getFirstName(name) {
  return String(name || "User")
    .trim()
    .split(/\s+/)[0];
}

/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {
  const parts = String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* =========================================================
   BASIC TEXT
   ========================================================= */

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? "";
  }
}

/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(value) {
  return (Number(value) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,

    maximumFractionDigits: 2,
  });
}

/* =========================================================
   ROUND MONEY
   ========================================================= */

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   ERROR MESSAGE
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

  return "Unable to load dashboard.";
}

/* =========================================================
   HIDE LOADER
   ========================================================= */

function hideDashboardLoader() {
  const loader = document.getElementById("dashboardLoader");

  if (!loader) {
    return;
  }

  /*
   * No animation.
   * No timeout.
   */

  loader.style.display = "none";

  loader.style.visibility = "hidden";

  loader.style.opacity = "0";
}

/* =========================================================
   DESTROY INCOME CHART
   ========================================================= */

function destroyIncomeExpenseChart() {
  if (incomeExpenseChart) {
    incomeExpenseChart.destroy();

    incomeExpenseChart = null;
  }
}

/* =========================================================
   DESTROY CATEGORY CHART
   ========================================================= */

function destroyExpenseCategoryChart() {
  if (expenseCategoryChart) {
    expenseCategoryChart.destroy();

    expenseCategoryChart = null;
  }
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message, type = "success") {
  const toast = document.getElementById("dashboardToast");

  const messageElement = document.getElementById("dashboardToastMessage");

  if (!toast || !messageElement) {
    return;
  }

  messageElement.textContent = message;

  toast.classList.add("show");

  if (type === "error") {
    toast.style.borderColor = "#fecaca";

    toast.style.color = "#991b1b";
  }

  clearTimeout(toastTimer);

  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}
