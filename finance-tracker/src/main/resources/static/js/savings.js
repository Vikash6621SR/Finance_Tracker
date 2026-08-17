/* =========================================================
   FINANCE TRACKER
   SAVINGS PAGE
   ========================================================= */

"use strict";


/* =========================================================
   STATE
========================================================= */

let savingsGoals = [];

let editingGoalId = null;

let deletingGoalId = null;

let toastTimer = null;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    initializeSavingsPage();
});


async function initializeSavingsPage() {

    setupSidebar();

    setupUser();

    setupButtons();

    setupFilters();

    setupModal();

    setupDeleteModal();

    renderLoading();

    await loadSavingsGoals();
}


/* =========================================================
   API CHECK
========================================================= */

function isFinanceAPIReady() {

    return (
        typeof FinanceAPI !== "undefined" &&
        FinanceAPI &&
        FinanceAPI.savings
    );
}


/* =========================================================
   USER
========================================================= */

function setupUser() {

    let user = null;

    try {

        const possibleKeys = [
            "financeTrackerUser",
            "finance_user",
            "loggedInUser",
            "user",
            "currentUser"
        ];


        for (const key of possibleKeys) {

            const value =
                localStorage.getItem(key);


            if (!value) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(value);


                if (
                    parsed &&
                    typeof parsed === "object"
                ) {

                    user = parsed;

                    break;
                }

            } catch (error) {

                /* Ignore invalid JSON */
            }
        }

    } catch (error) {

        console.warn(
            "Unable to read local user information.",
            error
        );
    }


    const name =
        user?.name ||
        user?.fullName ||
        user?.username ||
        user?.user?.name ||
        "User";


    const email =
        user?.email ||
        user?.user?.email ||
        "Account";


    const avatarElement =
        document.getElementById("userAvatar");


    const nameElement =
        document.getElementById("userName");


    const emailElement =
        document.getElementById("userEmail");


    if (nameElement) {

        nameElement.textContent =
            name;
    }


    if (emailElement) {

        emailElement.textContent =
            email;
    }


    if (avatarElement) {

        const firstLetter =
            String(name)
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "U";


        avatarElement.textContent =
            firstLetter;
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById("sidebar");


    const menuButton =
        document.getElementById("menuButton");


    const closeButton =
        document.getElementById("closeSidebar");


    const overlay =
        document.getElementById("sidebarOverlay");


    if (!sidebar) {
        return;
    }


    menuButton?.addEventListener(
        "click",
        function () {

            sidebar.classList.add("open");

            overlay?.classList.add("active");
        }
    );


    closeButton?.addEventListener(
        "click",
        closeSidebar
    );


    overlay?.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(".nav-link")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    closeSidebar();
                }
            );
        });


    function closeSidebar() {

        sidebar.classList.remove("open");

        overlay?.classList.remove("active");
    }
}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    document
        .getElementById("addSavingsButton")
        ?.addEventListener(
            "click",
            function () {

                openAddModal();
            }
        );


    document
        .getElementById("panelAddButton")
        ?.addEventListener(
            "click",
            function () {

                openAddModal();
            }
        );


    document
        .getElementById("emptyAddButton")
        ?.addEventListener(
            "click",
            function () {

                openAddModal();
            }
        );


    document
        .getElementById("refreshButton")
        ?.addEventListener(
            "click",
            async function () {

                const button = this;


                button.disabled = true;


                button
                    .querySelector("i")
                    ?.classList.add("fa-spin");


                try {

                    await loadSavingsGoals();


                    showToast(
                        "Savings goals refreshed.",
                        "success"
                    );

                } finally {

                    button.disabled = false;


                    button
                        .querySelector("i")
                        ?.classList.remove(
                            "fa-spin"
                        );
                }
            }
        );


    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            handleLogout
        );
}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    document
        .getElementById("searchInput")
        ?.addEventListener(
            "input",
            renderGoals
        );


    document
        .getElementById("statusFilter")
        ?.addEventListener(
            "change",
            renderGoals
        );


    document
        .getElementById("clearFilters")
        ?.addEventListener(
            "click",
            function () {

                const searchInput =
                    document.getElementById(
                        "searchInput"
                    );


                const statusFilter =
                    document.getElementById(
                        "statusFilter"
                    );


                if (searchInput) {

                    searchInput.value = "";
                }


                if (statusFilter) {

                    statusFilter.value =
                        "all";
                }


                renderGoals();
            }
        );
}


/* =========================================================
   LOAD SAVINGS GOALS
========================================================= */

async function loadSavingsGoals() {

    try {

        if (!isFinanceAPIReady()) {

            throw new Error(
                "FinanceAPI.savings is not available. Check api.js."
            );
        }


        /*
         * CORRECT API CALL
         *
         * Old:
         * apiGet("/savings")
         *
         * New:
         * FinanceAPI.savings.getAll()
         */

        const response =
            await FinanceAPI.savings.getAll();


        if (Array.isArray(response)) {

            savingsGoals =
                response;

        } else if (
            Array.isArray(
                response?.data
            )
        ) {

            savingsGoals =
                response.data;

        } else if (
            Array.isArray(
                response?.goals
            )
        ) {

            savingsGoals =
                response.goals;

        } else if (
            Array.isArray(
                response?.savings
            )
        ) {

            savingsGoals =
                response.savings;

        } else if (
            Array.isArray(
                response?.content
            )
        ) {

            savingsGoals =
                response.content;

        } else {

            savingsGoals = [];
        }


        updateSummary();

        renderGoals();

    } catch (error) {

        console.error(
            "Unable to load savings goals:",
            error
        );


        savingsGoals = [];


        updateSummary();


        const grid =
            document.getElementById(
                "savingsGrid"
            );


        const emptyState =
            document.getElementById(
                "emptyState"
            );


        if (grid) {

            grid.innerHTML = `

                <div class="loading-state">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Unable to load savings goals
                    </strong>

                    <span>
                        Please check your Finance Tracker API.
                    </span>

                    <button
                        type="button"
                        class="panel-add"
                        onclick="loadSavingsGoals()"
                    >
                        Try Again
                    </button>

                </div>

            `;
        }


        if (emptyState) {

            emptyState.hidden = true;
        }


        showToast(
            getErrorMessage(error),
            "error"
        );
    }
}


/* =========================================================
   LOADING STATE
========================================================= */

function renderLoading() {

    const grid =
        document.getElementById(
            "savingsGrid"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!grid) {
        return;
    }


    if (emptyState) {

        emptyState.hidden = true;
    }


    grid.innerHTML = `

        <div class="loading-state">

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Loading savings goals...
            </span>

        </div>

    `;
}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        savingsGoals.length;


    let totalSaved = 0;

    let totalTarget = 0;

    let completed = 0;


    savingsGoals.forEach(
        function (goal) {

            const target =
                getTargetAmount(goal);


            const saved =
                getSavedAmount(goal);


            totalTarget +=
                target;


            totalSaved +=
                saved;


            if (
                isGoalCompleted(goal)
            ) {

                completed++;
            }
        }
    );


    setText(
        "totalGoals",
        String(total)
    );


    setText(
        "totalSaved",
        formatCurrency(
            totalSaved
        )
    );


    setText(
        "totalTarget",
        formatCurrency(
            totalTarget
        )
    );


    setText(
        "completedGoals",
        String(completed)
    );
}


/* =========================================================
   FILTER + RENDER
========================================================= */

function renderGoals() {

    const grid =
        document.getElementById(
            "savingsGrid"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const resultText =
        document.getElementById(
            "resultText"
        );


    if (!grid) {
        return;
    }


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        String(
            searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


    const status =
        statusFilter?.value ||
        "all";


    const filtered =
        savingsGoals.filter(
            function (goal) {

                const name =
                    getGoalName(
                        goal
                    )
                    .toLowerCase();


                const description =
                    getDescription(
                        goal
                    )
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(
                        search
                    ) ||
                    description.includes(
                        search
                    );


                const completed =
                    isGoalCompleted(
                        goal
                    );


                const matchesStatus =
                    status === "all" ||
                    (
                        status ===
                        "completed" &&
                        completed
                    ) ||
                    (
                        status ===
                        "active" &&
                        !completed
                    );


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    if (resultText) {

        resultText.textContent =
            filtered.length === 1
                ? "1 goal"
                : `${filtered.length} goals`;
    }


    if (
        filtered.length === 0
    ) {

        grid.innerHTML = "";


        if (emptyState) {

            emptyState.hidden =
                false;
        }


        return;
    }


    if (emptyState) {

        emptyState.hidden =
            true;
    }


    grid.innerHTML =
        filtered
            .map(
                createGoalCard
            )
            .join("");
}


/* =========================================================
   CREATE GOAL CARD
========================================================= */

function createGoalCard(
    goal
) {

    const id =
        getGoalId(
            goal
        );


    const name =
        escapeHtml(
            getGoalName(
                goal
            )
        );


    const description =
        escapeHtml(
            getDescription(
                goal
            )
        );


    const target =
        getTargetAmount(
            goal
        );


    const saved =
        getSavedAmount(
            goal
        );


    const percentage =
        calculatePercentage(
            saved,
            target
        );


    const completed =
        isGoalCompleted(
            goal
        );


    const targetDate =
        getTargetDate(
            goal
        );


    const dateText =
        targetDate
            ? formatDate(
                targetDate
            )
            : "No target date";


    const remaining =
        Math.max(
            target - saved,
            0
        );


    return `

        <article
            class="goal-card"
            data-goal-id="${escapeHtml(
                String(id)
            )}"
        >

            <div class="goal-top">

                <div class="goal-title-wrap">

                    <h3 class="goal-title">

                        ${name}

                    </h3>


                    ${
                        description
                            ? `

                                <p class="goal-description">

                                    ${description}

                                </p>

                            `
                            : ""
                    }

                </div>


                <span
                    class="goal-status ${
                        completed
                            ? "completed"
                            : "active"
                    }"
                >

                    ${
                        completed
                            ? "Completed"
                            : "Active"
                    }

                </span>

            </div>


            <div class="progress-info">

                <span>
                    Progress
                </span>

                <strong>
                    ${percentage}%
                </strong>

            </div>


            <div class="progress-track">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>


            <div class="goal-amounts">

                <span>

                    Saved:

                    <strong>
                        ${formatCurrency(
                            saved
                        )}
                    </strong>

                </span>


                <span>

                    Target:

                    <strong>
                        ${formatCurrency(
                            target
                        )}
                    </strong>

                </span>

            </div>


            <div class="goal-meta">

                <span class="meta-item">

                    <i class="fa-regular fa-calendar"></i>

                    ${dateText}

                </span>


                ${
                    completed

                        ? `

                            <span class="meta-item">

                                <i class="fa-solid fa-check"></i>

                                Goal reached

                            </span>

                        `

                        : `

                            <span class="meta-item">

                                <i class="fa-solid fa-coins"></i>

                                ${formatCurrency(
                                    remaining
                                )}
                                remaining

                            </span>

                        `
                }

            </div>


            <div class="goal-actions">

                ${
                    !completed

                        ? `

                            <button
                                type="button"
                                class="goal-action"
                                onclick="addContribution('${escapeJs(
                                    String(id)
                                )}')"
                            >

                                <i class="fa-solid fa-plus"></i>

                                Add

                            </button>

                        `

                        : `

                            <button
                                type="button"
                                class="goal-action"
                                disabled
                            >

                                <i class="fa-solid fa-check"></i>

                                Done

                            </button>

                        `
                }


                <button
                    type="button"
                    class="goal-action"
                    onclick="editGoal('${escapeJs(
                        String(id)
                    )}')"
                >

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>


                <button
                    type="button"
                    class="goal-action delete"
                    onclick="openDeleteModal('${escapeJs(
                        String(id)
                    )}')"
                >

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </div>

        </article>

    `;
}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddModal() {

    editingGoalId =
        null;


    setText(
        "modalTitle",
        "Add Savings Goal"
    );


    const form =
        document.getElementById(
            "savingsForm"
        );


    form?.reset();


    setValue(
        "savingsId",
        ""
    );


    setValue(
        "savingsCurrent",
        "0"
    );


    clearModalMessage();


    openModal();
}


/* =========================================================
   EDIT GOAL
========================================================= */

function editGoal(
    id
) {

    const goal =
        savingsGoals.find(
            function (item) {

                return (
                    String(
                        getGoalId(
                            item
                        )
                    ) ===
                    String(id)
                );
            }
        );


    if (!goal) {

        showToast(
            "Savings goal could not be found.",
            "error"
        );

        return;
    }


    editingGoalId =
        getGoalId(
            goal
        );


    setText(
        "modalTitle",
        "Edit Savings Goal"
    );


    setValue(
        "savingsId",
        getGoalId(
            goal
        )
    );


    setValue(
        "savingsName",
        getGoalName(
            goal
        )
    );


    setValue(
        "savingsTarget",
        getTargetAmount(
            goal
        )
    );


    setValue(
        "savingsCurrent",
        getSavedAmount(
            goal
        )
    );


    setValue(
        "savingsDate",
        normalizeDateForInput(
            getTargetDate(
                goal
            )
        )
    );


    setValue(
        "savingsDescription",
        getDescription(
            goal
        )
    );


    clearModalMessage();


    openModal();
}


/* =========================================================
   MODAL SETUP
========================================================= */

function setupModal() {

    document
        .getElementById("modalClose")
        ?.addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("cancelButton")
        ?.addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("savingsModal")
        ?.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    this
                ) {

                    closeModal();
                }
            }
        );


    document
        .getElementById("savingsForm")
        ?.addEventListener(
            "submit",
            handleSaveGoal
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

                closeDeleteModal();
            }
        }
    );
}


function openModal() {

    const modal =
        document.getElementById(
            "savingsModal"
        );


    if (modal) {

        modal.hidden =
            false;
    }
}


function closeModal() {

    const modal =
        document.getElementById(
            "savingsModal"
        );


    if (modal) {

        modal.hidden =
            true;
    }


    editingGoalId =
        null;


    clearModalMessage();
}


/* =========================================================
   SAVE GOAL
========================================================= */

async function handleSaveGoal(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "savingsName"
        )
        .trim();


    const target =
        Number(
            getValue(
                "savingsTarget"
            )
        );


    const current =
        Number(
            getValue(
                "savingsCurrent"
            ) || 0
        );


    const targetDate =
        getValue(
            "savingsDate"
        );


    const description =
        getValue(
            "savingsDescription"
        )
        .trim();


    if (!name) {

        showModalMessage(
            "Please enter a goal name.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(
            target
        ) ||
        target <= 0
    ) {

        showModalMessage(
            "Target amount must be greater than ₹0.",
            "error"
        );

        return;
    }


    if (
        !Number.isFinite(
            current
        ) ||
        current < 0
    ) {

        showModalMessage(
            "Current saved amount cannot be negative.",
            "error"
        );

        return;
    }


    if (
        current > target
    ) {

        showModalMessage(
            "Current saved amount cannot be greater than the target amount.",
            "error"
        );

        return;
    }


    const data = {

        name: name,

        targetAmount: target,

        currentAmount: current,

        targetDate:
            targetDate ||
            null,

        description:
            description ||
            null
    };


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    if (saveButton) {

        saveButton.disabled =
            true;


        saveButton.textContent =
            editingGoalId === null
                ? "Saving..."
                : "Updating...";
    }


    try {

        let response;


        if (
            editingGoalId ===
            null
        ) {

            /*
             * CORRECT CREATE
             *
             * Old:
             * apiPost("/api/savings", data)
             *
             * New:
             * FinanceAPI.savings.create(data)
             */

            response =
                await FinanceAPI.savings.create(
                    data
                );


            showToast(
                response?.message ||
                "Savings goal created successfully.",
                "success"
            );

        } else {

            /*
             * CORRECT UPDATE
             *
             * Old:
             * apiPut(`/api/savings/${id}`, data)
             *
             * New:
             * FinanceAPI.savings.update(id, data)
             */

            response =
                await FinanceAPI.savings.update(
                    editingGoalId,
                    data
                );


            showToast(
                response?.message ||
                "Savings goal updated successfully.",
                "success"
            );
        }


        closeModal();


        await loadSavingsGoals();

    } catch (error) {

        console.error(
            "Unable to save savings goal:",
            error
        );


        showModalMessage(
            getErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Goal";
        }
    }
}


/* =========================================================
   DELETE MODAL
========================================================= */

function setupDeleteModal() {

    document
        .getElementById("confirmCancel")
        ?.addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById("confirmDelete")
        ?.addEventListener(
            "click",
            confirmDelete
        );


    document
        .getElementById("confirmOverlay")
        ?.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    this
                ) {

                    closeDeleteModal();
                }
            }
        );
}


function openDeleteModal(
    id
) {

    const goal =
        savingsGoals.find(
            function (item) {

                return (
                    String(
                        getGoalId(
                            item
                        )
                    ) ===
                    String(id)
                );
            }
        );


    if (!goal) {

        showToast(
            "Savings goal could not be found.",
            "error"
        );

        return;
    }


    deletingGoalId =
        getGoalId(
            goal
        );


    const overlay =
        document.getElementById(
            "confirmOverlay"
        );


    if (overlay) {

        overlay.hidden =
            false;
    }
}


function closeDeleteModal() {

    const overlay =
        document.getElementById(
            "confirmOverlay"
        );


    if (overlay) {

        overlay.hidden =
            true;
    }


    deletingGoalId =
        null;
}


/* =========================================================
   CONFIRM DELETE
========================================================= */

async function confirmDelete() {

    if (
        deletingGoalId ===
        null ||
        deletingGoalId ===
        undefined ||
        deletingGoalId === ""
    ) {

        return;
    }


    const button =
        document.getElementById(
            "confirmDelete"
        );


    if (button) {

        button.disabled =
            true;


        button.textContent =
            "Deleting...";
    }


    try {

        /*
         * CORRECT DELETE
         *
         * Old:
         * apiDelete(`/savings/${id}`)
         *
         * New:
         * FinanceAPI.savings.delete(id)
         */

        const response =
            await FinanceAPI.savings.delete(
                deletingGoalId
            );


        closeDeleteModal();


        showToast(
            response?.message ||
            "Savings goal deleted successfully.",
            "success"
        );


        await loadSavingsGoals();

    } catch (error) {

        console.error(
            "Unable to delete savings goal:",
            error
        );


        showToast(
            getErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;


            button.textContent =
                "Delete";
        }
    }
}


/* =========================================================
   CONTRIBUTION
========================================================= */

async function addContribution(
    id
) {

    const goal =
        savingsGoals.find(
            function (item) {

                return (
                    String(
                        getGoalId(
                            item
                        )
                    ) ===
                    String(id)
                );
            }
        );


    if (!goal) {

        showToast(
            "Savings goal could not be found.",
            "error"
        );

        return;
    }


    const target =
        getTargetAmount(
            goal
        );


    const saved =
        getSavedAmount(
            goal
        );


    const remaining =
        Math.max(
            target - saved,
            0
        );


    if (
        remaining <= 0
    ) {

        showToast(
            "This savings goal is already completed.",
            "success"
        );

        return;
    }


    const value =
        window.prompt(
            `Enter contribution amount.\nRemaining: ${formatCurrency(
                remaining
            )}`
        );


    if (
        value ===
        null
    ) {

        return;
    }


    const amount =
        Number(value);


    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        showToast(
            "Please enter a valid contribution amount.",
            "error"
        );

        return;
    }


    if (
        amount > remaining
    ) {

        showToast(
            `Contribution cannot exceed ${formatCurrency(
                remaining
            )}.`,
            "error"
        );

        return;
    }


    try {

        /*
         * CORRECT CONTRIBUTION API
         *
         * FinanceAPI.savings.contribute(
         *     id,
         *     { amount }
         * )
         */

        const response =
            await FinanceAPI.savings.contribute(
                id,
                {
                    amount: amount
                }
            );


        showToast(
            response?.message ||
            "Contribution added successfully.",
            "success"
        );


        await loadSavingsGoals();

    } catch (error) {

        console.error(
            "Unable to add contribution:",
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


/* =========================================================
   LOGOUT
========================================================= */

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
            "Backend logout failed:",
            error
        );
    }


    const keysToRemove = [

        "financeTrackerUser",

        "finance_user",

        "loggedInUser",

        "currentUser",

        "foodexpress_user",

        "foodexpress_loggedIn",

        "token",

        "authToken",

        "jwt"
    ];


    keysToRemove.forEach(
        function (key) {

            localStorage.removeItem(
                key
            );

            sessionStorage.removeItem(
                key
            );
        }
    );


    window.location.href =
        "login.html";
}


/* =========================================================
   DATA HELPERS
========================================================= */

function getGoalId(
    goal
) {

    return (
        goal?.id ??
        goal?.goalId ??
        goal?.savingsId ??
        ""
    );
}


function getGoalName(
    goal
) {

    return String(
        goal?.name ??
        goal?.goalName ??
        goal?.title ??
        "Savings Goal"
    );
}


function getDescription(
    goal
) {

    return String(
        goal?.description ??
        ""
    );
}


function getTargetAmount(
    goal
) {

    return (
        Number(
            goal?.targetAmount ??
            goal?.target ??
            goal?.target_amount ??
            0
        ) || 0
    );
}


function getSavedAmount(
    goal
) {

    return (
        Number(
            goal?.currentAmount ??
            goal?.savedAmount ??
            goal?.currentSaved ??
            goal?.saved ??
            goal?.current_amount ??
            0
        ) || 0
    );
}


function getTargetDate(
    goal
) {

    return (
        goal?.targetDate ??
        goal?.target_date ??
        null
    );
}


function isGoalCompleted(
    goal
) {

    const target =
        getTargetAmount(
            goal
        );


    const saved =
        getSavedAmount(
            goal
        );


    if (
        goal?.completed ===
        true
    ) {

        return true;
    }


    if (
        goal?.status
    ) {

        const status =
            String(
                goal.status
            )
            .toLowerCase();


        if (
            status ===
            "completed" ||
            status ===
            "complete"
        ) {

            return true;
        }
    }


    return (
        target > 0 &&
        saved >= target
    );
}


/* =========================================================
   CALCULATIONS
========================================================= */

function calculatePercentage(
    saved,
    target
) {

    if (
        !target ||
        target <= 0
    ) {

        return 0;
    }


    return Math.min(
        Math.round(
            (
                saved /
                target
            ) * 100
        ),
        100
    );
}


/* =========================================================
   FORMATTERS
========================================================= */

function formatCurrency(
    amount
) {

    const value =
        Number(amount) || 0;


    return value.toLocaleString(
        "en-IN",
        {

            style: "currency",

            currency: "INR",

            minimumFractionDigits: 2,

            maximumFractionDigits: 2
        }
    );
}


function formatDate(
    value
) {

    if (!value) {

        return "No target date";
    }


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


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    );
}


function normalizeDateForInput(
    value
) {

    if (!value) {

        return "";
    }


    const text =
        String(value);


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


    return date
        .toISOString()
        .substring(
            0,
            10
        );
}


/* =========================================================
   DOM HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";
    }
}


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value
        : "";
}


/* =========================================================
   MODAL MESSAGE
========================================================= */

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
        `modal-message show ${type}`;
}


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


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const icon =
        document.getElementById(
            "toastIcon"
        );


    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !messageElement
    ) {

        return;
    }


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );
    }


    messageElement.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    if (icon) {

        icon.className =
            type === "error"

                ? "fa-solid fa-circle-exclamation"

                : "fa-solid fa-circle-check";
    }


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );
}


/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(
    error
) {

    if (!error) {

        return "Something went wrong.";
    }


    if (
        typeof error ===
        "string"
    ) {

        return error;
    }


    return (
        error.message ||
        error.error ||
        error.response?.message ||
        error.response?.error ||
        "Something went wrong. Please try again."
    );
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeJs(
    value
) {

    return String(value)
        .replaceAll(
            "\\",
            "\\\\"
        )
        .replaceAll(
            "'",
            "\\'"
        )
        .replaceAll(
            '"',
            '\\"'
        )
        .replaceAll(
            "\n",
            "\\n"
        )
        .replaceAll(
            "\r",
            "\\r"
        );
}


/* =========================================================
   EXPOSE FUNCTIONS
========================================================= */

window.loadSavingsGoals =
    loadSavingsGoals;


window.editGoal =
    editGoal;


window.openDeleteModal =
    openDeleteModal;


window.addContribution =
    addContribution;
