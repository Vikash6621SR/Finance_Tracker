"use strict";


/* =====================================================
   FINANCE TRACKER
   RECURRING TRANSACTIONS
   ===================================================== */


/* =====================================================
   STATE
===================================================== */

let recurringTransactions = [];

let editingId = null;

let deletingId = null;

let toastTimer = null;


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeRecurringPage();

    }
);


async function initializeRecurringPage() {

    setupElements();

    setupEvents();

    setDefaultDate();

    await loadUser();

    await loadRecurring();

}


/* =====================================================
   ELEMENTS
===================================================== */

let sidebar;
let sidebarOverlay;
let menuButton;
let closeSidebarButton;

let logoutButton;
let refreshButton;

let userName;
let userEmail;
let userAvatar;

let totalRecurring;
let activeRecurring;
let pausedRecurring;
let totalAmount;

let searchInput;
let typeFilter;
let statusFilter;
let clearFilters;

let recurringGrid;
let emptyState;
let resultText;

let addRecurringButton;
let panelAddButton;
let emptyAddButton;

let recurringModal;
let modalTitle;
let modalClose;
let cancelButton;
let modalMessage;

let recurringForm;
let recurringId;
let recurringName;
let recurringType;
let recurringCategory;
let recurringAmount;
let recurringFrequency;
let recurringStartDate;
let recurringDescription;
let recurringActive;

let saveButton;

let confirmOverlay;
let confirmCancel;
let confirmDelete;

let toast;
let toastIcon;
let toastMessage;


function setupElements() {

    sidebar =
        document.getElementById(
            "sidebar"
        );

    sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );

    menuButton =
        document.getElementById(
            "menuButton"
        );

    closeSidebarButton =
        document.getElementById(
            "closeSidebar"
        );


    logoutButton =
        document.getElementById(
            "logoutButton"
        );

    refreshButton =
        document.getElementById(
            "refreshButton"
        );


    userName =
        document.getElementById(
            "userName"
        );

    userEmail =
        document.getElementById(
            "userEmail"
        );

    userAvatar =
        document.getElementById(
            "userAvatar"
        );


    totalRecurring =
        document.getElementById(
            "totalRecurring"
        );

    activeRecurring =
        document.getElementById(
            "activeRecurring"
        );

    pausedRecurring =
        document.getElementById(
            "pausedRecurring"
        );

    totalAmount =
        document.getElementById(
            "totalAmount"
        );


    searchInput =
        document.getElementById(
            "searchInput"
        );

    typeFilter =
        document.getElementById(
            "typeFilter"
        );

    statusFilter =
        document.getElementById(
            "statusFilter"
        );

    clearFilters =
        document.getElementById(
            "clearFilters"
        );


    recurringGrid =
        document.getElementById(
            "recurringGrid"
        );

    emptyState =
        document.getElementById(
            "emptyState"
        );

    resultText =
        document.getElementById(
            "resultText"
        );


    addRecurringButton =
        document.getElementById(
            "addRecurringButton"
        );

    panelAddButton =
        document.getElementById(
            "panelAddButton"
        );

    emptyAddButton =
        document.getElementById(
            "emptyAddButton"
        );


    recurringModal =
        document.getElementById(
            "recurringModal"
        );

    modalTitle =
        document.getElementById(
            "modalTitle"
        );

    modalClose =
        document.getElementById(
            "modalClose"
        );

    cancelButton =
        document.getElementById(
            "cancelButton"
        );

    modalMessage =
        document.getElementById(
            "modalMessage"
        );


    recurringForm =
        document.getElementById(
            "recurringForm"
        );

    recurringId =
        document.getElementById(
            "recurringId"
        );

    recurringName =
        document.getElementById(
            "recurringName"
        );

    recurringType =
        document.getElementById(
            "recurringType"
        );

    recurringCategory =
        document.getElementById(
            "recurringCategory"
        );

    recurringAmount =
        document.getElementById(
            "recurringAmount"
        );

    recurringFrequency =
        document.getElementById(
            "recurringFrequency"
        );

    recurringStartDate =
        document.getElementById(
            "recurringStartDate"
        );

    recurringDescription =
        document.getElementById(
            "recurringDescription"
        );

    recurringActive =
        document.getElementById(
            "recurringActive"
        );

    saveButton =
        document.getElementById(
            "saveButton"
        );


    confirmOverlay =
        document.getElementById(
            "confirmOverlay"
        );

    confirmCancel =
        document.getElementById(
            "confirmCancel"
        );

    confirmDelete =
        document.getElementById(
            "confirmDelete"
        );


    toast =
        document.getElementById(
            "toast"
        );

    toastIcon =
        document.getElementById(
            "toastIcon"
        );

    toastMessage =
        document.getElementById(
            "toastMessage"
        );
}


/* =====================================================
   API CHECK
===================================================== */

function isFinanceAPIReady() {

    return (
        window.FinanceAPI &&
        FinanceAPI.recurring &&
        typeof FinanceAPI.recurring.getAll ===
            "function"
    );
}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {

    menuButton?.addEventListener(
        "click",
        openSidebar
    );


    closeSidebarButton?.addEventListener(
        "click",
        closeSidebar
    );


    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth >
                950
            ) {

                closeSidebar();
            }
        }
    );


    logoutButton?.addEventListener(
        "click",
        handleLogout
    );


    refreshButton?.addEventListener(
        "click",
        refreshData
    );


    addRecurringButton?.addEventListener(
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


    recurringModal?.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                recurringModal
            ) {

                closeModal();
            }
        }
    );


    recurringForm?.addEventListener(
        "submit",
        handleSubmit
    );


    searchInput?.addEventListener(
        "input",
        renderRecurring
    );


    typeFilter?.addEventListener(
        "change",
        renderRecurring
    );


    statusFilter?.addEventListener(
        "change",
        renderRecurring
    );


    clearFilters?.addEventListener(
        "click",
        function () {

            if (searchInput) {

                searchInput.value = "";
            }


            if (typeFilter) {

                typeFilter.value =
                    "all";
            }


            if (statusFilter) {

                statusFilter.value =
                    "all";
            }


            renderRecurring();
        }
    );


    confirmCancel?.addEventListener(
        "click",
        closeConfirm
    );


    confirmDelete?.addEventListener(
        "click",
        deleteRecurring
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

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

                closeConfirm();

                closeSidebar();
            }
        }
    );
}


/* =====================================================
   SIDEBAR
===================================================== */

function openSidebar() {

    if (!sidebar) {

        return;
    }


    sidebar.classList.add(
        "open"
    );


    sidebarOverlay?.classList.add(
        "active"
    );


    menuButton?.setAttribute(
        "aria-expanded",
        "true"
    );


    document.body.style.overflow =
        "hidden";
}


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );


    sidebarOverlay?.classList.remove(
        "active"
    );


    menuButton?.setAttribute(
        "aria-expanded",
        "false"
    );


    document.body.style.overflow =
        "";
}


/* =====================================================
   USER
===================================================== */

async function loadUser() {

    try {

        /*
         * Profile API is used here.
         */

        if (
            !window.FinanceAPI ||
            !FinanceAPI.profile ||
            typeof FinanceAPI.profile.get !==
                "function"
        ) {

            return;
        }


        const response =
            await FinanceAPI.profile.get();


        const user =
            response?.user ||
            response?.data ||
            response;


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
            "Could not load user.",
            error
        );
    }
}


function getInitials(
    name
) {

    const parts =
        String(name)
            .trim()
            .split(/\s+/);


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();
}


/* =====================================================
   DEFAULT DATE
===================================================== */

function setDefaultDate() {

    if (
        recurringStartDate &&
        !recurringStartDate.value
    ) {

        const today =
            new Date();


        recurringStartDate.value =
            today
                .toISOString()
                .split("T")[0];
    }
}


/* =====================================================
   LOAD RECURRING
===================================================== */

async function loadRecurring() {

    showLoading();


    try {

        if (
            !isFinanceAPIReady()
        ) {

            throw new Error(
                "FinanceAPI.recurring is not available. Check api.js."
            );
        }


        /*
         * CORRECT API CALL
         *
         * GET /api/recurring
         */

        const response =
            await FinanceAPI
                .recurring
                .getAll();


        const data =
            extractArray(
                response,
                [
                    "recurringTransactions",
                    "recurring",
                    "data",
                    "content"
                ]
            );


        recurringTransactions =
            data
                .map(
                    normalizeRecurring
                )
                .filter(Boolean);


        updateSummary();

        renderRecurring();

    } catch (error) {

        console.error(
            "Could not load recurring transactions:",
            error
        );


        recurringTransactions =
            [];


        updateSummary();


        if (recurringGrid) {

            recurringGrid.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Unable to load recurring transactions
                    </strong>

                    <span>
                        ${escapeHtml(
                            getErrorMessage(
                                error
                            )
                        )}
                    </span>

                    <button
                        type="button"
                        class="panel-add"
                        onclick="loadRecurring()"
                    >
                        Try Again
                    </button>

                </div>

            `;
        }


        if (resultText) {

            resultText.textContent =
                "Unable to load recurring transactions";
        }


        showToast(
            getErrorMessage(error),
            "error"
        );
    }
}


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeRecurring(
    item
) {

    if (
        !item ||
        typeof item !==
            "object"
    ) {

        return null;
    }


    return {

        id:
            item.id ??
            item.recurringId ??
            item.recurringTransactionId ??
            item.recurring_id ??
            null,


        name:
            item.name ??
            item.title ??
            item.description ??
            "Recurring Transaction",


        type:
            normalizeType(
                item.type ??
                item.transactionType ??
                "expense"
            ),


        category:
            item.category ??
            item.categoryName ??
            "Other",


        amount:
            Number(
                item.amount ??
                0
            ) || 0,


        frequency:
            normalizeFrequency(
                item.frequency ??
                item.interval ??
                item.period ??
                "MONTHLY"
            ),


        nextDate:
            item.nextDate ??
            item.startDate ??
            item.date ??
            item.nextPaymentDate ??
            "",


        description:
            item.description ??
            item.notes ??
            "",


        active:
            normalizeActive(
                item.active ??
                item.isActive ??
                item.enabled ??
                item.status
            )
    };
}


/* =====================================================
   ARRAY
===================================================== */

function extractArray(
    response,
    keys
) {

    if (
        Array.isArray(
            response
        )
    ) {

        return response;
    }


    if (
        response &&
        typeof response ===
            "object"
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
   NORMALIZERS
===================================================== */

function normalizeType(
    value
) {

    const type =
        String(
            value || ""
        )
        .trim()
        .toLowerCase();


    if (
        type === "income" ||
        type === "credit"
    ) {

        return "income";
    }


    return "expense";
}


function normalizeFrequency(
    value
) {

    const frequency =
        String(
            value || ""
        )
        .trim()
        .toUpperCase()
        .replace(
            /[\s-]+/g,
            "_"
        );


    const allowed = [

        "DAILY",

        "WEEKLY",

        "MONTHLY",

        "YEARLY"
    ];


    return allowed.includes(
        frequency
    )
        ? frequency
        : "MONTHLY";
}


function normalizeActive(
    value
) {

    if (
        typeof value ===
        "boolean"
    ) {

        return value;
    }


    if (
        typeof value ===
        "number"
    ) {

        return value !== 0;
    }


    const text =
        String(
            value ?? ""
        )
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

    const total =
        recurringTransactions.length;


    const active =
        recurringTransactions
            .filter(
                item => item.active
            )
            .length;


    const paused =
        total - active;


    const amount =
        recurringTransactions
            .filter(
                item => item.active
            )
            .reduce(
                function (
                    sum,
                    item
                ) {

                    return (
                        sum +
                        Number(
                            item.amount
                        )
                    );
                },
                0
            );


    if (totalRecurring) {

        totalRecurring.textContent =
            total;
    }


    if (activeRecurring) {

        activeRecurring.textContent =
            active;
    }


    if (pausedRecurring) {

        pausedRecurring.textContent =
            paused;
    }


    if (totalAmount) {

        totalAmount.textContent =
            formatCurrency(
                amount
            );
    }
}


/* =====================================================
   RENDER
===================================================== */

function renderRecurring() {

    if (!recurringGrid) {

        return;
    }


    const search =
        String(
            searchInput?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const type =
        typeFilter?.value ||
        "all";


    const status =
        statusFilter?.value ||
        "all";


    const filtered =
        recurringTransactions
            .filter(
                function (item) {

                    const matchesSearch =
                        !search ||
                        item.name
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        String(
                            item.category
                        )
                            .toLowerCase()
                            .includes(
                                search
                            ) ||
                        String(
                            item.description
                        )
                            .toLowerCase()
                            .includes(
                                search
                            );


                    const matchesType =
                        type ===
                            "all" ||
                        item.type ===
                            type;


                    const matchesStatus =
                        status ===
                            "all" ||
                        (
                            status ===
                                "active" &&
                            item.active
                        ) ||
                        (
                            status ===
                                "paused" &&
                            !item.active
                        );


                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesStatus
                    );
                }
            );


    recurringGrid.innerHTML =
        "";


    if (
        recurringTransactions.length ===
        0
    ) {

        recurringGrid.style.display =
            "none";


        emptyState?.classList.add(
            "show"
        );


        if (resultText) {

            resultText.textContent =
                "0 recurring transactions";
        }


        return;
    }


    if (
        filtered.length ===
        0
    ) {

        recurringGrid.style.display =
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
                "No matching transactions";
        }


        if (paragraph) {

            paragraph.textContent =
                "Try changing your search or filters.";
        }


        if (resultText) {

            resultText.textContent =
                "0 matching transactions";
        }


        return;
    }


    recurringGrid.style.display =
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
            "No recurring transactions yet";
    }


    if (paragraph) {

        paragraph.textContent =
            "Add your first recurring income or expense.";
    }


    if (resultText) {

        resultText.textContent =
            filtered.length +
            (
                filtered.length ===
                1
                    ? " recurring transaction"
                    : " recurring transactions"
            );
    }


    filtered.forEach(
        function (item) {

            recurringGrid.appendChild(
                createCard(item)
            );
        }
    );
}


/* =====================================================
   CARD
===================================================== */

function createCard(
    item
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "recurring-card";


    const typeClass =
        item.type === "income"
            ? "income"
            : "expense";


    const sign =
        item.type === "income"
            ? "+"
            : "-";


    const statusText =
        item.active
            ? "Active"
            : "Paused";


    const statusClass =
        item.active
            ? ""
            : "paused";


    card.innerHTML = `

        <div class="recurring-top">

            <div class="recurring-icon ${typeClass}">

                <i class="fa-solid fa-repeat"></i>

            </div>


            <div class="recurring-actions">

                <button
                    class="recurring-action toggle"
                    type="button"
                    title="${
                        item.active
                            ? "Pause"
                            : "Activate"
                    }"
                >

                    <i class="fa-solid ${
                        item.active
                            ? "fa-pause"
                            : "fa-play"
                    }"></i>

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

            ${escapeHtml(
                item.name
            )}

        </h3>


        <span class="recurring-category">

            ${escapeHtml(
                item.category
            )}

        </span>


        <span class="recurring-status ${statusClass}">

            ${statusText}

        </span>


        <div class="recurring-amount ${typeClass}">

            ${sign}${formatCurrency(
                item.amount
            )}

        </div>


        <div class="recurring-frequency">

            <i class="fa-solid fa-arrows-rotate"></i>

            ${formatFrequency(
                item.frequency
            )}

        </div>


        ${
            item.nextDate
                ? `

                    <div class="recurring-next">

                        <i class="fa-regular fa-calendar"></i>

                        Next:
                        ${formatDate(
                            item.nextDate
                        )}

                    </div>

                `
                : ""
        }


        <p class="recurring-description">

            ${escapeHtml(
                item.description ||
                "No description added."
            )}

        </p>

    `;


    card
        .querySelector(
            ".toggle"
        )
        ?.addEventListener(
            "click",
            function () {

                toggleRecurring(
                    item
                );
            }
        );


    card
        .querySelector(
            ".edit"
        )
        ?.addEventListener(
            "click",
            function () {

                openEditModal(
                    item
                );
            }
        );


    card
        .querySelector(
            ".delete"
        )
        ?.addEventListener(
            "click",
            function () {

                openConfirm(
                    item
                );
            }
        );


    return card;
}


/* =====================================================
   ADD MODAL
===================================================== */

function openAddModal() {

    editingId =
        null;


    recurringForm?.reset();


    if (recurringId) {

        recurringId.value =
            "";
    }


    if (recurringActive) {

        recurringActive.checked =
            true;
    }


    if (modalTitle) {

        modalTitle.textContent =
            "Add Recurring Transaction";
    }


    if (saveButton) {

        saveButton.textContent =
            "Save Recurring";
    }


    hideModalMessage();


    setDefaultDate();


    recurringModal?.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            recurringName?.focus();

        },
        100
    );
}


/* =====================================================
   EDIT MODAL
===================================================== */

function openEditModal(
    item
) {

    editingId =
        item.id;


    if (recurringId) {

        recurringId.value =
            item.id ?? "";
    }


    if (recurringName) {

        recurringName.value =
            item.name ?? "";
    }


    if (recurringType) {

        recurringType.value =
            item.type ??
            "expense";
    }


    if (recurringCategory) {

        recurringCategory.value =
            item.category ??
            "";
    }


    if (recurringAmount) {

        recurringAmount.value =
            item.amount ??
            0;
    }


    if (recurringFrequency) {

        recurringFrequency.value =
            item.frequency ??
            "MONTHLY";
    }


    if (recurringStartDate) {

        recurringStartDate.value =
            normalizeDateInput(
                item.nextDate
            );
    }


    if (recurringDescription) {

        recurringDescription.value =
            item.description ??
            "";
    }


    if (recurringActive) {

        recurringActive.checked =
            Boolean(
                item.active
            );
    }


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Recurring Transaction";
    }


    if (saveButton) {

        saveButton.textContent =
            "Update Recurring";
    }


    hideModalMessage();


    recurringModal?.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            recurringName?.focus();

        },
        100
    );
}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    recurringModal?.classList.remove(
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
   SUBMIT
===================================================== */

async function handleSubmit(
    event
) {

    event.preventDefault();


    const name =
        recurringName?.value
            .trim() ||
        "";


    const type =
        normalizeType(
            recurringType?.value
        );


    const category =
        recurringCategory?.value
            .trim() ||
        "";


    const amount =
        Number(
            recurringAmount?.value
        );


    const frequency =
        normalizeFrequency(
            recurringFrequency?.value
        );


    const nextDate =
        recurringStartDate?.value ||
        "";


    const description =
        recurringDescription?.value
            .trim() ||
        "";


    const active =
        recurringActive?.checked ??
        true;


    if (!name) {

        showModalMessage(
            "Please enter a transaction name."
        );

        recurringName?.focus();

        return;
    }


    if (!category) {

        showModalMessage(
            "Please enter a category."
        );

        recurringCategory?.focus();

        return;
    }


    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        showModalMessage(
            "Please enter an amount greater than zero."
        );

        recurringAmount?.focus();

        return;
    }


    if (!nextDate) {

        showModalMessage(
            "Please select the next date."
        );

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

        isActive: active
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

        let response;


        if (
            editingId !== null &&
            editingId !== undefined &&
            editingId !== ""
        ) {

            response =
                await FinanceAPI
                    .recurring
                    .update(
                        editingId,
                        payload
                    );


            showToast(
                response?.message ||
                "Recurring transaction updated."
            );

        } else {

            response =
                await FinanceAPI
                    .recurring
                    .create(
                        payload
                    );


            showToast(
                response?.message ||
                "Recurring transaction created."
            );
        }


        closeModal();


        await loadRecurring();


    } catch (error) {

        console.error(
            "Recurring transaction save failed:",
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
                    ? "Update Recurring"
                    : "Save Recurring";
        }
    }
}


/* =====================================================
   TOGGLE ACTIVE / PAUSED
===================================================== */

async function toggleRecurring(
    item
) {

    if (
        item.id === null ||
        item.id === undefined
    ) {

        showToast(
            "This recurring transaction has no ID.",
            "error"
        );

        return;
    }


    const newActive =
        !item.active;


    const payload = {

        name:
            item.name,

        title:
            item.name,

        type:
            item.type,

        transactionType:
            item.type,

        category:
            item.category,

        amount:
            item.amount,

        frequency:
            item.frequency,

        nextDate:
            normalizeDateInput(
                item.nextDate
            ),

        startDate:
            normalizeDateInput(
                item.nextDate
            ),

        description:
            item.description,

        active:
            newActive,

        isActive:
            newActive
    };


    try {

        await FinanceAPI
            .recurring
            .update(
                item.id,
                payload
            );


        showToast(
            newActive
                ? "Recurring transaction activated."
                : "Recurring transaction paused."
        );


        await loadRecurring();


    } catch (error) {

        console.error(
            "Could not update recurring status:",
            error
        );


        showToast(
            getErrorMessage(
                error
            ),
            "error"
        );
    }
}


/* =====================================================
   DELETE CONFIRM
===================================================== */

function openConfirm(
    item
) {

    deletingId =
        item.id;


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
        !recurringModal?.classList.contains(
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

async function deleteRecurring() {

    if (
        deletingId === null ||
        deletingId === undefined
    ) {

        return;
    }


    if (confirmDelete) {

        confirmDelete.disabled =
            true;


        confirmDelete.textContent =
            "Deleting...";
    }


    try {

        const response =
            await FinanceAPI
                .recurring
                .delete(
                    deletingId
                );


        closeConfirm();


        showToast(
            response?.message ||
            "Recurring transaction deleted."
        );


        await loadRecurring();


    } catch (error) {

        console.error(
            "Could not delete recurring transaction:",
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
   REFRESH
===================================================== */

async function refreshData() {

    if (refreshButton) {

        refreshButton.disabled =
            true;


        refreshButton
            .querySelector("i")
            ?.classList.add(
                "fa-spin"
            );
    }


    try {

        await loadRecurring();


        showToast(
            "Recurring transactions refreshed."
        );


    } catch (error) {

        showToast(
            getErrorMessage(
                error
            ),
            "error"
        );


    } finally {

        if (refreshButton) {

            refreshButton.disabled =
                false;


            refreshButton
                .querySelector("i")
                ?.classList.remove(
                    "fa-spin"
                );
        }
    }
}


/* =====================================================
   DATE
===================================================== */

function normalizeDateInput(
    value
) {

    if (!value) {

        return "";
    }


    const text =
        String(value);


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(text)
    ) {

        return text;
    }


    if (
        /^\d{4}-\d{2}-\d{2}/
            .test(text)
    ) {

        return text.substring(
            0,
            10
        );
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


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    );
}


function formatDate(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    ).format(
        date
    );
}


/* =====================================================
   FREQUENCY
===================================================== */

function formatFrequency(
    value
) {

    const names = {

        DAILY:
            "Daily",

        WEEKLY:
            "Weekly",

        MONTHLY:
            "Monthly",

        YEARLY:
            "Yearly"
    };


    return (
        names[value] ||
        String(value)
            .replace(
                /_/g,
                " "
            )
    );
}


/* =====================================================
   CURRENCY
===================================================== */

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
        Number(amount) ||
        0
    );
}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    if (!recurringGrid) {

        return;
    }


    recurringGrid.style.display =
        "grid";


    emptyState?.classList.remove(
        "show"
    );


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

        toastIcon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";
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
   ERROR
===================================================== */

function getErrorMessage(
    error
) {

    return (

        error?.message ||

        error?.error ||

        error?.response?.message ||

        error?.response?.error ||

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
            window.FinanceAPI &&
            FinanceAPI.auth &&
            typeof FinanceAPI.auth.logout ===
                "function"
        ) {

            await FinanceAPI.auth.logout();
        }

    } catch (error) {

        console.warn(
            "Logout error:",
            error
        );

    } finally {

        window.location.href =
            "login.html";
    }
}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.loadRecurring =
    loadRecurring;

window.openAddModal =
    openAddModal;

window.closeModal =
    closeModal;

window.closeConfirm =
    closeConfirm;
