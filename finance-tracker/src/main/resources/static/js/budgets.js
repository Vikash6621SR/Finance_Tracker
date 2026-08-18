"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const menuButton = document.getElementById("menuButton");
    const closeSidebar = document.getElementById("closeSidebar");

    const logoutButton = document.getElementById("logoutButton");
    const refreshButton = document.getElementById("refreshButton");

    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");
    const userAvatar = document.getElementById("userAvatar");

    const totalBudget = document.getElementById("totalBudget");
    const totalSpent = document.getElementById("totalSpent");
    const remainingBudget = document.getElementById("remainingBudget");
    const activeBudgets = document.getElementById("activeBudgets");

    const searchInput = document.getElementById("searchInput");
    const periodFilter = document.getElementById("periodFilter");
    const clearFilters = document.getElementById("clearFilters");

    const budgetGrid = document.getElementById("budgetGrid");
    const emptyState = document.getElementById("emptyState");
    const resultText = document.getElementById("resultText");

    const addBudgetButton = document.getElementById("addBudgetButton");
    const panelAddButton = document.getElementById("panelAddButton");
    const emptyAddButton = document.getElementById("emptyAddButton");

    const budgetModal = document.getElementById("budgetModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalClose = document.getElementById("modalClose");
    const cancelButton = document.getElementById("cancelButton");
    const modalMessage = document.getElementById("modalMessage");

    const budgetForm = document.getElementById("budgetForm");
    const budgetId = document.getElementById("budgetId");
    const budgetName = document.getElementById("budgetName");
    const budgetCategory = document.getElementById("budgetCategory");
    const budgetPeriod = document.getElementById("budgetPeriod");
    const budgetAmount = document.getElementById("budgetAmount");
    const budgetDescription = document.getElementById("budgetDescription");
    const saveButton = document.getElementById("saveButton");

    const confirmOverlay = document.getElementById("confirmOverlay");
    const confirmCancel = document.getElementById("confirmCancel");
    const confirmDelete = document.getElementById("confirmDelete");

    const toast = document.getElementById("toast");
    const toastIcon = document.getElementById("toastIcon");
    const toastMessage = document.getElementById("toastMessage");


    /* =========================================================
       STATE
    ========================================================= */

    let budgets = [];
    let transactions = [];

    let editingId = null;
    let deletingId = null;

    let toastTimer = null;


    /* =========================================================
       API CHECK
    ========================================================= */

    if (
        typeof FinanceAPI === "undefined" ||
        !FinanceAPI.budgets
    ) {

        console.error(
            "budgets.js: FinanceAPI.budgets was not found."
        );

        showToast(
            "Finance API is not loaded.",
            "error"
        );

        return;
    }


    /* =========================================================
       INITIALIZE
    ========================================================= */

    init();


    async function init() {

        setupEvents();

        setupSidebar();

        await loadUser();

        await Promise.all([
            loadBudgets(),
            loadTransactions()
        ]);
    }


    /* =========================================================
       EVENTS
    ========================================================= */

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

        logoutButton?.addEventListener(
            "click",
            handleLogout
        );

        refreshButton?.addEventListener(
            "click",
            refreshData
        );

        addBudgetButton?.addEventListener(
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

        budgetModal?.addEventListener(
            "click",
            event => {

                if (
                    event.target === budgetModal
                ) {

                    closeModal();
                }
            }
        );

        budgetForm?.addEventListener(
            "submit",
            handleSubmit
        );

        searchInput?.addEventListener(
            "input",
            renderBudgets
        );

        periodFilter?.addEventListener(
            "change",
            renderBudgets
        );

        clearFilters?.addEventListener(
            "click",
            clearFiltersHandler
        );

        confirmCancel?.addEventListener(
            "click",
            closeConfirm
        );

        confirmDelete?.addEventListener(
            "click",
            deleteBudget
        );

        confirmOverlay?.addEventListener(
            "click",
            event => {

                if (
                    event.target === confirmOverlay
                ) {

                    closeConfirm();
                }
            }
        );

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    closeModal();

                    closeConfirm();

                    closeSidebarMenu();
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {

                if (window.innerWidth > 950) {

                    closeSidebarMenu();
                }
            }
        );
    }


    /* =========================================================
       SIDEBAR
    ========================================================= */

    function setupSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar
            .querySelectorAll(".nav-link")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        if (
                            window.innerWidth <= 950
                        ) {

                            closeSidebarMenu();
                        }
                    }
                );
            });
    }


    function openSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar.classList.add("open");

        sidebarOverlay?.classList.add("active");

        menuButton?.setAttribute(
            "aria-expanded",
            "true"
        );

        document.body.style.overflow = "hidden";
    }


    function closeSidebarMenu() {

        sidebar?.classList.remove("open");

        sidebarOverlay?.classList.remove("active");

        menuButton?.setAttribute(
            "aria-expanded",
            "false"
        );

        if (
            !budgetModal?.classList.contains("show") &&
            !confirmOverlay?.classList.contains("show")
        ) {

            document.body.style.overflow = "";
        }
    }


    /* =========================================================
       USER DISPLAY
       
       The current FinanceAPI provided earlier does not have
       auth.me(), so we do not call a non-existing endpoint.
       
       If user information exists in localStorage, display it.
    ========================================================= */

    async function loadUser() {

        try {

            let user = null;

            const possibleKeys = [
                "financeUser",
                "foodexpress_user",
                "user",
                "currentUser"
            ];

            for (
                const key of possibleKeys
            ) {

                const stored =
                    localStorage.getItem(key);

                if (!stored) {
                    continue;
                }

                try {

                    user =
                        JSON.parse(stored);

                } catch {

                    user = {
                        name: stored
                    };
                }

                if (user) {
                    break;
                }
            }


            if (!user) {

                setDefaultUser();

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
                "Could not load user information.",
                error
            );

            setDefaultUser();
        }
    }


    function setDefaultUser() {

        if (userName) {

            userName.textContent =
                "User";
        }

        if (userEmail) {

            userEmail.textContent =
                "Finance Account";
        }

        if (userAvatar) {

            userAvatar.textContent =
                "U";
        }
    }


    function getInitials(name) {

        const parts =
            String(name || "User")
                .trim()
                .split(/\s+/);

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


    /* =========================================================
       LOAD BUDGETS

       IMPORTANT:
       Uses FinanceAPI.budgets.getAll()
       ========================================================= */

    async function loadBudgets() {

        showLoading();

        try {

            const response =
                await FinanceAPI.budgets.getAll();


            budgets =
                extractArray(
                    response,
                    [
                        "budgets",
                        "data",
                        "content"
                    ]
                )
                .map(
                    normalizeBudget
                )
                .filter(Boolean);


            updateSummary();

            renderBudgets();

        } catch (error) {

            console.error(
                "Could not load budgets:",
                error
            );


            budgets = [];

            updateSummary();

            showLoadError(error);
        }
    }


    /* =========================================================
       LOAD TRANSACTIONS

       Used to calculate budget spending.
       ========================================================= */

    async function loadTransactions() {

        try {

            const response =
                await FinanceAPI.transactions.getAll();


            transactions =
                extractArray(
                    response,
                    [
                        "transactions",
                        "data",
                        "content"
                    ]
                );

        } catch (error) {

            console.warn(
                "Could not load transactions.",
                error
            );

            transactions = [];
        }
    }


    /* =========================================================
       REFRESH
    ========================================================= */

    async function refreshData() {

        if (refreshButton) {

            refreshButton.disabled = true;

            refreshButton
                .querySelector("i")
                ?.classList.add("fa-spin");
        }


        try {

            await Promise.all([
                loadBudgets(),
                loadTransactions()
            ]);


            updateSummary();

            renderBudgets();


            showToast(
                "Budgets refreshed."
            );

        } catch (error) {

            showToast(
                getErrorMessage(error),
                "error"
            );

        } finally {

            if (refreshButton) {

                refreshButton.disabled = false;

                refreshButton
                    .querySelector("i")
                    ?.classList.remove("fa-spin");
            }
        }
    }


    /* =========================================================
       NORMALIZE BUDGET
    ========================================================= */

    function normalizeBudget(item) {

        if (
            !item ||
            typeof item !== "object"
        ) {

            return null;
        }


        return {

            id:
                item.id ??
                item.budgetId ??
                item.budget_id,


            name:
                item.name ??
                item.budgetName ??
                item.title ??
                "Budget",


            category:
                item.category ??
                item.categoryName ??
                "Other",


            period:
                normalizePeriod(
                    item.period ??
                    item.budgetPeriod ??
                    item.frequency ??
                    "MONTHLY"
                ),


            amount:
                Number(
                    item.amount ??
                    item.budgetAmount ??
                    item.limit ??
                    item.total ??
                    0
                ) || 0,


            spent:
                Number(
                    item.spent ??
                    item.usedAmount ??
                    item.used ??
                    0
                ) || 0,


            description:
                item.description ??
                item.notes ??
                ""
        };
    }


    /* =========================================================
       EXTRACT ARRAY
    ========================================================= */

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


    /* =========================================================
       CALCULATE SPENT
    ========================================================= */

    function calculateSpent(
        budget
    ) {

        /*
         * If backend already provides spent,
         * use it.
         */

        if (
            Number(budget.spent) > 0
        ) {

            return Number(
                budget.spent
            );
        }


        const category =
            String(
                budget.category || ""
            )
            .trim()
            .toLowerCase();


        return transactions
            .filter(
                transaction => {

                    const type =
                        String(
                            transaction.type ||
                            transaction.transactionType ||
                            ""
                        )
                        .toLowerCase();


                    const transactionCategory =
                        getTransactionCategory(
                            transaction
                        );


                    return (
                        (
                            type === "expense" ||
                            type === "debit"
                        ) &&
                        transactionCategory ===
                        category
                    );
                }
            )
            .reduce(
                (
                    total,
                    transaction
                ) => {

                    return (
                        total +
                        (
                            Number(
                                transaction.amount
                            ) || 0
                        )
                    );
                },
                0
            );
    }


    function getTransactionCategory(
        transaction
    ) {

        if (
            transaction.category &&
            typeof transaction.category ===
            "object"
        ) {

            return String(
                transaction.category.name ||
                transaction.category.categoryName ||
                transaction.category.title ||
                ""
            )
            .trim()
            .toLowerCase();
        }


        return String(
            transaction.categoryName ||
            transaction.category ||
            ""
        )
        .trim()
        .toLowerCase();
    }


    /* =========================================================
       SUMMARY
    ========================================================= */

    function updateSummary() {

        const total =
            budgets.reduce(
                (
                    sum,
                    budget
                ) => {

                    return (
                        sum +
                        Number(
                            budget.amount
                        )
                    );
                },
                0
            );


        const spent =
            budgets.reduce(
                (
                    sum,
                    budget
                ) => {

                    return (
                        sum +
                        calculateSpent(
                            budget
                        )
                    );
                },
                0
            );


        const remaining =
            total - spent;


        if (totalBudget) {

            totalBudget.textContent =
                formatCurrency(total);
        }


        if (totalSpent) {

            totalSpent.textContent =
                formatCurrency(spent);
        }


        if (remainingBudget) {

            remainingBudget.textContent =
                formatCurrency(
                    Math.max(
                        remaining,
                        0
                    )
                );
        }


        if (activeBudgets) {

            activeBudgets.textContent =
                budgets.length;
        }
    }


    /* =========================================================
       RENDER BUDGETS
    ========================================================= */

    function renderBudgets() {

        if (!budgetGrid) {

            return;
        }


        const search =
            String(
                searchInput?.value || ""
            )
            .trim()
            .toLowerCase();


        const period =
            periodFilter?.value ||
            "all";


        const filtered =
            budgets.filter(
                budget => {

                    const matchesSearch =
                        !search ||
                        String(
                            budget.name
                        )
                        .toLowerCase()
                        .includes(search) ||
                        String(
                            budget.category
                        )
                        .toLowerCase()
                        .includes(search);


                    const matchesPeriod =
                        period === "all" ||
                        budget.period ===
                        period;


                    return (
                        matchesSearch &&
                        matchesPeriod
                    );
                }
            );


        budgetGrid.innerHTML = "";


        if (
            budgets.length === 0
        ) {

            budgetGrid.style.display =
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
                    "No budgets yet";
            }


            if (paragraph) {

                paragraph.textContent =
                    "Create your first budget to start controlling your spending.";
            }


            if (resultText) {

                resultText.textContent =
                    "0 budgets";
            }


            return;
        }


        if (
            filtered.length === 0
        ) {

            budgetGrid.style.display =
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
                    "No matching budgets";
            }


            if (paragraph) {

                paragraph.textContent =
                    "Try changing your search or period filter.";
            }


            if (resultText) {

                resultText.textContent =
                    "0 matching budgets";
            }


            return;
        }


        budgetGrid.style.display =
            "grid";


        emptyState?.classList.remove(
            "show"
        );


        if (resultText) {

            resultText.textContent =
                filtered.length +
                (
                    filtered.length === 1
                        ? " budget"
                        : " budgets"
                );
        }


        filtered.forEach(
            budget => {

                budgetGrid.appendChild(
                    createBudgetCard(
                        budget
                    )
                );
            }
        );
    }


    /* =========================================================
       CREATE BUDGET CARD
    ========================================================= */

    function createBudgetCard(
        budget
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "budget-card";


        const spent =
            calculateSpent(
                budget
            );


        const amount =
            Number(
                budget.amount
            ) || 0;


        const percentage =
            amount > 0
                ? (
                    spent /
                    amount
                ) * 100
                : 0;


        const safePercentage =
            Math.min(
                Math.max(
                    percentage,
                    0
                ),
                100
            );


        let progressClass =
            "";


        if (
            percentage >= 100
        ) {

            progressClass =
                "danger";

        } else if (
            percentage >= 80
        ) {

            progressClass =
                "warning";
        }


        const remaining =
            Math.max(
                amount - spent,
                0
            );


        card.innerHTML = `

            <div class="budget-top">

                <div class="budget-icon">

                    <i class="fa-solid fa-wallet"></i>

                </div>


                <div class="budget-actions">

                    <button
                        class="budget-action edit"
                        type="button"
                        title="Edit budget"
                        aria-label="Edit budget"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="budget-action delete"
                        type="button"
                        title="Delete budget"
                        aria-label="Delete budget"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>


            <h3 class="budget-name">

                ${escapeHtml(
                    budget.name
                )}

            </h3>


            <span class="budget-category">

                ${escapeHtml(
                    budget.category
                )}

                ·

                ${escapeHtml(
                    formatPeriod(
                        budget.period
                    )
                )}

            </span>


            <div class="budget-values">

                <div>

                    <span>
                        SPENT
                    </span>

                    <strong>
                        ${formatCurrency(
                            spent
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        LIMIT
                    </span>

                    <strong>
                        ${formatCurrency(
                            amount
                        )}
                    </strong>

                </div>

            </div>


            <div class="progress-track">

                <div
                    class="progress-bar ${progressClass}"
                    style="width:${safePercentage}%"
                ></div>

            </div>


            <div class="progress-text">

                <span>
                    ${percentage.toFixed(0)}% used
                </span>

                <span>
                    ${formatCurrency(
                        remaining
                    )} left
                </span>

            </div>


            <p class="budget-description">

                ${escapeHtml(
                    budget.description ||
                    "No description added."
                )}

            </p>

        `;


        card
            .querySelector(".edit")
            ?.addEventListener(
                "click",
                () => {

                    openEditModal(
                        budget
                    );
                }
            );


        card
            .querySelector(".delete")
            ?.addEventListener(
                "click",
                () => {

                    openConfirm(
                        budget
                    );
                }
            );


        return card;
    }


    /* =========================================================
       ADD MODAL
    ========================================================= */

    function openAddModal() {

        editingId = null;


        budgetForm?.reset();


        if (budgetId) {

            budgetId.value = "";
        }


        if (modalTitle) {

            modalTitle.textContent =
                "Add Budget";
        }


        if (saveButton) {

            saveButton.textContent =
                "Save Budget";
        }


        hideModalMessage();


        budgetModal?.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            () => {

                budgetName?.focus();

            },
            100
        );
    }


    /* =========================================================
       EDIT MODAL
    ========================================================= */

    function openEditModal(
        budget
    ) {

        editingId =
            budget.id;


        if (budgetId) {

            budgetId.value =
                budget.id ?? "";
        }


        if (budgetName) {

            budgetName.value =
                budget.name ?? "";
        }


        if (budgetCategory) {

            budgetCategory.value =
                budget.category ?? "";
        }


        if (budgetPeriod) {

            budgetPeriod.value =
                budget.period ??
                "MONTHLY";
        }


        if (budgetAmount) {

            budgetAmount.value =
                budget.amount ?? 0;
        }


        if (budgetDescription) {

            budgetDescription.value =
                budget.description ?? "";
        }


        if (modalTitle) {

            modalTitle.textContent =
                "Edit Budget";
        }


        if (saveButton) {

            saveButton.textContent =
                "Update Budget";
        }


        hideModalMessage();


        budgetModal?.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(
            () => {

                budgetName?.focus();

            },
            100
        );
    }


    /* =========================================================
       CLOSE MODAL
    ========================================================= */

    function closeModal() {

        budgetModal?.classList.remove(
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


    /* =========================================================
       SAVE / UPDATE BUDGET
       
       IMPORTANT:
       FinanceAPI.budgets.create()
       FinanceAPI.budgets.update()
    ========================================================= */

    async function handleSubmit(event) {

    event.preventDefault();

    const name =
        budgetName?.value.trim() || "";

    const category =
        budgetCategory?.value.trim() || "";

    const period =
        normalizePeriod(
            budgetPeriod?.value
        );

    const amount =
        Number(
            budgetAmount?.value
        );

    const description =
        budgetDescription?.value.trim() || "";


    // =========================================================
    // FRONTEND VALIDATION
    // =========================================================

    if (!name) {

        showModalMessage(
            "Please enter a budget name."
        );

        budgetName?.focus();

        return;
    }


    if (!category) {

        showModalMessage(
            "Please enter a category."
        );

        budgetCategory?.focus();

        return;
    }


    if (!period) {

        showModalMessage(
            "Please select a budget period."
        );

        budgetPeriod?.focus();

        return;
    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showModalMessage(
            "Please enter a valid budget amount greater than zero."
        );

        budgetAmount?.focus();

        return;
    }


    // =========================================================
    // CALCULATE START / END DATES
    // =========================================================

    const today = new Date();

    let startDate;
    let endDate;


    if (period === "WEEKLY") {

        const day =
            today.getDay();

        const difference =
            day === 0
                ? 6
                : day - 1;

        const start =
            new Date(today);

        start.setDate(
            today.getDate() - difference
        );

        const end =
            new Date(start);

        end.setDate(
            start.getDate() + 6
        );

        startDate =
            formatDate(start);

        endDate =
            formatDate(end);

    } else if (period === "YEARLY") {

        startDate =
            `${today.getFullYear()}-01-01`;

        endDate =
            `${today.getFullYear()}-12-31`;

    } else {

        // MONTHLY
        // Also used as a safe fallback for CUSTOM
        const year =
            today.getFullYear();

        const month =
            today.getMonth();

        const start =
            new Date(
                year,
                month,
                1
            );

        const end =
            new Date(
                year,
                month + 1,
                0
            );

        startDate =
            formatDate(start);

        endDate =
            formatDate(end);
    }


    // =========================================================
    // API PAYLOAD
    // IMPORTANT:
    // Only send fields that BudgetRequest accepts.
    // =========================================================

    const payload = {

        name: name,

        category: category,

        amount: amount,

        period: period,

        startDate: startDate,

        endDate: endDate,

        active: true
    };


    console.log(
        "Budget payload:",
        payload
    );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            editingId
                ? "Updating..."
                : "Saving...";
    }


    try {

        if (
            editingId !== null &&
            editingId !== undefined
        ) {

            await FinanceAPI.budgets.update(
                editingId,
                payload
            );

            showToast(
                "Budget updated successfully."
            );

        } else {

            await FinanceAPI.budgets.create(
                payload
            );

            showToast(
                "Budget created successfully."
            );
        }


        closeModal();

        await loadBudgets();

        updateSummary();

        renderBudgets();


    } catch (error) {

        console.error(
            "Budget save failed:",
            error
        );

        showModalMessage(
            getErrorMessage(error)
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                editingId
                    ? "Update Budget"
                    : "Save Budget";
        }
    }
}


/* =========================================================
   FORMAT DATE AS YYYY-MM-DD
   ========================================================= */

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}

    /* =========================================================
       DELETE CONFIRMATION
    ========================================================= */

    function openConfirm(
        budget
    ) {

        deletingId =
            budget.id;


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
            !budgetModal?.classList.contains(
                "show"
            )
        ) {

            document.body.style.overflow =
                "";
        }
    }


    /* =========================================================
       DELETE BUDGET
       
       IMPORTANT:
       FinanceAPI.budgets.delete(id)
    ========================================================= */

    async function deleteBudget() {

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
             * CORRECT:
             *
             * FinanceAPI.budgets.delete(id)
             */

            await FinanceAPI.budgets.delete(
                id
            );


            closeConfirm();


            showToast(
                "Budget deleted successfully."
            );


            await loadBudgets();


            updateSummary();


            renderBudgets();

        } catch (error) {

            console.error(
                "Budget deletion failed:",
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


    /* =========================================================
       FILTERS
    ========================================================= */

    function clearFiltersHandler() {

        if (searchInput) {

            searchInput.value = "";
        }


        if (periodFilter) {

            periodFilter.value =
                "all";
        }


        renderBudgets();
    }


    /* =========================================================
       PERIOD
    ========================================================= */

    function normalizePeriod(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toUpperCase()
        .replace(
            /[\s-]+/g,
            "_"
        );
    }


    function formatPeriod(
        period
    ) {

        const names = {

            MONTHLY:
                "Monthly",

            WEEKLY:
                "Weekly",

            YEARLY:
                "Yearly",

            DAILY:
                "Daily"
        };


        return (
            names[period] ||
            String(
                period || ""
            )
            .replace(
                /_/g,
                " "
            )
        );
    }


    /* =========================================================
       CURRENCY
    ========================================================= */

    function formatCurrency(
        amount
    ) {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",

                currency: "INR",

                minimumFractionDigits: 2,

                maximumFractionDigits: 2
            }
        ).format(
            Number(amount) || 0
        );
    }


    /* =========================================================
       LOADING
    ========================================================= */

    function showLoading() {

        if (!budgetGrid) {

            return;
        }


        budgetGrid.style.display =
            "grid";


        emptyState?.classList.remove(
            "show"
        );


        budgetGrid.innerHTML = `

            <div class="loading-state">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading budgets...

            </div>

        `;
    }


    function showLoadError(
        error
    ) {

        if (!budgetGrid) {

            return;
        }


        budgetGrid.style.display =
            "grid";


        emptyState?.classList.remove(
            "show"
        );


        budgetGrid.innerHTML = `

            <div class="loading-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                Unable to load budgets.

            </div>

        `;


        if (resultText) {

            resultText.textContent =
                "Unable to load budgets";
        }


        showToast(
            getErrorMessage(error),
            "error"
        );
    }


    /* =========================================================
       MODAL MESSAGE
    ========================================================= */

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


    /* =========================================================
       TOAST
    ========================================================= */

    function showToast(
        message,
        type = "success"
    ) {

        if (!toast) {

            return;
        }


        clearTimeout(
            toastTimer
        );


        if (toastMessage) {

            toastMessage.textContent =
                message;
        }


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
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                3200
            );
    }


    /* =========================================================
       ERROR MESSAGE
    ========================================================= */

    function getErrorMessage(
        error
    ) {

        if (
            error?.message
        ) {

            return error.message;
        }


        return (
            "Something went wrong. Please try again."
        );
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

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


    /* =========================================================
       LOGOUT
       
       Uses the current FinanceAPI.
    ========================================================= */

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
