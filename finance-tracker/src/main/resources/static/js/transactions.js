"use strict";

/*
=========================================================
FINANCE TRACKER - TRANSACTIONS
=========================================================
*/

let transactions = [];
let accounts = [];
let categories = [];

let editingTransactionId = null;
let deletingTransactionId = null;


/*
=========================================================
INITIALIZE
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeTransactions();
});


async function initializeTransactions() {

    try {

        if (typeof FinanceAPI === "undefined") {
            console.error("FinanceAPI is not loaded.");
            return;
        }

        setupEventListeners();
        initializeUser();

        await Promise.all([
            loadAccounts(),
            loadTransactions()
        ]);

        /*
        Categories are currently not available
        from the Spring Boot backend.
        */

        categories = [];

        populateAccountFilter();
        populateAccountSelect();

        populateCategoryFilter();
        populateCategorySelect();

        renderTransactions();
        updateStatistics();

    } catch (error) {

        console.error(
            "Transactions initialization failed:",
            error
        );
    }
}


/*
=========================================================
SIDEBAR
=========================================================
*/

function initializeSidebar() {

    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");

    const overlay =
        document.getElementById("sidebarOverlay");

    const closeButton =
        document.getElementById("closeSidebar");

    if (!sidebar) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add("open");

        if (overlay) {
            overlay.classList.add("active");
        }

        if (menuButton) {
            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        document.body.style.overflow = "hidden";
    }


    function closeSidebarMenu() {

        sidebar.classList.remove("open");

        if (overlay) {
            overlay.classList.remove("active");
        }

        if (menuButton) {
            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        document.body.style.overflow = "";
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                if (
                    sidebar.classList.contains("open")
                ) {
                    closeSidebarMenu();
                } else {
                    openSidebar();
                }
            }
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                closeSidebarMenu();
            }
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebarMenu
        );
    }


    sidebar
        .querySelectorAll(".nav-link")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    if (window.innerWidth <= 800) {
                        closeSidebarMenu();
                    }
                }
            );
        });


    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeSidebarMenu();
                closeTransactionModal();
                closeDeleteConfirmation();
            }
        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 800) {
                closeSidebarMenu();
            }
        }
    );
}


/*
=========================================================
USER INFORMATION
=========================================================
*/

function initializeUser() {

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userAvatar =
        document.getElementById("userAvatar");

    let user = null;


    try {

        const storedUser =
            localStorage.getItem("financeUser");

        if (storedUser) {
            user = JSON.parse(storedUser);
        }

    } catch (error) {

        console.warn(
            "Unable to read financeUser.",
            error
        );
    }


    if (!user) {

        try {

            const storedUser =
                localStorage.getItem("user");

            if (storedUser) {
                user = JSON.parse(storedUser);
            }

        } catch (error) {

            console.warn(
                "Unable to read user.",
                error
            );
        }
    }


    if (!user) {
        return;
    }


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "User";

    const email =
        user.email ||
        user.username ||
        "Account";


    if (userName) {
        userName.textContent = name;
    }

    if (userEmail) {
        userEmail.textContent = email;
    }

    if (userAvatar) {

        userAvatar.textContent =
            name.trim()
                .charAt(0)
                .toUpperCase() || "U";
    }
}


/*
=========================================================
EVENT LISTENERS
=========================================================
*/

function setupEventListeners() {

    const openAddButton =
        document.getElementById("openAddButton");

    if (openAddButton) {

        openAddButton.addEventListener(
            "click",
            () => openTransactionModal()
        );
    }


    const emptyAddButton =
        document.getElementById("emptyAddButton");

    if (emptyAddButton) {

        emptyAddButton.addEventListener(
            "click",
            () => openTransactionModal()
        );
    }


    const form =
        document.getElementById("transactionForm");

    if (form) {
        form.addEventListener(
            "submit",
            handleTransactionSubmit
        );
    }


    const modalClose =
        document.getElementById("modalClose");

    if (modalClose) {
        modalClose.addEventListener(
            "click",
            closeTransactionModal
        );
    }


    const cancelButton =
        document.getElementById("cancelButton");

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeTransactionModal
        );
    }


    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            renderTransactions
        );
    }


    const typeFilter =
        document.getElementById("typeFilter");

    if (typeFilter) {
        typeFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    const categoryFilter =
        document.getElementById("categoryFilter");

    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    const accountFilter =
        document.getElementById("accountFilter");

    if (accountFilter) {
        accountFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    const sortFilter =
        document.getElementById("sortFilter");

    if (sortFilter) {
        sortFilter.addEventListener(
            "change",
            renderTransactions
        );
    }


    const clearFilters =
        document.getElementById("clearFilters");

    if (clearFilters) {
        clearFilters.addEventListener(
            "click",
            clearAllFilters
        );
    }


    const refreshButton =
        document.getElementById("refreshButton");

    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            refreshTransactions
        );
    }


    const exportButton =
        document.getElementById("exportButton");

    if (exportButton) {
        exportButton.addEventListener(
            "click",
            exportTransactionsCSV
        );
    }


    const confirmCancel =
        document.getElementById("confirmCancel");

    if (confirmCancel) {
        confirmCancel.addEventListener(
            "click",
            closeDeleteConfirmation
        );
    }


    const confirmDelete =
        document.getElementById("confirmDelete");

    if (confirmDelete) {
        confirmDelete.addEventListener(
            "click",
            confirmDeleteTransaction
        );
    }


    const modal =
        document.getElementById("transactionModal");

    if (modal) {

        modal.addEventListener(
            "click",
            (event) => {

                if (event.target === modal) {
                    closeTransactionModal();
                }
            }
        );
    }
}


/*
=========================================================
LOAD ACCOUNTS
=========================================================
*/

async function loadAccounts() {

    try {

        /*
        IMPORTANT:
        Current FinanceAPI uses:

        FinanceAPI.accounts.getAll()

        NOT:

        FinanceAPI.get()
        */

        const response =
            await FinanceAPI.accounts.getAll();

        accounts = normalizeArray(response);

        populateAccountSelect();

        console.log(
            "Accounts loaded:",
            accounts
        );

    } catch (error) {

        console.error(
            "Accounts loading failed:",
            error
        );

        accounts = [];

        populateAccountSelect();
    }
}


/*
=========================================================
LOAD CATEGORIES
=========================================================
*/

async function loadCategories() {

    /*
    There is currently no categories endpoint
    configured in the backend.

    Therefore we do not make a fake API request.
    */

    categories = [];

    populateCategorySelect();
    populateCategoryFilter();

    console.log(
        "Categories loaded: no categories endpoint configured."
    );
}


/*
=========================================================
LOAD TRANSACTIONS
=========================================================
*/

async function loadTransactions() {

    try {

        /*
        Current FinanceAPI:

        FinanceAPI.transactions.getAll()
        */

        const response =
            await FinanceAPI.transactions.getAll();

        transactions =
            normalizeArray(response);

        console.log(
            "Transactions loaded:",
            transactions
        );

    } catch (error) {

        console.error(
            "Transaction loading failed:",
            error
        );

        transactions = [];
    }
}


/*
=========================================================
NORMALIZE API RESPONSE
=========================================================
*/

function normalizeArray(response) {

    if (Array.isArray(response)) {
        return response;
    }


    if (
        response &&
        Array.isArray(response.data)
    ) {
        return response.data;
    }


    if (
        response &&
        Array.isArray(response.content)
    ) {
        return response.content;
    }


    if (
        response &&
        Array.isArray(response.transactions)
    ) {
        return response.transactions;
    }


    if (
        response &&
        Array.isArray(response.accounts)
    ) {
        return response.accounts;
    }


    return [];
}


/*
=========================================================
POPULATE ACCOUNT SELECT
=========================================================
*/

function populateAccountSelect() {

    const select =
        document.getElementById("accountId");

    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">Select account</option>`;


    accounts.forEach((account) => {

        const option =
            document.createElement("option");

        option.value =
            account.id;

        option.textContent =
            account.name ||
            account.accountName ||
            account.title ||
            `Account ${account.id}`;

        select.appendChild(option);
    });
}


/*
=========================================================
POPULATE CATEGORY SELECT
=========================================================
*/

function populateCategorySelect() {

    const select =
        document.getElementById("categoryId");

    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">Select category</option>`;


    categories.forEach((category) => {

        const name =
            getCategoryName(category);

        const value =
            category?.id ??
            category?.name ??
            category?.categoryName ??
            category;


        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = name;

        select.appendChild(option);
    });
}


/*
=========================================================
POPULATE CATEGORY FILTER
=========================================================
*/

function populateCategoryFilter() {

    const filter =
        document.getElementById("categoryFilter");

    if (!filter) {
        return;
    }


    filter.innerHTML =
        `<option value="all">All Categories</option>`;


    categories.forEach((category) => {

        const name =
            getCategoryName(category);

        if (!name) {
            return;
        }


        const option =
            document.createElement("option");

        option.value = name;
        option.textContent = name;

        filter.appendChild(option);
    });
}


/*
=========================================================
POPULATE ACCOUNT FILTER
=========================================================
*/

function populateAccountFilter() {

    const filter =
        document.getElementById("accountFilter");

    if (!filter) {
        return;
    }


    filter.innerHTML =
        `<option value="all">All Accounts</option>`;


    accounts.forEach((account) => {

        const name =
            account.name ||
            account.accountName ||
            account.title ||
            `Account ${account.id}`;


        const option =
            document.createElement("option");

        option.value =
            String(account.id);

        option.textContent =
            name;

        filter.appendChild(option);
    });
}


/*
=========================================================
CATEGORY NAME
=========================================================
*/

function getCategoryName(category) {

    if (typeof category === "string") {
        return category;
    }


    if (
        category &&
        typeof category === "object"
    ) {

        return (
            category.name ||
            category.categoryName ||
            category.title ||
            ""
        );
    }


    return "";
}


/*
=========================================================
OPEN TRANSACTION MODAL
=========================================================
*/

function openTransactionModal(transaction = null) {

    const modal =
        document.getElementById("transactionModal");

    const form =
        document.getElementById("transactionForm");

    if (!modal || !form) {
        return;
    }


    editingTransactionId =
        transaction?.id ?? null;


    form.reset();


    const modalTitle =
        document.getElementById("modalTitle");

    if (modalTitle) {

        modalTitle.textContent =
            transaction
                ? "Edit Transaction"
                : "Add Transaction";
    }


    const amount =
        document.getElementById("amount");

    const description =
        document.getElementById("description");

    const accountId =
        document.getElementById("accountId");

    const categoryId =
        document.getElementById("categoryId");

    const date =
        document.getElementById("transactionDate");

    const notes =
        document.getElementById("notes");

    const reference =
        document.getElementById("reference");


    if (transaction) {

        if (amount) {
            amount.value =
                transaction.amount ?? "";
        }


        if (description) {

            description.value =
                transaction.description ||
                transaction.title ||
                "";
        }


        if (accountId) {

            accountId.value =
                transaction.accountId ??
                transaction.account?.id ??
                "";
        }


        if (categoryId) {

            categoryId.value =
                transaction.categoryId ??
                (
                    typeof transaction.category ===
                    "object"
                        ? transaction.category?.id
                        : transaction.category
                ) ??
                "";
        }


        if (date) {

            date.value =
                formatDateForInput(
                    transaction.transactionDate
                );
        }


        if (notes) {
            notes.value =
                transaction.notes || "";
        }


        if (reference) {
            reference.value =
                transaction.reference || "";
        }


        const type =
            String(
                transaction.type ||
                "EXPENSE"
            ).toUpperCase();


        const typeRadio =
            document.querySelector(
                `input[name="transactionType"][value="${type}"]`
            );


        if (typeRadio) {
            typeRadio.checked = true;
        }

    } else {

        if (date) {
            date.value =
                getTodayDate();
        }


        const expenseRadio =
            document.querySelector(
                'input[name="transactionType"][value="EXPENSE"]'
            );


        if (expenseRadio) {
            expenseRadio.checked = true;
        }
    }


    clearModalMessage();

    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";


    if (amount) {

        setTimeout(
            () => amount.focus(),
            100
        );
    }
}


/*
=========================================================
CLOSE TRANSACTION MODAL
=========================================================
*/

function closeTransactionModal() {

    const modal =
        document.getElementById("transactionModal");

    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    editingTransactionId = null;

    document.body.style.overflow =
        "";

    clearModalMessage();
}


/*
=========================================================
HANDLE TRANSACTION SUBMIT
=========================================================
*/

async function handleTransactionSubmit(event) {

    event.preventDefault();


    const type =
        getSelectedTransactionType();

    const amount =
        parseFloat(
            getValue("amount")
        );

    const description =
        getValue("description");

    const accountId =
        getValue("accountId");

    const categoryId =
        getValue("categoryId");

    const transactionDate =
        getValue("transactionDate");

    const notes =
        getValue("notes");

    const reference =
        getValue("reference");


    /*
    =====================================================
    VALIDATION
    =====================================================
    */

    if (!amount || amount <= 0) {

        showModalMessage(
            "Please enter a valid amount.",
            "error"
        );

        return;
    }


    if (!description) {

        showModalMessage(
            "Please enter a transaction description.",
            "error"
        );

        return;
    }


    if (!type) {

        showModalMessage(
            "Please select a transaction type.",
            "error"
        );

        return;
    }


    if (!accountId) {

        showModalMessage(
            "Please select an account.",
            "error"
        );

        return;
    }


    if (!transactionDate) {

        showModalMessage(
            "Please select a transaction date.",
            "error"
        );

        return;
    }


    /*
    =====================================================
    PAYLOAD
    =====================================================
    */

    const payload = {

        title: description,

        description: description,

        amount: amount,

        type: type,

        category:
            categoryId || null,

        categoryId:
            categoryId || null,

        accountId:
            Number(accountId),

        transactionDate:
            transactionDate,

        notes:
            notes || null,

        reference:
            reference || null
    };


    const saveButton =
        document.getElementById("saveButton");


    try {

        if (saveButton) {
            saveButton.disabled = true;
        }


        let response;


        /*
        =================================================
        UPDATE
        =================================================
        */

        if (editingTransactionId) {

            response =
                await FinanceAPI.transactions.update(
                    editingTransactionId,
                    payload
                );


            showMessage(
                "Transaction updated successfully.",
                "success"
            );

        } else {

            /*
            =================================================
            CREATE
            =================================================
            */

            response =
                await FinanceAPI.transactions.create(
                    payload
                );


            showMessage(
                "Transaction added successfully.",
                "success"
            );
        }


        console.log(
            "Transaction response:",
            response
        );


        closeTransactionModal();

        await loadTransactions();

        renderTransactions();

        updateStatistics();

    } catch (error) {

        console.error(
            "Transaction save failed:",
            error
        );


        showModalMessage(
            getErrorMessage(error),
            "error"
        );

    } finally {

        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}


/*
=========================================================
GET SELECTED TYPE
=========================================================
*/

function getSelectedTransactionType() {

    const selected =
        document.querySelector(
            'input[name="transactionType"]:checked'
        );

    return selected
        ? selected.value
        : "";
}


/*
=========================================================
RENDER TRANSACTIONS
=========================================================
*/

function renderTransactions() {

    const table =
        document.getElementById(
            "transactionTable"
        );

    if (!table) {
        return;
    }


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const typeFilter =
        document.getElementById(
            "typeFilter"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const accountFilter =
        document.getElementById(
            "accountFilter"
        );


    const sortFilter =
        document.getElementById(
            "sortFilter"
        );


    const search =
        (
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();


    const type =
        typeFilter?.value ||
        "all";


    const category =
        categoryFilter?.value ||
        "all";


    const account =
        accountFilter?.value ||
        "all";


    const sort =
        sortFilter?.value ||
        "newest";


    let filtered =
        [...transactions];


    /*
    =====================================================
    SEARCH
    =====================================================
    */

    if (search) {

        filtered =
            filtered.filter(
                (transaction) => {

                    const title =
                        String(
                            transaction.title ||
                            transaction.description ||
                            ""
                        ).toLowerCase();


                    const categoryName =
                        getTransactionCategory(
                            transaction
                        ).toLowerCase();


                    const accountName =
                        getTransactionAccount(
                            transaction
                        ).toLowerCase();


                    return (
                        title.includes(search) ||
                        categoryName.includes(search) ||
                        accountName.includes(search)
                    );
                }
            );
    }


    /*
    =====================================================
    TYPE
    =====================================================
    */

    if (type !== "all") {

        filtered =
            filtered.filter(
                (transaction) => {

                    return (
                        String(
                            transaction.type || ""
                        ).toLowerCase() ===
                        type.toLowerCase()
                    );
                }
            );
    }


    /*
    =====================================================
    CATEGORY
    =====================================================
    */

    if (category !== "all") {

        filtered =
            filtered.filter(
                (transaction) => {

                    return (
                        getTransactionCategory(
                            transaction
                        ).toLowerCase() ===
                        category.toLowerCase()
                    );
                }
            );
    }


    /*
    =====================================================
    ACCOUNT
    =====================================================
    */

    if (account !== "all") {

        filtered =
            filtered.filter(
                (transaction) => {

                    return (
                        String(
                            transaction.accountId ??
                            transaction.account?.id ??
                            ""
                        ) === String(account)
                    );
                }
            );
    }


    /*
    =====================================================
    SORT
    =====================================================
    */

    filtered.sort(
        (a, b) => {

            if (sort === "highest") {

                return (
                    Number(b.amount || 0) -
                    Number(a.amount || 0)
                );
            }


            if (sort === "lowest") {

                return (
                    Number(a.amount || 0) -
                    Number(b.amount || 0)
                );
            }


            const dateA =
                new Date(
                    a.transactionDate ||
                    a.createdAt ||
                    0
                ).getTime();


            const dateB =
                new Date(
                    b.transactionDate ||
                    b.createdAt ||
                    0
                ).getTime();


            if (sort === "oldest") {
                return dateA - dateB;
            }


            return dateB - dateA;
        }
    );


    updateResultText(
        filtered.length
    );


    /*
    =====================================================
    EMPTY STATE
    =====================================================
    */

    if (filtered.length === 0) {

        table.innerHTML = "";


        if (emptyState) {
            emptyState.classList.add(
                "visible"
            );
        }

        return;
    }


    if (emptyState) {

        emptyState.classList.remove(
            "visible"
        );
    }


    table.innerHTML =
        filtered
            .map(createTransactionRow)
            .join("");
}


/*
=========================================================
CREATE TRANSACTION ROW
=========================================================
*/

function createTransactionRow(transaction) {

    const id =
        transaction.id;


    const type =
        String(
            transaction.type ||
            "EXPENSE"
        ).toUpperCase();


    const isIncome =
        type === "INCOME";


    const amount =
        Number(
            transaction.amount || 0
        );


    const title =
        transaction.title ||
        transaction.description ||
        "Untitled Transaction";


    const category =
        getTransactionCategory(
            transaction
        ) ||
        "Uncategorized";


    const account =
        getTransactionAccount(
            transaction
        ) ||
        "Unknown";


    const date =
        formatDisplayDate(
            transaction.transactionDate
        );


    const icon =
        isIncome
            ? "fa-arrow-down"
            : "fa-arrow-up";


    const amountClass =
        isIncome
            ? "amount-income"
            : "amount-expense";


    const typeClass =
        isIncome
            ? "income"
            : "expense";


    const sign =
        isIncome
            ? "+"
            : "-";


    return `

        <tr data-id="${escapeHTML(id)}">

            <td>
                ${escapeHTML(date)}
            </td>


            <td>

                <div class="transaction-name">

                    <div
                        class="transaction-icon ${typeClass}"
                    >

                        <i
                            class="fa-solid ${icon}"
                        ></i>

                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(title)}
                        </strong>


                        ${
                            transaction.reference
                                ? `
                                    <small>
                                        ${escapeHTML(
                                            transaction.reference
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </td>


            <td>

                <span class="category-badge">

                    ${escapeHTML(category)}

                </span>

            </td>


            <td>

                <span class="account-name">

                    ${escapeHTML(account)}

                </span>

            </td>


            <td>

                <span
                    class="type-badge ${typeClass}"
                >

                    ${
                        isIncome
                            ? "Income"
                            : "Expense"
                    }

                </span>

            </td>


            <td>

                <strong
                    class="${amountClass}"
                >

                    ${sign}${formatCurrency(amount)}

                </strong>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="action-button"
                        onclick="editTransaction(${Number(id)})"
                        title="Edit"
                        aria-label="Edit transaction"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="action-button delete"
                        onclick="deleteTransaction(${Number(id)})"
                        title="Delete"
                        aria-label="Delete transaction"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;
}


/*
=========================================================
EDIT TRANSACTION
=========================================================
*/

function editTransaction(id) {

    const transaction =
        transactions.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );


    if (!transaction) {

        showMessage(
            "Transaction not found.",
            "error"
        );

        return;
    }


    openTransactionModal(
        transaction
    );
}


/*
=========================================================
DELETE TRANSACTION
=========================================================
*/

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            (item) =>
                Number(item.id) ===
                Number(id)
        );


    if (!transaction) {

        showMessage(
            "Transaction not found.",
            "error"
        );

        return;
    }


    deletingTransactionId =
        id;


    const overlay =
        document.getElementById(
            "confirmOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.add(
        "active"
    );


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


/*
=========================================================
CLOSE DELETE CONFIRMATION
=========================================================
*/

function closeDeleteConfirmation() {

    const overlay =
        document.getElementById(
            "confirmOverlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    deletingTransactionId =
        null;


    document.body.style.overflow =
        "";
}


/*
=========================================================
CONFIRM DELETE
=========================================================
*/

async function confirmDeleteTransaction() {

    if (!deletingTransactionId) {

        closeDeleteConfirmation();

        return;
    }


    const id =
        deletingTransactionId;


    const deleteButton =
        document.getElementById(
            "confirmDelete"
        );


    try {

        if (deleteButton) {

            deleteButton.disabled =
                true;

            deleteButton.textContent =
                "Deleting...";
        }


        /*
        IMPORTANT:
        Current API:

        FinanceAPI.transactions.delete(id)
        */

        await FinanceAPI.transactions.delete(
            id
        );


        closeDeleteConfirmation();


        showMessage(
            "Transaction deleted successfully.",
            "success"
        );


        await loadTransactions();

        renderTransactions();

        updateStatistics();

    } catch (error) {

        console.error(
            "Transaction deletion failed:",
            error
        );


        showMessage(
            getErrorMessage(error),
            "error"
        );

    } finally {

        if (deleteButton) {

            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "Delete";
        }
    }
}


/*
=========================================================
STATISTICS
=========================================================
*/

function updateStatistics() {

    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(
        (transaction) => {

            const amount =
                Number(
                    transaction.amount || 0
                );


            const type =
                String(
                    transaction.type || ""
                ).toUpperCase();


            if (type === "INCOME") {

                totalIncome +=
                    amount;

            } else {

                totalExpenses +=
                    amount;
            }
        }
    );


    const netBalance =
        totalIncome -
        totalExpenses;


    setText(
        "totalTransactions",
        transactions.length
    );


    setText(
        "totalIncome",
        formatCurrency(
            totalIncome
        )
    );


    setText(
        "totalExpenses",
        formatCurrency(
            totalExpenses
        )
    );


    setText(
        "netBalance",
        formatCurrency(
            netBalance
        )
    );


    const netElement =
        document.getElementById(
            "netBalance"
        );


    if (netElement) {

        netElement.style.color =
            netBalance >= 0
                ? "var(--green)"
                : "var(--red)";
    }
}


/*
=========================================================
RESULT TEXT
=========================================================
*/

function updateResultText(count) {

    const resultText =
        document.getElementById(
            "resultText"
        );


    if (!resultText) {
        return;
    }


    resultText.textContent =
        `${count} ${
            count === 1
                ? "transaction"
                : "transactions"
        }`;
}


/*
=========================================================
CLEAR FILTERS
=========================================================
*/

function clearAllFilters() {

    const search =
        document.getElementById(
            "searchInput"
        );


    const type =
        document.getElementById(
            "typeFilter"
        );


    const category =
        document.getElementById(
            "categoryFilter"
        );


    const account =
        document.getElementById(
            "accountFilter"
        );


    const sort =
        document.getElementById(
            "sortFilter"
        );


    if (search) {
        search.value = "";
    }


    if (type) {
        type.value = "all";
    }


    if (category) {
        category.value = "all";
    }


    if (account) {
        account.value = "all";
    }


    if (sort) {
        sort.value = "newest";
    }


    renderTransactions();
}


/*
=========================================================
REFRESH
=========================================================
*/

async function refreshTransactions() {

    const button =
        document.getElementById(
            "refreshButton"
        );


    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>`;
        }


        await Promise.all([
            loadAccounts(),
            loadTransactions()
        ]);


        categories = [];


        populateAccountFilter();
        populateCategoryFilter();

        renderTransactions();

        updateStatistics();


        showMessage(
            "Transactions refreshed.",
            "success"
        );

    } catch (error) {

        console.error(
            "Refresh failed:",
            error
        );


        showMessage(
            "Unable to refresh transactions.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                `<i class="fa-solid fa-rotate"></i>`;
        }
    }
}


/*
=========================================================
EXPORT CSV
=========================================================
*/

function exportTransactionsCSV() {

    if (transactions.length === 0) {

        showMessage(
            "There are no transactions to export.",
            "error"
        );

        return;
    }


    const rows = [];


    rows.push([
        "Date",
        "Transaction",
        "Category",
        "Account",
        "Type",
        "Amount",
        "Notes",
        "Reference"
    ]);


    transactions.forEach(
        (transaction) => {

            rows.push([

                formatDisplayDate(
                    transaction.transactionDate
                ),

                transaction.title ||
                transaction.description ||
                "",

                getTransactionCategory(
                    transaction
                ),

                getTransactionAccount(
                    transaction
                ),

                transaction.type ||
                "",

                Number(
                    transaction.amount || 0
                ).toFixed(2),

                transaction.notes ||
                "",

                transaction.reference ||
                ""
            ]);
        }
    );


    const csv =
        rows
            .map(
                (row) =>
                    row
                        .map(csvEscape)
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "finance-transactions.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showMessage(
        "Transactions exported successfully.",
        "success"
    );
}


/*
=========================================================
CSV ESCAPE
=========================================================
*/

function csvEscape(value) {

    const text =
        String(value ?? "");


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;
    }


    return text;
}


/*
=========================================================
TRANSACTION CATEGORY
=========================================================
*/

function getTransactionCategory(
    transaction
) {

    if (
        transaction.category &&
        typeof transaction.category ===
            "object"
    ) {

        return (
            transaction.category.name ||
            transaction.category.categoryName ||
            transaction.category.title ||
            ""
        );
    }


    return String(
        transaction.categoryName ||
        transaction.category ||
        ""
    );
}


/*
=========================================================
TRANSACTION ACCOUNT
=========================================================
*/

function getTransactionAccount(
    transaction
) {

    if (
        transaction.account &&
        typeof transaction.account ===
            "object"
    ) {

        return (
            transaction.account.name ||
            transaction.account.accountName ||
            transaction.account.title ||
            ""
        );
    }


    const account =
        accounts.find(
            (item) =>
                Number(item.id) ===
                Number(
                    transaction.accountId
                )
        );


    if (account) {

        return (
            account.name ||
            account.accountName ||
            account.title ||
            ""
        );
    }


    return String(
        transaction.accountName ||
        ""
    );
}


/*
=========================================================
FORMAT CURRENCY
=========================================================
*/

function formatCurrency(amount) {

    const value =
        Number(amount || 0);


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


/*
=========================================================
FORMAT DATE
=========================================================
*/

function formatDisplayDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);
    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);
}


/*
=========================================================
FORMAT DATE FOR INPUT
=========================================================
*/

function formatDateForInput(value) {

    if (!value) {
        return "";
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(value)
        )
    ) {

        return String(value);
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/*
=========================================================
TODAY DATE
=========================================================
*/

function getTodayDate() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/*
=========================================================
GET VALUE
=========================================================
*/

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value.trim()
        : "";
}


/*
=========================================================
SET TEXT
=========================================================
*/

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


/*
=========================================================
MODAL MESSAGE
=========================================================
*/

function showModalMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "modalMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `modal-message visible ${type}`;
}


/*
=========================================================
CLEAR MODAL MESSAGE
=========================================================
*/

function clearModalMessage() {

    const element =
        document.getElementById(
            "modalMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        "";


    element.className =
        "modal-message";
}


/*
=========================================================
TOAST MESSAGE
=========================================================
*/

function showMessage(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    const toastIcon =
        document.getElementById(
            "toastIcon"
        );


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            message;
    }


    toast.classList.remove(
        "error"
    );


    if (type === "error") {

        toast.classList.add(
            "error"
        );
    }


    if (toastIcon) {

        toastIcon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";
    }


    toast.classList.add(
        "visible"
    );


    clearTimeout(
        window.financeToastTimer
    );


    window.financeToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "visible"
                );

            },
            3000
        );
}


/*
=========================================================
SET VALUE
=========================================================
*/

function setValue(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";
    }
}


/*
=========================================================
ESCAPE HTML
=========================================================
*/

function escapeHTML(value) {

    return String(value ?? "")
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


/*
=========================================================
ERROR MESSAGE
=========================================================
*/

function getErrorMessage(error) {

    if (!error) {
        return "Something went wrong.";
    }


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
        error.data &&
        error.data.message
    ) {

        return error.data.message;
    }


    if (
        error.data &&
        error.data.error
    ) {

        return error.data.error;
    }


    if (error.message) {
        return error.message;
    }


    return "Something went wrong.";
}


/*
=========================================================
LOGOUT
=========================================================
*/

async function logoutUser() {

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
            "Server logout failed:",
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
                "Logout cleanup failed.",
                error
            );
        }


        window.location.href =
            "login.html";
    }
}


/*
=========================================================
LOGOUT BUTTON
=========================================================
*/

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutUser
    );
}
