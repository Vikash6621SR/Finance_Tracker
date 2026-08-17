/* =========================================================
   FINANCE TRACKER
   ACCOUNTS PAGE
   ========================================================= */

"use strict";


document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
       ELEMENTS
     ===================================================== */

  const sidebar =
    document.getElementById("sidebar");

  const sidebarOverlay =
    document.getElementById("sidebarOverlay");

  const menuButton =
    document.getElementById("menuButton");

  const closeSidebar =
    document.getElementById("closeSidebar");

  const logoutButton =
    document.getElementById("logoutButton");

  const refreshButton =
    document.getElementById("refreshButton");


  const userName =
    document.getElementById("userName");

  const userEmail =
    document.getElementById("userEmail");

  const userAvatar =
    document.getElementById("userAvatar");


  const totalAccounts =
    document.getElementById("totalAccounts");

  const totalBalance =
    document.getElementById("totalBalance");

  const bankAccounts =
    document.getElementById("bankAccounts");

  const cashAccounts =
    document.getElementById("cashAccounts");


  const searchInput =
    document.getElementById("searchInput");

  const typeFilter =
    document.getElementById("typeFilter");

  const clearFilters =
    document.getElementById("clearFilters");


  const resultText =
    document.getElementById("resultText");

  const accountsGrid =
    document.getElementById("accountsGrid");

  const emptyState =
    document.getElementById("emptyState");


  const addAccountButton =
    document.getElementById("addAccountButton");

  const panelAddButton =
    document.getElementById("panelAddButton");

  const emptyAddButton =
    document.getElementById("emptyAddButton");


  const accountModal =
    document.getElementById("accountModal");

  const modalTitle =
    document.getElementById("modalTitle");

  const modalClose =
    document.getElementById("modalClose");

  const cancelButton =
    document.getElementById("cancelButton");


  const accountForm =
    document.getElementById("accountForm");

  const accountId =
    document.getElementById("accountId");

  const accountName =
    document.getElementById("accountName");

  const accountType =
    document.getElementById("accountType");

  const accountBalance =
    document.getElementById("accountBalance");

  const accountDescription =
    document.getElementById("accountDescription");


  const saveButton =
    document.getElementById("saveButton");

  const modalMessage =
    document.getElementById("modalMessage");


  const confirmOverlay =
    document.getElementById("confirmOverlay");

  const confirmCancel =
    document.getElementById("confirmCancel");

  const confirmDelete =
    document.getElementById("confirmDelete");


  const toast =
    document.getElementById("toast");

  const toastIcon =
    document.getElementById("toastIcon");

  const toastMessage =
    document.getElementById("toastMessage");


  /* =====================================================
       STATE
     ===================================================== */

  let accounts = [];

  let editingId = null;

  let deletingId = null;

  let toastTimer = null;


  /* =====================================================
       API CHECK
     ===================================================== */

  if (
    typeof FinanceAPI === "undefined" ||
    !FinanceAPI.accounts
  ) {

    console.error(
      "accounts.js: FinanceAPI.accounts was not found."
    );

    return;
  }


  /* =====================================================
       CURRENCY
     ===================================================== */

  function formatCurrency(amount) {

    const value =
      Number(amount) || 0;


    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(value);
  }


  /* =====================================================
       INITIALIZE
     ===================================================== */

  init();


  async function init() {

    setupEvents();

    await loadUser();

    await loadAccounts();
  }


  /* =====================================================
       EVENTS
     ===================================================== */

  function setupEvents() {

    menuButton?.addEventListener(
      "click",
      openSidebar
    );


    closeSidebar?.addEventListener(
      "click",
      closeSidebarMenu
    );


    sidebarOverlay?.addEventListener(
      "click",
      closeSidebarMenu
    );


    window.addEventListener(
      "resize",
      function () {

        if (window.innerWidth > 950) {

          closeSidebarMenu();
        }
      }
    );


    logoutButton?.addEventListener(
      "click",
      handleLogout
    );


    refreshButton?.addEventListener(
      "click",
      async function () {

        refreshButton.disabled = true;


        refreshButton
          .querySelector("i")
          ?.classList.add("fa-spin");


        try {

          await loadAccounts();

          showToast(
            "Accounts refreshed."
          );

        } catch (error) {

          showToast(
            getErrorMessage(error),
            "error"
          );

        } finally {

          refreshButton.disabled = false;


          refreshButton
            .querySelector("i")
            ?.classList.remove("fa-spin");
        }
      }
    );


    addAccountButton?.addEventListener(
      "click",
      openAddModal
    );


    panelAddButton?.addEventListener(
      "click",
      openAddModal
    );


    emptyAddButton?.addEventListener(
      "click",
      openAddModal
    );


    modalClose?.addEventListener(
      "click",
      closeModal
    );


    cancelButton?.addEventListener(
      "click",
      closeModal
    );


    accountModal?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          accountModal
        ) {

          closeModal();
        }
      }
    );


    accountForm?.addEventListener(
      "submit",
      handleSubmit
    );


    searchInput?.addEventListener(
      "input",
      renderAccounts
    );


    typeFilter?.addEventListener(
      "change",
      renderAccounts
    );


    clearFilters?.addEventListener(
      "click",
      function () {

        if (searchInput) {

          searchInput.value = "";
        }


        if (typeFilter) {

          typeFilter.value = "all";
        }


        renderAccounts();
      }
    );


    confirmCancel?.addEventListener(
      "click",
      closeConfirm
    );


    confirmDelete?.addEventListener(
      "click",
      handleDelete
    );


    confirmOverlay?.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          confirmOverlay
        ) {

          closeConfirm();
        }
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {

          closeModal();

          closeConfirm();

          closeSidebarMenu();
        }
      }
    );
  }


  /* =====================================================
       SIDEBAR
     ===================================================== */

  function openSidebar() {

    sidebar?.classList.add(
      "open"
    );


    sidebarOverlay?.classList.add(
      "active"
    );


    document.body.style.overflow =
      "hidden";
  }


  function closeSidebarMenu() {

    sidebar?.classList.remove(
      "open"
    );


    sidebarOverlay?.classList.remove(
      "active"
    );


    document.body.style.overflow =
      "";
  }


  /* =====================================================
       USER
     ===================================================== */

  async function loadUser() {

    if (
      typeof FinanceAPI === "undefined" ||
      !FinanceAPI.auth ||
      typeof FinanceAPI.auth.me !== "function"
    ) {

      return;
    }


    try {

      const response =
        await FinanceAPI.auth.me();


      const user =
        response?.user;


      if (!user) {

        return;
      }


      const name =
        user.name ||
        user.fullName ||
        user.username ||
        user.email ||
        "User";


      const email =
        user.email ||
        "Finance Account";


      if (userName) {

        userName.textContent =
          name;
      }


      if (userEmail) {

        userEmail.textContent =
          email;
      }


      if (userAvatar) {

        userAvatar.textContent =
          getInitials(name);
      }

    } catch (error) {

      console.warn(
        "Could not load current user.",
        error
      );
    }
  }


  function getInitials(name) {

    const value =
      String(name || "User")
        .trim();


    if (!value) {

      return "U";
    }


    const parts =
      value.split(/\s+/);


    if (parts.length === 1) {

      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }


  /* =====================================================
       LOAD ACCOUNTS
     ===================================================== */

  async function loadAccounts() {

    showLoading();


    try {

      /*
      =====================================================
      CURRENT API

      FinanceAPI.accounts.getAll()

      NOT:

      apiGet("/accounts")
      =====================================================
      */

      const response =
        await FinanceAPI.accounts.getAll();


      accounts =
        extractArray(
          response,
          [
            "accounts",
            "data",
            "content"
          ]
        )
          .map(
            normalizeAccount
          )
          .filter(Boolean);


      updateSummary();

      renderAccounts();

    } catch (error) {

      console.error(
        "Failed to load accounts:",
        error
      );


      accounts = [];

      updateSummary();

      showLoadError(error);
    }
  }


  /* =====================================================
       NORMALIZE ACCOUNT
     ===================================================== */

  function normalizeAccount(account) {

    if (
      !account ||
      typeof account !== "object"
    ) {

      return null;
    }


    const id =
      account.id ??
      account.accountId ??
      account.account_id;


    return {

      id: id,


      name:
        account.name ??
        account.accountName ??
        account.title ??
        "Account",


      type:
        account.type ??
        account.accountType ??
        account.account_type ??
        "OTHER",


      balance:
        Number(
          account.balance ??
          account.currentBalance ??
          account.openingBalance ??
          0
        ) || 0,


      description:
        account.description ??
        account.notes ??
        ""
    };
  }


  /* =====================================================
       EXTRACT ARRAY
     ===================================================== */

  function extractArray(
    response,
    keys
  ) {

    if (
      Array.isArray(response)
    ) {

      return response;
    }


    if (
      response &&
      typeof response === "object"
    ) {

      for (
        const key of keys
      ) {

        if (
          Array.isArray(
            response[key]
          )
        ) {

          return response[key];
        }
      }
    }


    return [];
  }


  /* =====================================================
       SUMMARY
     ===================================================== */

  function updateSummary() {

    if (totalAccounts) {

      totalAccounts.textContent =
        accounts.length;
    }


    const balance =
      accounts.reduce(
        function (
          total,
          account
        ) {

          return (
            total +
            Number(
              account.balance
            )
          );

        },
        0
      );


    if (totalBalance) {

      totalBalance.textContent =
        formatCurrency(
          balance
        );
    }


    if (bankAccounts) {

      bankAccounts.textContent =
        accounts.filter(
          function (account) {

            return (
              normalizeType(
                account.type
              ) === "BANK"
            );
          }
        ).length;
    }


    if (cashAccounts) {

      cashAccounts.textContent =
        accounts.filter(
          function (account) {

            return (
              normalizeType(
                account.type
              ) === "CASH"
            );
          }
        ).length;
    }
  }


  /* =====================================================
       RENDER
     ===================================================== */

  function renderAccounts() {

    if (!accountsGrid) {

      return;
    }


    const search =
      String(
        searchInput?.value || ""
      )
        .trim()
        .toLowerCase();


    const type =
      typeFilter?.value ||
      "all";


    const filtered =
      accounts.filter(
        function (account) {

          const matchesSearch =
            !search ||
            String(
              account.name
            )
              .toLowerCase()
              .includes(search) ||
            String(
              account.description
            )
              .toLowerCase()
              .includes(search);


          const matchesType =
            type === "all" ||
            normalizeType(
              account.type
            ) === type;


          return (
            matchesSearch &&
            matchesType
          );
        }
      );


    accountsGrid.innerHTML =
      "";


    if (
      accounts.length === 0
    ) {

      accountsGrid.style.display =
        "none";


      emptyState?.classList.add(
        "show"
      );


      const heading =
        emptyState?.querySelector(
          "h3"
        );


      const paragraph =
        emptyState?.querySelector(
          "p"
        );


      if (heading) {

        heading.textContent =
          "No accounts found";
      }


      if (paragraph) {

        paragraph.textContent =
          "Add your first account to start tracking your finances.";
      }


      if (resultText) {

        resultText.textContent =
          "0 accounts";
      }


      return;
    }


    if (
      filtered.length === 0
    ) {

      accountsGrid.style.display =
        "none";


      emptyState?.classList.add(
        "show"
      );


      const heading =
        emptyState?.querySelector(
          "h3"
        );


      const paragraph =
        emptyState?.querySelector(
          "p"
        );


      if (heading) {

        heading.textContent =
          "No matching accounts";
      }


      if (paragraph) {

        paragraph.textContent =
          "Try changing your search or account type filter.";
      }


      if (resultText) {

        resultText.textContent =
          "0 matching accounts";
      }


      return;
    }


    accountsGrid.style.display =
      "grid";


    emptyState?.classList.remove(
      "show"
    );


    const heading =
      emptyState?.querySelector(
        "h3"
      );


    const paragraph =
      emptyState?.querySelector(
        "p"
      );


    if (heading) {

      heading.textContent =
        "No accounts found";
    }


    if (paragraph) {

      paragraph.textContent =
        "Add your first account to start tracking your finances.";
    }


    if (resultText) {

      resultText.textContent =
        filtered.length +
        (
          filtered.length === 1
            ? " account"
            : " accounts"
        );
    }


    filtered.forEach(
      function (account) {

        accountsGrid.appendChild(
          createAccountCard(
            account
          )
        );
      }
    );
  }


  /* =====================================================
       ACCOUNT CARD
     ===================================================== */

  function createAccountCard(
    account
  ) {

    const card =
      document.createElement(
        "article"
      );


    card.className =
      "account-card";


    const type =
      normalizeType(
        account.type
      );


    const icon =
      getAccountIcon(
        type
      );


    const formattedType =
      formatType(
        type
      );


    card.innerHTML = `

      <div class="account-top">

        <div class="account-icon">

          <i class="${icon}"></i>

        </div>


        <div class="account-actions">

          <button
            class="account-action edit"
            type="button"
            title="Edit account"
            aria-label="Edit account"
          >

            <i class="fa-solid fa-pen"></i>

          </button>


          <button
            class="account-action delete"
            type="button"
            title="Delete account"
            aria-label="Delete account"
          >

            <i class="fa-solid fa-trash"></i>

          </button>

        </div>

      </div>


      <h3 class="account-name">

        ${escapeHtml(
          account.name
        )}

      </h3>


      <span class="account-type">

        ${escapeHtml(
          formattedType
        )}

      </span>


      <div class="account-balance-label">

        CURRENT BALANCE

      </div>


      <div class="account-balance">

        ${formatCurrency(
          account.balance
        )}

      </div>


      <p class="account-description">

        ${escapeHtml(
          account.description ||
          "No description added."
        )}

      </p>

    `;


    const editButton =
      card.querySelector(
        ".edit"
      );


    const deleteButton =
      card.querySelector(
        ".delete"
      );


    editButton?.addEventListener(
      "click",
      function () {

        openEditModal(
          account
        );
      }
    );


    deleteButton?.addEventListener(
      "click",
      function () {

        openConfirm(
          account
        );
      }
    );


    return card;
  }


  /* =====================================================
       ACCOUNT ICON
     ===================================================== */

  function getAccountIcon(
    type
  ) {

    switch (type) {

      case "BANK":

        return (
          "fa-solid fa-building-columns"
        );


      case "CASH":

        return (
          "fa-solid fa-money-bill-wave"
        );


      case "CREDIT_CARD":

        return (
          "fa-solid fa-credit-card"
        );


      case "WALLET":

        return (
          "fa-solid fa-wallet"
        );


      case "INVESTMENT":

        return (
          "fa-solid fa-chart-line"
        );


      default:

        return (
          "fa-solid fa-circle-dollar-to-slot"
        );
    }
  }


  /* =====================================================
       TYPE
     ===================================================== */

  function normalizeType(
    type
  ) {

    return String(
      type || "OTHER"
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        "_"
      );
  }


  function formatType(
    type
  ) {

    const value =
      normalizeType(
        type
      );


    const names = {

      BANK:
        "Bank",

      CASH:
        "Cash",

      CREDIT_CARD:
        "Credit Card",

      WALLET:
        "Wallet",

      INVESTMENT:
        "Investment",

      OTHER:
        "Other"
    };


    return (
      names[value] ||
      value
        .replace(
          /_/g,
          " "
        )
        .replace(
          /\b\w/g,
          function (letter) {

            return letter.toUpperCase();
          }
        )
    );
  }


  /* =====================================================
       ADD MODAL
     ===================================================== */

  function openAddModal() {

    editingId = null;


    accountForm?.reset();


    if (accountId) {

      accountId.value =
        "";
    }


    if (accountBalance) {

      accountBalance.value =
        "0";
    }


    if (modalTitle) {

      modalTitle.textContent =
        "Add Account";
    }


    if (saveButton) {

      saveButton.textContent =
        "Save Account";
    }


    hideModalMessage();


    accountModal?.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";


    setTimeout(
      function () {

        accountName?.focus();

      },
      100
    );
  }


  /* =====================================================
       EDIT MODAL
     ===================================================== */

  function openEditModal(
    account
  ) {

    editingId =
      account.id;


    if (accountId) {

      accountId.value =
        account.id ?? "";
    }


    if (accountName) {

      accountName.value =
        account.name ?? "";
    }


    if (accountType) {

      accountType.value =
        normalizeType(
          account.type
        );
    }


    if (accountBalance) {

      accountBalance.value =
        Number(
          account.balance
        ) || 0;
    }


    if (accountDescription) {

      accountDescription.value =
        account.description ||
        "";
    }


    if (modalTitle) {

      modalTitle.textContent =
        "Edit Account";
    }


    if (saveButton) {

      saveButton.textContent =
        "Update Account";
    }


    hideModalMessage();


    accountModal?.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";


    setTimeout(
      function () {

        accountName?.focus();

      },
      100
    );
  }


  /* =====================================================
       CLOSE MODAL
     ===================================================== */

  function closeModal() {

    accountModal?.classList.remove(
      "show"
    );


    if (
      !confirmOverlay?.classList.contains(
        "show"
      )
    ) {

      document.body.style.overflow =
        "";
    }
  }


  /* =====================================================
       FORM SUBMIT
     ===================================================== */

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    const name =
      accountName?.value.trim() ||
      "";


    const type =
      normalizeType(
        accountType?.value
      );


    const balance =
      Number(
        accountBalance?.value
      );


    const description =
      accountDescription?.value.trim() ||
      "";


    if (!name) {

      showModalMessage(
        "Please enter an account name."
      );


      accountName?.focus();


      return;
    }


    if (!accountType?.value) {

      showModalMessage(
        "Please select an account type."
      );


      accountType?.focus();


      return;
    }


    if (
      !Number.isFinite(
        balance
      ) ||
      balance < 0
    ) {

      showModalMessage(
        "Please enter a valid opening balance."
      );


      accountBalance?.focus();


      return;
    }


    const payload = {

      name: name,

      type: type,

      balance: balance,

      openingBalance:
        balance,

      description:
        description
    };


    if (saveButton) {

      saveButton.disabled =
        true;


      saveButton.textContent =
        editingId
          ? "Updating..."
          : "Saving...";
    }


    try {

      if (editingId) {

        await updateAccount(
          editingId,
          payload
        );


        showToast(
          "Account updated successfully."
        );

      } else {

        await createAccount(
          payload
        );


        showToast(
          "Account added successfully."
        );
      }


      closeModal();


      await loadAccounts();

    } catch (error) {

      console.error(
        "Account save failed:",
        error
      );


      showModalMessage(
        getErrorMessage(
          error
        )
      );

    } finally {

      if (saveButton) {

        saveButton.disabled =
          false;


        saveButton.textContent =
          editingId
            ? "Update Account"
            : "Save Account";
      }
    }
  }


  /* =====================================================
       CREATE ACCOUNT
     ===================================================== */

  async function createAccount(
    payload
  ) {

    /*
    Current API:

    POST /api/accounts
    */

    return await FinanceAPI.accounts.create(
      payload
    );
  }


  /* =====================================================
       UPDATE ACCOUNT
     ===================================================== */

  async function updateAccount(
    id,
    payload
  ) {

    /*
    Current API:

    PUT /api/accounts/{id}
    */

    return await FinanceAPI.accounts.update(
      id,
      payload
    );
  }


  /* =====================================================
       DELETE CONFIRM
     ===================================================== */

  function openConfirm(
    account
  ) {

    deletingId =
      account.id;


    confirmOverlay?.classList.add(
      "show"
    );


    document.body.style.overflow =
      "hidden";
  }


  function closeConfirm() {

    confirmOverlay?.classList.remove(
      "show"
    );


    deletingId =
      null;


    if (
      !accountModal?.classList.contains(
        "show"
      )
    ) {

      document.body.style.overflow =
        "";
    }
  }


  /* =====================================================
       DELETE
     ===================================================== */

  async function handleDelete() {

    if (
      deletingId === null ||
      deletingId === undefined
    ) {

      return;
    }


    const id =
      deletingId;


    if (confirmDelete) {

      confirmDelete.disabled =
        true;


      confirmDelete.textContent =
        "Deleting...";
    }


    try {

      /*
      Current API:

      DELETE /api/accounts/{id}
      */

      await FinanceAPI.accounts.delete(
        id
      );


      closeConfirm();


      showToast(
        "Account deleted successfully."
      );


      await loadAccounts();

    } catch (error) {

      console.error(
        "Account deletion failed:",
        error
      );


      showToast(
        getErrorMessage(
          error
        ),
        "error"
      );

    } finally {

      if (confirmDelete) {

        confirmDelete.disabled =
          false;


        confirmDelete.textContent =
          "Delete";
      }
    }
  }


  /* =====================================================
       LOADING
     ===================================================== */

  function showLoading() {

    if (!accountsGrid) {

      return;
    }


    accountsGrid.style.display =
      "grid";


    emptyState?.classList.remove(
      "show"
    );


    accountsGrid.innerHTML = `

      <div class="loading-state">

        <i class="fa-solid fa-spinner fa-spin"></i>

        Loading accounts...

      </div>

    `;
  }


  function showLoadError(
    error
  ) {

    if (!accountsGrid) {

      return;
    }


    accountsGrid.style.display =
      "grid";


    emptyState?.classList.remove(
      "show"
    );


    accountsGrid.innerHTML = `

      <div class="loading-state">

        <i class="fa-solid fa-triangle-exclamation"></i>

        Unable to load accounts.

      </div>

    `;


    if (resultText) {

      resultText.textContent =
        "Unable to load accounts";
    }
  }


  /* =====================================================
       MODAL MESSAGE
     ===================================================== */

  function showModalMessage(
    message
  ) {

    if (!modalMessage) {

      return;
    }


    modalMessage.textContent =
      message;


    modalMessage.classList.add(
      "show"
    );
  }


  function hideModalMessage() {

    if (!modalMessage) {

      return;
    }


    modalMessage.textContent =
      "";


    modalMessage.classList.remove(
      "show"
    );
  }


  /* =====================================================
       TOAST
     ===================================================== */

  function showToast(
    message,
    type = "success"
  ) {

    if (
      !toast ||
      !toastMessage
    ) {

      return;
    }


    clearTimeout(
      toastTimer
    );


    toastMessage.textContent =
      message;


    if (toastIcon) {

      if (
        type === "error"
      ) {

        toastIcon.className =
          "fa-solid fa-circle-exclamation";

        toastIcon.style.color =
          "#f87171";

      } else {

        toastIcon.className =
          "fa-solid fa-circle-check";

        toastIcon.style.color =
          "#4ade80";
      }
    }


    toast.classList.add(
      "show"
    );


    toastTimer =
      setTimeout(
        function () {

          toast.classList.remove(
            "show"
          );

        },
        3200
      );
  }


  /* =====================================================
       ERROR MESSAGE
     ===================================================== */

  function getErrorMessage(
    error
  ) {

    if (
      typeof FinanceAPI !==
        "undefined" &&
      typeof FinanceAPI.errorMessage ===
        "function"
    ) {

      return FinanceAPI.errorMessage(
        error
      );
    }


    if (
      error?.data?.message
    ) {

      return error.data.message;
    }


    if (
      error?.data?.error
    ) {

      return error.data.error;
    }


    if (
      error?.message
    ) {

      return error.message;
    }


    return (
      "Something went wrong. Please try again."
    );
  }


  /* =====================================================
       ESCAPE HTML
     ===================================================== */

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  /* =====================================================
       LOGOUT
     ===================================================== */

  async function handleLogout() {

    try {

      if (
        typeof FinanceAPI !==
          "undefined" &&
        FinanceAPI.auth &&
        typeof FinanceAPI.auth.logout ===
          "function"
      ) {

        await FinanceAPI.auth.logout();
      }

    } catch (error) {

      console.warn(
        "Logout API request failed.",
        error
      );

    } finally {

      try {

        localStorage.removeItem(
          "financeUser"
        );

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "loggedIn"
        );

      } catch (error) {

        console.warn(
          "Local logout cleanup failed.",
          error
        );
      }


      window.location.href =
        "login.html";
    }
  }

});
