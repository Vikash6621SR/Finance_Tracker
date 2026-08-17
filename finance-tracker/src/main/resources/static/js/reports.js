"use strict";

/*
=========================================================
FINANCE TRACKER
REPORTS
=========================================================
*/


/*
=========================================================
STATE
=========================================================
*/

let allTransactions = [];

let filteredTransactions = [];

let currentFromDate = "";

let currentToDate = "";

let toastTimer = null;


/*
=========================================================
DOM ELEMENTS
=========================================================
*/

let menuButton;
let closeSidebarButton;
let sidebar;
let sidebarOverlay;

let refreshButton;
let logoutButton;

let userName;
let userEmail;
let userAvatar;

let fromDate;
let toDate;

let applyButton;
let resetButton;

let totalIncome;
let totalExpenses;
let netBalance;
let transactionCount;

let categoryList;
let monthlyList;
let recentTransactions;

let incomeChart;
let expenseChart;

let emptyState;

let toast;
let toastIcon;
let toastMessage;


/*
=========================================================
INITIALIZATION
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeReports();

    }
);


async function initializeReports() {

    setupElements();

    setupEvents();

    setDefaultDates();

    await loadUser();

    await loadReports();

}


/*
=========================================================
SETUP ELEMENTS
=========================================================
*/

function setupElements() {

    menuButton =
        document.getElementById(
            "menuButton"
        );


    closeSidebarButton =
        document.getElementById(
            "closeSidebar"
        );


    sidebar =
        document.getElementById(
            "sidebar"
        );


    sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );


    refreshButton =
        document.getElementById(
            "refreshButton"
        );


    logoutButton =
        document.getElementById(
            "logoutButton"
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


    fromDate =
        document.getElementById(
            "fromDate"
        );


    toDate =
        document.getElementById(
            "toDate"
        );


    applyButton =
        document.getElementById(
            "applyButton"
        );


    resetButton =
        document.getElementById(
            "resetButton"
        );


    totalIncome =
        document.getElementById(
            "totalIncome"
        );


    totalExpenses =
        document.getElementById(
            "totalExpenses"
        );


    netBalance =
        document.getElementById(
            "netBalance"
        );


    transactionCount =
        document.getElementById(
            "transactionCount"
        );


    categoryList =
        document.getElementById(
            "categoryList"
        );


    monthlyList =
        document.getElementById(
            "monthlyList"
        );


    recentTransactions =
        document.getElementById(
            "recentTransactions"
        );


    incomeChart =
        document.getElementById(
            "incomeChart"
        );


    expenseChart =
        document.getElementById(
            "expenseChart"
        );


    emptyState =
        document.getElementById(
            "emptyState"
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


/*
=========================================================
EVENTS
=========================================================
*/

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


    refreshButton?.addEventListener(
        "click",
        refreshReports
    );


    logoutButton?.addEventListener(
        "click",
        handleLogout
    );


    applyButton?.addEventListener(
        "click",
        applyDateFilter
    );


    resetButton?.addEventListener(
        "click",
        resetDateFilter
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


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeSidebar();

            }

        }
    );
}


/*
=========================================================
SIDEBAR
=========================================================
*/

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


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );


    sidebarOverlay?.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";
}


/*
=========================================================
DEFAULT DATES
=========================================================
*/

function setDefaultDates() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    if (fromDate) {

        fromDate.value =
            formatDateForInput(
                firstDay
            );
    }


    if (toDate) {

        toDate.value =
            formatDateForInput(
                today
            );
    }


    currentFromDate =
        fromDate?.value || "";


    currentToDate =
        toDate?.value || "";
}


/*
=========================================================
LOAD USER
=========================================================
*/

async function loadUser() {

    try {

        if (
            !window.FinanceAPI ||
            !FinanceAPI.auth ||
            typeof FinanceAPI.auth.me !==
                "function"
        ) {

            return;
        }


        const response =
            await FinanceAPI.auth.me();


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
                getInitials(
                    name
                );
        }

    } catch (error) {

        console.warn(
            "Unable to load user:",
            error
        );

    }
}


/*
=========================================================
INITIALS
=========================================================
*/

function getInitials(
    name
) {

    const parts =
        String(
            name
        )
            .trim()
            .split(
                /\s+/
            );


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .substring(
                0,
                2
            )
            .toUpperCase();
    }


    return (
        parts[0][0] +
        parts[
            parts.length - 1
        ][0]
    ).toUpperCase();
}


/*
=========================================================
LOAD REPORTS
=========================================================
*/

async function loadReports() {

    showLoading();


    try {

        /*
        -------------------------------------------------
        CHECK NEW FINANCE API
        -------------------------------------------------
        */

        if (
            !window.FinanceAPI ||
            !FinanceAPI.reports ||
            typeof FinanceAPI.reports.getAll !==
                "function"
        ) {

            throw new Error(
                "FinanceAPI.reports is not loaded. Make sure api.js is loaded before reports.js."
            );
        }


        /*
        -------------------------------------------------
        GET REPORT DATA
        -------------------------------------------------
        */

        const response =
            await FinanceAPI.reports.getAll();


        /*
        -------------------------------------------------
        GET TRANSACTIONS
        -------------------------------------------------
        */

        allTransactions =
            extractTransactions(
                response
            );


        /*
        -------------------------------------------------
        APPLY CURRENT FILTER
        -------------------------------------------------
        */

        applyCurrentFilter();


    } catch (error) {

        console.error(
            "Reports loading failed:",
            error
        );


        allTransactions =
            [];


        filteredTransactions =
            [];


        updateSummary();


        renderCategoryReport();

        renderMonthlyReport();

        renderRecentTransactions();


        showError(
            getErrorMessage(
                error
            )
        );

    }
}


/*
=========================================================
EXTRACT TRANSACTIONS
=========================================================
*/

function extractTransactions(
    response
) {

    if (
        Array.isArray(
            response
        )
    ) {

        return response
            .map(
                normalizeTransaction
            )
            .filter(Boolean);
    }


    if (
        response &&
        Array.isArray(
            response.transactions
        )
    ) {

        return response.transactions
            .map(
                normalizeTransaction
            )
            .filter(Boolean);
    }


    if (
        response &&
        Array.isArray(
            response.data
        )
    ) {

        return response.data
            .map(
                normalizeTransaction
            )
            .filter(Boolean);
    }


    if (
        response &&
        Array.isArray(
            response.content
        )
    ) {

        return response.content
            .map(
                normalizeTransaction
            )
            .filter(Boolean);
    }


    return [];
}


/*
=========================================================
NORMALIZE TRANSACTION
=========================================================
*/

function normalizeTransaction(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !==
            "object"
    ) {

        return null;
    }


    const rawType =
        transaction.type ??
        transaction.transactionType ??
        transaction.transaction_type ??
        "";


    const typeText =
        String(
            rawType
        )
            .trim()
            .toLowerCase();


    let type;


    if (
        typeText === "income" ||
        typeText === "credit" ||
        typeText === "deposit" ||
        typeText === "earning"
    ) {

        type =
            "income";

    } else {

        type =
            "expense";
    }


    const amount =
        Number(
            transaction.amount ??
            transaction.value ??
            0
        );


    if (
        !Number.isFinite(
            amount
        )
    ) {

        return null;
    }


    return {

        id:
            transaction.id ??
            transaction.transactionId ??
            transaction.transaction_id ??
            null,


        type:
            type,


        amount:
            Math.abs(
                amount
            ),


        category:
            String(
                transaction.category ??
                transaction.categoryName ??
                transaction.category_name ??
                "Other"
            ),


        description:
            String(
                transaction.description ??
                transaction.name ??
                transaction.title ??
                "Transaction"
            ),


        date:
            transaction.date ??
            transaction.transactionDate ??
            transaction.transaction_date ??
            transaction.createdAt ??
            ""


    };
}


/*
=========================================================
APPLY DATE FILTER
=========================================================
*/

function applyDateFilter() {

    currentFromDate =
        fromDate?.value ||
        "";


    currentToDate =
        toDate?.value ||
        "";


    if (
        currentFromDate &&
        currentToDate &&
        currentFromDate >
            currentToDate
    ) {

        showToast(
            "From date cannot be after To date.",
            "error"
        );

        return;
    }


    applyCurrentFilter();


    showToast(
        "Report updated."
    );
}


/*
=========================================================
APPLY CURRENT FILTER
=========================================================
*/

function applyCurrentFilter() {

    filteredTransactions =
        allTransactions.filter(
            function (transaction) {

                if (
                    !transaction.date
                ) {

                    return true;
                }


                const transactionDate =
                    normalizeDateOnly(
                        transaction.date
                    );


                if (
                    currentFromDate &&
                    transactionDate <
                        currentFromDate
                ) {

                    return false;
                }


                if (
                    currentToDate &&
                    transactionDate >
                        currentToDate
                ) {

                    return false;
                }


                return true;

            }
        );


    updateSummary();

    renderCategoryReport();

    renderMonthlyReport();

    renderRecentTransactions();

    renderCharts();


    if (
        filteredTransactions.length ===
        0
    ) {

        emptyState?.classList.add(
            "show"
        );

    } else {

        emptyState?.classList.remove(
            "show"
        );
    }
}


/*
=========================================================
RESET FILTER
=========================================================
*/

function resetDateFilter() {

    setDefaultDates();

    applyCurrentFilter();


    showToast(
        "Report filters reset."
    );
}


/*
=========================================================
SUMMARY
=========================================================
*/

function updateSummary() {

    const income =
        filteredTransactions
            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    transaction.amount,
                0
            );


    const expenses =
        filteredTransactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    transaction.amount,
                0
            );


    const balance =
        income -
        expenses;


    if (totalIncome) {

        totalIncome.textContent =
            formatCurrency(
                income
            );
    }


    if (totalExpenses) {

        totalExpenses.textContent =
            formatCurrency(
                expenses
            );
    }


    if (netBalance) {

        netBalance.textContent =
            formatCurrency(
                balance
            );


        netBalance.classList.remove(
            "positive",
            "negative"
        );


        if (
            balance > 0
        ) {

            netBalance.classList.add(
                "positive"
            );

        } else if (
            balance < 0
        ) {

            netBalance.classList.add(
                "negative"
            );
        }
    }


    if (transactionCount) {

        transactionCount.textContent =
            filteredTransactions.length;
    }
}


/*
=========================================================
CATEGORY REPORT
=========================================================
*/

function renderCategoryReport() {

    if (!categoryList) {

        return;
    }


    const categoryTotals = {};


    filteredTransactions
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )
        .forEach(
            function (transaction) {

                const category =
                    transaction.category ||
                    "Other";


                if (
                    !categoryTotals[
                        category
                    ]
                ) {

                    categoryTotals[
                        category
                    ] = 0;
                }


                categoryTotals[
                    category
                ] +=
                    transaction.amount;

            }
        );


    const categories =
        Object.entries(
            categoryTotals
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1] -
                    a[1]
            );


    categoryList.innerHTML =
        "";


    if (
        categories.length ===
        0
    ) {

        categoryList.innerHTML = `

            <div class="report-empty">

                <i class="fa-solid fa-chart-pie"></i>

                <span>
                    No expense data available.
                </span>

            </div>

        `;

        return;
    }


    const totalExpenses =
        categories.reduce(
            (
                total,
                item
            ) =>
                total +
                item[1],
            0
        );


    categories.forEach(
        function (
            item
        ) {

            const category =
                item[0];


            const amount =
                item[1];


            const percentage =
                totalExpenses >
                0
                    ? (
                        amount /
                        totalExpenses
                    ) *
                    100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "category-row";


            row.innerHTML = `

                <div class="category-row-top">

                    <span class="category-name">

                        ${escapeHtml(
                            category
                        )}

                    </span>


                    <span class="category-amount">

                        ${formatCurrency(
                            amount
                        )}

                    </span>

                </div>


                <div class="category-progress">

                    <div
                        class="category-progress-bar"
                        style="width:${percentage.toFixed(2)}%"
                    ></div>

                </div>


                <div class="category-percentage">

                    ${percentage.toFixed(1)}%

                </div>

            `;


            categoryList.appendChild(
                row
            );

        }
    );
}


/*
=========================================================
MONTHLY REPORT
=========================================================
*/

function renderMonthlyReport() {

    if (!monthlyList) {

        return;
    }


    const monthlyTotals = {};


    filteredTransactions.forEach(
        function (
            transaction
        ) {

            if (
                !transaction.date
            ) {

                return;
            }


            const date =
                new Date(
                    transaction.date
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return;
            }


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            const key =
                `${year}-${month}`;


            if (
                !monthlyTotals[
                    key
                ]
            ) {

                monthlyTotals[
                    key
                ] = {

                    income: 0,

                    expense: 0
                };
            }


            if (
                transaction.type ===
                "income"
            ) {

                monthlyTotals[
                    key
                ].income +=
                    transaction.amount;

            } else {

                monthlyTotals[
                    key
                ].expense +=
                    transaction.amount;
            }

        }
    );


    const months =
        Object.entries(
            monthlyTotals
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[0].localeCompare(
                        a[0]
                    )
            );


    monthlyList.innerHTML =
        "";


    if (
        months.length ===
        0
    ) {

        monthlyList.innerHTML = `

            <div class="report-empty">

                <i class="fa-solid fa-calendar"></i>

                <span>
                    No monthly data available.
                </span>

            </div>

        `;

        return;
    }


    months.forEach(
        function (
            item
        ) {

            const month =
                item[0];


            const values =
                item[1];


            const net =
                values.income -
                values.expense;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "monthly-row";


            row.innerHTML = `

                <div class="monthly-period">

                    ${formatMonth(
                        month
                    )}

                </div>


                <div class="monthly-income">

                    <span>
                        Income
                    </span>

                    <strong>
                        ${formatCurrency(
                            values.income
                        )}
                    </strong>

                </div>


                <div class="monthly-expense">

                    <span>
                        Expenses
                    </span>

                    <strong>
                        ${formatCurrency(
                            values.expense
                        )}
                    </strong>

                </div>


                <div class="monthly-net ${
                    net >= 0
                        ? "positive"
                        : "negative"
                }">

                    <span>
                        Net
                    </span>

                    <strong>
                        ${formatCurrency(
                            net
                        )}
                    </strong>

                </div>

            `;


            monthlyList.appendChild(
                row
            );

        }
    );
}


/*
=========================================================
RECENT TRANSACTIONS
=========================================================
*/

function renderRecentTransactions() {

    if (
        !recentTransactions
    ) {

        return;
    }


    recentTransactions.innerHTML =
        "";


    const transactions =
        [...filteredTransactions]
            .sort(
                function (
                    a,
                    b
                ) {

                    return (
                        new Date(
                            b.date
                        ) -
                        new Date(
                            a.date
                        )
                    );

                }
            )
            .slice(
                0,
                10
            );


    if (
        transactions.length ===
        0
    ) {

        recentTransactions.innerHTML = `

            <div class="report-empty">

                <i class="fa-solid fa-receipt"></i>

                <span>
                    No transactions found.
                </span>

            </div>

        `;

        return;
    }


    transactions.forEach(
        function (
            transaction
        ) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "report-transaction";


            const isIncome =
                transaction.type ===
                "income";


            row.innerHTML = `

                <div class="report-transaction-icon ${
                    isIncome
                        ? "income"
                        : "expense"
                }">

                    <i class="fa-solid ${
                        isIncome
                            ? "fa-arrow-down"
                            : "fa-arrow-up"
                    }"></i>

                </div>


                <div class="report-transaction-info">

                    <strong>

                        ${escapeHtml(
                            transaction.description
                        )}

                    </strong>


                    <span>

                        ${escapeHtml(
                            transaction.category
                        )}

                        •

                        ${formatDate(
                            transaction.date
                        )}

                    </span>

                </div>


                <div class="report-transaction-amount ${
                    isIncome
                        ? "income"
                        : "expense"
                }">

                    ${
                        isIncome
                            ? "+"
                            : "-"
                    }

                    ${formatCurrency(
                        transaction.amount
                    )}

                </div>

            `;


            recentTransactions.appendChild(
                row
            );

        }
    );
}


/*
=========================================================
CHARTS
=========================================================
*/

function renderCharts() {

    renderIncomeChart();

    renderExpenseChart();
}


/*
=========================================================
INCOME CHART
=========================================================
*/

function renderIncomeChart() {

    if (!incomeChart) {

        return;
    }


    const canvas =
        incomeChart;


    const ctx =
        canvas.getContext(
            "2d"
        );


    const width =
        canvas.width =
            canvas.clientWidth ||
            600;


    const height =
        canvas.height =
            240;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const monthly =
        getMonthlyChartData();


    const values =
        monthly.map(
            item =>
                item.income
        );


    drawLineChart(
        ctx,
        width,
        height,
        values,
        "income"
    );
}


/*
=========================================================
EXPENSE CHART
=========================================================
*/

function renderExpenseChart() {

    if (!expenseChart) {

        return;
    }


    const canvas =
        expenseChart;


    const ctx =
        canvas.getContext(
            "2d"
        );


    const width =
        canvas.width =
            canvas.clientWidth ||
            600;


    const height =
        canvas.height =
            240;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const monthly =
        getMonthlyChartData();


    const values =
        monthly.map(
            item =>
                item.expense
        );


    drawLineChart(
        ctx,
        width,
        height,
        values,
        "expense"
    );
}


/*
=========================================================
MONTHLY CHART DATA
=========================================================
*/

function getMonthlyChartData() {

    const monthly = {};


    filteredTransactions.forEach(
        function (
            transaction
        ) {

            if (
                !transaction.date
            ) {

                return;
            }


            const date =
                new Date(
                    transaction.date
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return;
            }


            const key =
                `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                )}`;


            if (
                !monthly[key]
            ) {

                monthly[key] = {

                    income: 0,

                    expense: 0
                };
            }


            if (
                transaction.type ===
                "income"
            ) {

                monthly[key].income +=
                    transaction.amount;

            } else {

                monthly[key].expense +=
                    transaction.amount;
            }

        }
    );


    return Object.entries(
        monthly
    )
        .sort(
            (
                a,
                b
            ) =>
                a[0].localeCompare(
                    b[0]
                )
        )
        .slice(
            -6
        )
        .map(
            function (
                item
            ) {

                return {

                    month:
                        item[0],

                    income:
                        item[1].income,

                    expense:
                        item[1].expense

                };

            }
        );
}


/*
=========================================================
DRAW LINE CHART
=========================================================
*/

function drawLineChart(
    ctx,
    width,
    height,
    values,
    type
) {

    const padding =
        35;


    if (
        values.length ===
        0
    ) {

        ctx.font =
            "14px Arial";


        ctx.textAlign =
            "center";


        ctx.fillText(
            "No data available",
            width / 2,
            height / 2
        );


        return;
    }


    const maxValue =
        Math.max(
            ...values,
            1
        );


    const chartWidth =
        width -
        padding * 2;


    const chartHeight =
        height -
        padding * 2;


    /*
    ---------------------------------------------
    GRID
    ---------------------------------------------
    */

    ctx.strokeStyle =
        "#e5e7eb";


    ctx.lineWidth =
        1;


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const y =
            padding +
            (
                chartHeight *
                i /
                4
            );


        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            width -
            padding,
            y
        );

        ctx.stroke();
    }


    /*
    ---------------------------------------------
    POINTS
    ---------------------------------------------
    */

    const points =
        values.map(
            function (
                value,
                index
            ) {

                const x =
                    values.length === 1
                        ? width / 2
                        : padding +
                          (
                              chartWidth *
                              index /
                              (
                                  values.length -
                                  1
                              )
                          );


                const y =
                    height -
                    padding -
                    (
                        value /
                        maxValue
                    ) *
                    chartHeight;


                return {
                    x,
                    y
                };

            }
        );


    /*
    ---------------------------------------------
    LINE
    ---------------------------------------------
    */

    ctx.beginPath();


    points.forEach(
        function (
            point,
            index
        ) {

            if (
                index ===
                0
            ) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );
            }

        }
    );


    ctx.strokeStyle =
        type === "income"
            ? "#16a34a"
            : "#ef4444";


    ctx.lineWidth =
        3;


    ctx.stroke();


    /*
    ---------------------------------------------
    POINTS
    ---------------------------------------------
    */

    points.forEach(
        function (
            point
        ) {

            ctx.beginPath();


            ctx.arc(
                point.x,
                point.y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                type === "income"
                    ? "#16a34a"
                    : "#ef4444";


            ctx.fill();

        }
    );


    /*
    ---------------------------------------------
    LABELS
    ---------------------------------------------
    */

    ctx.fillStyle =
        "#64748b";


    ctx.font =
        "11px Arial";


    ctx.textAlign =
        "center";


    const monthly =
        getMonthlyChartData();


    monthly.forEach(
        function (
            item,
            index
        ) {

            if (
                !points[index]
            ) {

                return;
            }


            ctx.fillText(
                formatMonthShort(
                    item.month
                ),
                points[index].x,
                height -
                    10
            );

        }
    );
}


/*
=========================================================
REFRESH
=========================================================
*/

async function refreshReports() {

    if (
        refreshButton
    ) {

        refreshButton.disabled =
            true;


        refreshButton
            .querySelector(
                "i"
            )
            ?.classList.add(
                "fa-spin"
            );
    }


    try {

        await loadReports();


        showToast(
            "Reports refreshed."
        );

    } catch (error) {

        console.error(
            error
        );

    } finally {

        if (
            refreshButton
        ) {

            refreshButton.disabled =
                false;


            refreshButton
                .querySelector(
                    "i"
                )
                ?.classList.remove(
                    "fa-spin"
                );
        }
    }
}


/*
=========================================================
LOGOUT
=========================================================
*/

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
            "Logout failed:",
            error
        );

    } finally {

        window.location.href =
            "login.html";
    }
}


/*
=========================================================
LOADING
=========================================================
*/

function showLoading() {

    if (
        totalIncome
    ) {

        totalIncome.textContent =
            "Loading...";
    }


    if (
        totalExpenses
    ) {

        totalExpenses.textContent =
            "Loading...";
    }


    if (
        netBalance
    ) {

        netBalance.textContent =
            "Loading...";
    }


    if (
        transactionCount
    ) {

        transactionCount.textContent =
            "...";
    }
}


/*
=========================================================
ERROR
=========================================================
*/

function showError(
    message
) {

    if (
        totalIncome
    ) {

        totalIncome.textContent =
            "₹0.00";
    }


    if (
        totalExpenses
    ) {

        totalExpenses.textContent =
            "₹0.00";
    }


    if (
        netBalance
    ) {

        netBalance.textContent =
            "₹0.00";
    }


    if (
        transactionCount
    ) {

        transactionCount.textContent =
            "0";
    }


    showToast(
        message,
        "error"
    );
}


/*
=========================================================
TOAST
=========================================================
*/

function showToast(
    message,
    type = "success"
) {

    if (
        !toast
    ) {

        console.log(
            message
        );

        return;
    }


    clearTimeout(
        toastTimer
    );


    if (
        toastMessage
    ) {

        toastMessage.textContent =
            message;
    }


    if (
        toastIcon
    ) {

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
            3000
        );
}


/*
=========================================================
CURRENCY
=========================================================
*/

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
        Number(
            amount
        ) || 0
    );
}


/*
=========================================================
DATE INPUT
=========================================================
*/

function formatDateForInput(
    date
) {

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


/*
=========================================================
NORMALIZE DATE
=========================================================
*/

function normalizeDateOnly(
    value
) {

    if (
        !value
    ) {

        return "";
    }


    const text =
        String(
            value
        );


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                text
            )
    ) {

        return text;
    }


    if (
        /^\d{4}-\d{2}-\d{2}/
            .test(
                text
            )
    ) {

        return text.substring(
            0,
            10
        );
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return formatDateForInput(
        date
    );
}


/*
=========================================================
FORMAT DATE
=========================================================
*/

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "No date";
    }


    const date =
        new Date(
            value
        );


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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(
        date
    );
}


/*
=========================================================
FORMAT MONTH
=========================================================
*/

function formatMonth(
    value
) {

    const parts =
        String(
            value
        ).split(
            "-"
        );


    if (
        parts.length !==
        2
    ) {

        return value;
    }


    const date =
        new Date(
            Number(
                parts[0]
            ),
            Number(
                parts[1]
            ) - 1,
            1
        );


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            month:
                "long",

            year:
                "numeric"
        }
    ).format(
        date
    );
}


/*
=========================================================
SHORT MONTH
=========================================================
*/

function formatMonthShort(
    value
) {

    const parts =
        String(
            value
        ).split(
            "-"
        );


    if (
        parts.length !==
        2
    ) {

        return value;
    }


    const date =
        new Date(
            Number(
                parts[0]
            ),
            Number(
                parts[1]
            ) - 1,
            1
        );


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            month:
                "short",

            year:
                "2-digit"
        }
    ).format(
        date
    );
}


/*
=========================================================
ERROR MESSAGE
=========================================================
*/

function getErrorMessage(
    error
) {

    if (
        window.FinanceAPI &&
        typeof FinanceAPI.errorMessage ===
            "function"
    ) {

        return FinanceAPI.errorMessage(
            error
        );
    }


    return (
        error?.message ||
        "Unable to load reports."
    );
}


/*
=========================================================
ESCAPE HTML
=========================================================
*/

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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


/*
=========================================================
GLOBAL FUNCTIONS
=========================================================
*/

window.loadReports =
    loadReports;

window.refreshReports =
    refreshReports;

window.applyDateFilter =
    applyDateFilter;

window.resetDateFilter =
    resetDateFilter;

window.handleLogout =
    handleLogout;
