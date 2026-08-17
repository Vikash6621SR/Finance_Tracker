/* =========================================================
   FINANCE TRACKER
   CENTRAL API CLIENT
   ========================================================= */

"use strict";

/* =========================================================
   API CONFIGURATION
   ========================================================= */

/*
    Frontend:

        http://127.0.0.1:5500
    or
        http://localhost:5500


    Backend:

        http://127.0.0.1:8080
    or
        http://localhost:8080


    The backend uses HTTP SESSION authentication.
    Therefore every request MUST use:

        credentials: "include"
*/

const API_BASE_URL =
    "https://financetracker-production-3fe4.up.railway.app/api";


/* =========================================================
   BASIC REQUEST FUNCTION
   ========================================================= */

async function apiRequest(endpoint, options = {}) {
  const config = {
    method: options.method || "GET",

    headers: {
      "Content-Type": "application/json",

      ...(options.headers || {}),
    },

    /*
            IMPORTANT:
            Sends JSESSIONID to Spring Boot.
        */

    credentials: "include",
  };

  /* =====================================================
       REQUEST BODY
    ===================================================== */

  if (options.body !== undefined && options.body !== null) {
    config.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  /* =====================================================
       SEND REQUEST
    ===================================================== */

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    console.error("Finance Tracker API connection error:", error);

    const connectionError = new Error(
      "Unable to connect to the Finance Tracker server. " +
        "Make sure the Spring Boot backend is running on port 8080.",
    );

    connectionError.status = 0;

    connectionError.data = null;

    throw connectionError;
  }

  /* =====================================================
       READ RESPONSE
    ===================================================== */

  let data = null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
  } else {
    try {
      const text = await response.text();

      data = text ? text : null;
    } catch (error) {
      data = null;
    }
  }

  /* =====================================================
       HANDLE HTTP ERRORS
    ===================================================== */

  if (!response.ok) {
    let message = "Something went wrong.";

    /* -------------------------------------------------
           JSON error response
        ------------------------------------------------- */

    if (data && typeof data === "object") {
      message =
        data.message ||
        data.error ||
        data.detail ||
        `Request failed with status ${response.status}`;
    } else if (typeof data === "string" && data.trim()) {
      /* -------------------------------------------------
           Plain text error response
        ------------------------------------------------- */
      message = data;
    }

    /* -------------------------------------------------
           400
        ------------------------------------------------- */

    if (response.status === 400) {
      message = data?.message || "The request was invalid.";
    }

    /* -------------------------------------------------
           401
        ------------------------------------------------- */

    if (response.status === 401) {
      message =
        data?.message || "Your session has expired. Please login again.";
    }

    /* -------------------------------------------------
           403
        ------------------------------------------------- */

    if (response.status === 403) {
      message =
        data?.message || "You are not authorized to perform this action.";
    }

    /* -------------------------------------------------
           404
        ------------------------------------------------- */

    if (response.status === 404) {
      message = data?.message || "The requested resource was not found.";
    }

    /* -------------------------------------------------
           409
        ------------------------------------------------- */

    if (response.status === 409) {
      message = data?.message || "This information already exists.";
    }

    /* -------------------------------------------------
           500
        ------------------------------------------------- */

    if (response.status >= 500) {
      message = data?.message || "A server error occurred. Please try again.";
    }

    /*
            IMPORTANT:

            Preserve the HTTP status.

            Other pages will use:

                error.status === 401

            or:

                error.status === 403
        */

    const apiError = new Error(message);

    apiError.status = response.status;

    apiError.data = data;

    apiError.response = response;

    throw apiError;
  }

  /* =====================================================
       SUCCESS
    ===================================================== */

  return data;
}

/* =========================================================
   GET
   ========================================================= */

async function apiGet(endpoint) {
  return apiRequest(endpoint, {
    method: "GET",
  });
}

/* =========================================================
   POST
   ========================================================= */

async function apiPost(endpoint, body = null) {
  return apiRequest(endpoint, {
    method: "POST",
    body,
  });
}

/* =========================================================
   PUT
   ========================================================= */

async function apiPut(endpoint, body = null) {
  return apiRequest(endpoint, {
    method: "PUT",
    body,
  });
}

/* =========================================================
   DELETE
   ========================================================= */

async function apiDelete(endpoint) {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
}

/* =========================================================
   AUTHENTICATION API
   ========================================================= */

const AuthAPI = {
  /* -----------------------------------------------------
       Check first-time setup
    ----------------------------------------------------- */

  setupStatus() {
    return apiGet("/auth/setup-status");
  },

  /* -----------------------------------------------------
       REGISTER
    ----------------------------------------------------- */

  setup(data) {
    return apiPost("/auth/setup", data);
  },

  /* -----------------------------------------------------
       LOGIN
    ----------------------------------------------------- */

  login(email, password) {
    return apiPost("/auth/login", {
      email,
      password,
    });
  },

  /* -----------------------------------------------------
       LOGOUT
    ----------------------------------------------------- */

  logout() {
    return apiPost("/auth/logout");
  },

  /* -----------------------------------------------------
       CURRENT USER
    ----------------------------------------------------- */

  me() {
    return apiGet("/auth/me");
  },

  /* -----------------------------------------------------
       UPDATE PROFILE
    ----------------------------------------------------- */

  updateProfile(data) {
    return apiPut("/auth/profile", data);
  },

  /* -----------------------------------------------------
       CHANGE PASSWORD
    ----------------------------------------------------- */

  changePassword(currentPassword, newPassword) {
    return apiPost("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },

  /* -----------------------------------------------------
       DEVELOPMENT PASSWORD RESET
    ----------------------------------------------------- */

  developmentResetPassword(newPassword) {
    return apiPost("/auth/dev-reset-password", {
      newPassword,
    });
  },
};

/* =========================================================
   ACCOUNTS API
   ========================================================= */

const AccountsAPI = {
  /* -----------------------------------------------------
       GET ALL
    ----------------------------------------------------- */

  getAll() {
    return apiGet("/accounts");
  },

  /* -----------------------------------------------------
       GET ACTIVE
    ----------------------------------------------------- */

  getActive() {
    return apiGet("/accounts/active");
  },

  /* -----------------------------------------------------
       GET BY ID
    ----------------------------------------------------- */

  getById(id) {
    return apiGet(`/accounts/${id}`);
  },

  /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

  create(data) {
    return apiPost("/accounts", data);
  },

  /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

  update(id, data) {
    return apiPut(`/accounts/${id}`, data);
  },

  /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

  delete(id) {
    return apiDelete(`/accounts/${id}`);
  },
};

/* =========================================================
   TRANSACTIONS API
   ========================================================= */

const TransactionsAPI = {
  /* -----------------------------------------------------
       GET ALL
    ----------------------------------------------------- */

  getAll() {
    return apiGet("/transactions");
  },

  /* -----------------------------------------------------
       GET BY ID
    ----------------------------------------------------- */

  getById(id) {
    return apiGet(`/transactions/${id}`);
  },

  /* -----------------------------------------------------
       GET BY ACCOUNT
    ----------------------------------------------------- */

  getByAccount(accountId) {
    return apiGet(`/transactions/account/${accountId}`);
  },

  /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

  create(data) {
    return apiPost("/transactions", data);
  },

  /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

  update(id, data) {
    return apiPut(`/transactions/${id}`, data);
  },

  /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

  delete(id) {
    return apiDelete(`/transactions/${id}`);
  },
};

/* =========================================================
   BUDGET API
   ========================================================= */

const BudgetsAPI = {
  /* -----------------------------------------------------
       GET ALL
    ----------------------------------------------------- */

  getAll() {
    return apiGet("/budgets");
  },

  /* -----------------------------------------------------
       GET ACTIVE
    ----------------------------------------------------- */

  getActive() {
    return apiGet("/budgets/active");
  },

  /* -----------------------------------------------------
       GET BY ID
    ----------------------------------------------------- */

  getById(id) {
    return apiGet(`/budgets/${id}`);
  },

  /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

  create(data) {
    return apiPost("/budgets", data);
  },

  /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

  update(id, data) {
    return apiPut(`/budgets/${id}`, data);
  },

  /* -----------------------------------------------------
       SUMMARY
    ----------------------------------------------------- */

  getSummary(id) {
    return apiGet(`/budgets/${id}/summary`);
  },

  /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

  delete(id) {
    return apiDelete(`/budgets/${id}`);
  },
};

/* =========================================================
   SAVINGS API
   ========================================================= */

const SavingsAPI = {
  /* -----------------------------------------------------
       GET ALL
    ----------------------------------------------------- */

  getAll() {
    return apiGet("/savings");
  },

  /* -----------------------------------------------------
       GET ACTIVE
    ----------------------------------------------------- */

  getActive() {
    return apiGet("/savings/active");
  },

  /* -----------------------------------------------------
       GET COMPLETED
    ----------------------------------------------------- */

  getCompleted() {
    return apiGet("/savings/completed");
  },

  /* -----------------------------------------------------
       GET BY ID
    ----------------------------------------------------- */

  getById(id) {
    return apiGet(`/savings/${id}`);
  },

  /* -----------------------------------------------------
       CREATE
    ----------------------------------------------------- */

  create(data) {
    return apiPost("/savings", data);
  },

  /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

  update(id, data) {
    return apiPut(`/savings/${id}`, data);
  },

  /* -----------------------------------------------------
       ADD CONTRIBUTION
    ----------------------------------------------------- */

  contribute(id, amount) {
    return apiPost(`/savings/${id}/contribute`, {
      amount,
    });
  },

  /* -----------------------------------------------------
       REMOVE CONTRIBUTION
    ----------------------------------------------------- */

  removeContribution(id, amount) {
    return apiPost(`/savings/${id}/remove-contribution`, {
      amount,
    });
  },

  /* -----------------------------------------------------
       SUMMARY
    ----------------------------------------------------- */

  getSummary(id) {
    return apiGet(`/savings/${id}/summary`);
  },

  /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

  delete(id) {
    return apiDelete(`/savings/${id}`);
  },
};

/* =========================================================
   REPORTS API
   ========================================================= */

const ReportsAPI = {
  /* -----------------------------------------------------
       DASHBOARD
    ----------------------------------------------------- */

  dashboard() {
    return apiGet("/reports/dashboard");
  },

  /* -----------------------------------------------------
       INCOME VS EXPENSE
    ----------------------------------------------------- */

  incomeExpense(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    return apiGet(`/reports/income-expense?${params.toString()}`);
  },

  /* -----------------------------------------------------
       CATEGORIES
    ----------------------------------------------------- */

  categories(startDate, endDate) {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    return apiGet(`/reports/categories?${params.toString()}`);
  },

  /* -----------------------------------------------------
       MONTHLY
    ----------------------------------------------------- */

  monthly(year, month) {
    const params = new URLSearchParams({
      year,
      month,
    });

    return apiGet(`/reports/monthly?${params.toString()}`);
  },

  /* -----------------------------------------------------
       ACCOUNT
    ----------------------------------------------------- */

  account(accountId) {
    return apiGet(`/reports/account/${accountId}`);
  },

  /* -----------------------------------------------------
       BUDGETS
    ----------------------------------------------------- */

  budgets() {
    return apiGet("/reports/budgets");
  },

  /* -----------------------------------------------------
       SAVINGS
    ----------------------------------------------------- */

  savings() {
    return apiGet("/reports/savings");
  },
};

/* =========================================================
   SETTINGS API
   ========================================================= */

const SettingsAPI = {
  /* -----------------------------------------------------
       GET SETTINGS
    ----------------------------------------------------- */

  get() {
    return apiGet("/settings");
  },

  /* -----------------------------------------------------
       INITIALIZE SETTINGS
    ----------------------------------------------------- */

  initialize() {
    return apiPost("/settings/initialize");
  },

  /* -----------------------------------------------------
       UPDATE SETTINGS
    ----------------------------------------------------- */

  update(data) {
    return apiPut("/settings", data);
  },
};

/* =========================================================
   SESSION MANAGER
   ========================================================= */

const SessionManager = {
  /* -----------------------------------------------------
       CHECK LOGIN
    ----------------------------------------------------- */

  async isLoggedIn() {
    try {
      const response = await AuthAPI.me();

      return !!(response && response.success && response.user);
    } catch (error) {
      return false;
    }
  },

  /* -----------------------------------------------------
       GET CURRENT USER
    ----------------------------------------------------- */

  async getUser() {
    try {
      const response = await AuthAPI.me();

      if (response && response.success && response.user) {
        return response.user;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  /* -----------------------------------------------------
       REQUIRE LOGIN
       
       Use this only on protected pages.
    ----------------------------------------------------- */

  async requireLogin() {
    const loggedIn = await this.isLoggedIn();

    if (!loggedIn) {
      window.location.href = "login.html";
      return false;
    }

    return true;
  },

  /* -----------------------------------------------------
       LOGOUT
    ----------------------------------------------------- */

  async logout() {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      /*
                Do NOT delete financial data.
            */

      localStorage.removeItem("financeTrackerUser");

      sessionStorage.clear();

      window.location.replace("index.html");
    }
  },
};

/* =========================================================
   ERROR MESSAGE HELPER
   ========================================================= */

function getAPIErrorMessage(error) {
  if (error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/* =========================================================
   DATE HELPER
   ========================================================= */

function formatAPIRequestDate(date) {
  if (!date) {
    return "";
  }

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();

  const month = String(d.getMonth() + 1).padStart(2, "0");

  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   CURRENCY SYMBOL
   ========================================================= */

function getCurrencySymbol(currency = "INR") {
  const symbols = {
    INR: "₹",

    USD: "$",

    EUR: "€",

    GBP: "£",

    JPY: "¥",

    AUD: "A$",

    CAD: "C$",

    SGD: "S$",
  };

  return symbols[currency] || currency || "₹";
}

/* =========================================================
   FORMAT MONEY
   ========================================================= */

function formatMoney(amount, currency = "INR") {
  const numericAmount = Number(amount) || 0;

  return (
    getCurrencySymbol(currency) +
    numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    })
  );
}

/* =========================================================
   GLOBAL API
   ========================================================= */

window.FinanceAPI = {
  request: apiRequest,

  get: apiGet,

  post: apiPost,

  put: apiPut,

  delete: apiDelete,

  auth: AuthAPI,

  accounts: AccountsAPI,

  transactions: TransactionsAPI,

  budgets: BudgetsAPI,

  savings: SavingsAPI,

  reports: ReportsAPI,

  settings: SettingsAPI,

  session: SessionManager,

  errorMessage: getAPIErrorMessage,

  formatDate: formatAPIRequestDate,

  currencySymbol: getCurrencySymbol,

  formatMoney,
};

/* =========================================================
   DEBUG
   ========================================================= */

console.log("Finance Tracker API loaded:", API_BASE_URL);
