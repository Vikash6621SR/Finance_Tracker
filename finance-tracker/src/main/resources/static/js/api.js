"use strict";

/*
=========================================================
FINANCE TRACKER
API CONFIGURATION
=========================================================
*/

const API_BASE_URL =
    "https://financetracker-production-3fe4.up.railway.app/api";


/*
=========================================================
COMMON REQUEST FUNCTION
=========================================================
*/

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            credentials: "include",

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        data = null;
    }


    if (!response.ok) {

        const error = new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }


    return data;
}


/*
=========================================================
FINANCE API
=========================================================
*/

const FinanceAPI = {


    /*
    =====================================================
    AUTHENTICATION
    =====================================================
    */

    auth: {

        async login(email, password) {

            return await apiRequest(
                "/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );
        },


        async register(userData) {

            return await apiRequest(
                "/auth/setup",
                {
                    method: "POST",

                    body: JSON.stringify(userData)
                }
            );
        },


        async me() {

            return await apiRequest(
                "/auth/me",
                {
                    method: "GET"
                }
            );
        },


        async logout() {

            return await apiRequest(
                "/auth/logout",
                {
                    method: "POST"
                }
            );
        },


        async setupStatus() {

            return await apiRequest(
                "/auth/setup-status",
                {
                    method: "GET"
                }
            );
        },


        async changePassword(
            currentPassword,
            newPassword
        ) {

            return await apiRequest(
                "/auth/change-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        currentPassword:
                            currentPassword,

                        newPassword:
                            newPassword
                    })
                }
            );
        }
    },


    /*
    =====================================================
    ACCOUNTS
    =====================================================
    */

    accounts: {

        async getAll() {

            return await apiRequest(
                "/accounts",
                {
                    method: "GET"
                }
            );
        },


        async create(account) {

            return await apiRequest(
                "/accounts",
                {
                    method: "POST",

                    body: JSON.stringify(account)
                }
            );
        },


        async update(id, account) {

            return await apiRequest(
                `/accounts/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(account)
                }
            );
        },


        async delete(id) {

            return await apiRequest(
                `/accounts/${id}`,
                {
                    method: "DELETE"
                }
            );
        }
    },


    /*
    =====================================================
    TRANSACTIONS
    =====================================================
    */

    transactions: {

        async getAll() {

            return await apiRequest(
                "/transactions",
                {
                    method: "GET"
                }
            );
        },


        async create(transaction) {

            return await apiRequest(
                "/transactions",
                {
                    method: "POST",

                    body: JSON.stringify(transaction)
                }
            );
        },


        async update(id, transaction) {

            return await apiRequest(
                `/transactions/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(transaction)
                }
            );
        },


        async delete(id) {

            return await apiRequest(
                `/transactions/${id}`,
                {
                    method: "DELETE"
                }
            );
        }
    },


    /*
    =====================================================
    BUDGETS
    =====================================================
    */

    budgets: {

    async getAll() {

        return await apiRequest(
            "/budgets",
            {
                method: "GET"
            }
        );
    },


    async create(budget) {

        return await apiRequest(
            "/budgets",
            {
                method: "POST",
                body: JSON.stringify(budget)
            }
        );
    },


    async update(id, budget) {

        return await apiRequest(
            `/budgets/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(budget)
            }
        );
    },


    async delete(id) {

        return await apiRequest(
            `/budgets/${id}`,
            {
                method: "DELETE"
            }
        );
    }
},


    /*
    =====================================================
    SAVINGS
    =====================================================
    */

    savings: {

        async getAll() {

            return await apiRequest(
                "/savings",
                {
                    method: "GET"
                }
            );
        },


        async create(saving) {

            return await apiRequest(
                "/savings",
                {
                    method: "POST",

                    body: JSON.stringify(saving)
                }
            );
        },


        async update(id, saving) {

            return await apiRequest(
                `/savings/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(saving)
                }
            );
        },


        async delete(id) {

            return await apiRequest(
                `/savings/${id}`,
                {
                    method: "DELETE"
                }
            );
        }
    },


    /*
    =====================================================
    RECURRING TRANSACTIONS
    =====================================================
    */

    recurring: {

        async getAll() {

            return await apiRequest(
                "/recurring",
                {
                    method: "GET"
                }
            );
        },


        async create(recurring) {

            return await apiRequest(
                "/recurring",
                {
                    method: "POST",

                    body: JSON.stringify(recurring)
                }
            );
        },


        async update(id, recurring) {

            return await apiRequest(
                `/recurring/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(recurring)
                }
            );
        },


        async delete(id) {

            return await apiRequest(
                `/recurring/${id}`,
                {
                    method: "DELETE"
                }
            );
        }
    },


    /*
    =====================================================
    REPORTS
    =====================================================

    IMPORTANT:

    There is NO separate /api/reports endpoint required.

    Reports are generated from:

        GET /api/transactions

    This keeps the application compatible with the
    existing Spring Boot backend.
    =====================================================
    */

    reports: {

        async getAll() {

            const response =
                await FinanceAPI.transactions.getAll();


            /*
            ---------------------------------------------
            EXTRACT TRANSACTIONS
            ---------------------------------------------
            */

            let transactions = [];

            if (Array.isArray(response)) {

                transactions = response;

            } else if (
                response &&
                typeof response === "object"
            ) {

                const possibleKeys = [
                    "transactions",
                    "data",
                    "content",
                    "items",
                    "results"
                ];

                for (
                    const key of possibleKeys
                ) {

                    if (
                        Array.isArray(response[key])
                    ) {

                        transactions =
                            response[key];

                        break;
                    }
                }
            }


            /*
            ---------------------------------------------
            NORMALIZE TRANSACTIONS
            ---------------------------------------------
            */

            transactions =
                transactions
                    .map(transaction => {

                        if (
                            !transaction ||
                            typeof transaction !== "object"
                        ) {

                            return null;
                        }


                        const rawType =
                            transaction.type ??
                            transaction.transactionType ??
                            transaction.transaction_type ??
                            "";


                        const typeText =
                            String(rawType)
                                .trim()
                                .toLowerCase();


                        const type =
                            (
                                typeText === "income" ||
                                typeText === "credit" ||
                                typeText === "deposit" ||
                                typeText === "earning"
                            )
                                ? "income"
                                : "expense";


                        const amount =
                            Number(
                                transaction.amount ??
                                transaction.value ??
                                0
                            );


                        if (
                            !Number.isFinite(amount)
                        ) {

                            return null;
                        }


                        return {

                            id:
                                transaction.id ??
                                transaction.transactionId ??
                                transaction.transaction_id,

                            type: type,

                            amount:
                                Math.abs(amount),

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
                                    ""
                                ),

                            date:
                                transaction.date ??
                                transaction.transactionDate ??
                                transaction.transaction_date ??
                                transaction.createdAt ??
                                ""
                        };

                    })
                    .filter(Boolean);


            /*
            ---------------------------------------------
            CALCULATE INCOME
            ---------------------------------------------
            */

            const income =
                transactions
                    .filter(
                        transaction =>
                            transaction.type === "income"
                    )
                    .reduce(
                        (total, transaction) =>
                            total + transaction.amount,
                        0
                    );


            /*
            ---------------------------------------------
            CALCULATE EXPENSE
            ---------------------------------------------
            */

            const expense =
                transactions
                    .filter(
                        transaction =>
                            transaction.type === "expense"
                    )
                    .reduce(
                        (total, transaction) =>
                            total + transaction.amount,
                        0
                    );


            /*
            ---------------------------------------------
            NET BALANCE
            ---------------------------------------------
            */

            const netBalance =
                income - expense;


            /*
            ---------------------------------------------
            CATEGORY REPORT
            ---------------------------------------------
            */

            const categoryTotals = {};


            transactions
                .filter(
                    transaction =>
                        transaction.type === "expense"
                )
                .forEach(transaction => {

                    const category =
                        transaction.category ||
                        "Other";


                    if (
                        !categoryTotals[category]
                    ) {

                        categoryTotals[category] = 0;
                    }


                    categoryTotals[category] +=
                        transaction.amount;
                });


            const categories =
                Object.entries(categoryTotals)
                    .map(
                        ([category, amount]) => ({
                            category,
                            amount
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.amount - a.amount
                    );


            /*
            ---------------------------------------------
            MONTHLY REPORT
            ---------------------------------------------
            */

            const monthlyTotals = {};


            transactions.forEach(transaction => {

                if (!transaction.date) {
                    return;
                }


                const date =
                    new Date(transaction.date);


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
                    ).padStart(2, "0");


                const key =
                    `${year}-${month}`;


                if (
                    !monthlyTotals[key]
                ) {

                    monthlyTotals[key] = {

                        income: 0,

                        expense: 0
                    };
                }


                if (
                    transaction.type === "income"
                ) {

                    monthlyTotals[key].income +=
                        transaction.amount;

                } else {

                    monthlyTotals[key].expense +=
                        transaction.amount;
                }

            });


            /*
            ---------------------------------------------
            MONTHLY ARRAY
            ---------------------------------------------
            */

            const monthly =
                Object.entries(monthlyTotals)
                    .map(
                        ([month, values]) => ({

                            month,

                            income:
                                values.income,

                            expense:
                                values.expense,

                            net:
                                values.income -
                                values.expense
                        })
                    )
                    .sort(
                        (a, b) =>
                            b.month.localeCompare(
                                a.month
                            )
                    );


            /*
            ---------------------------------------------
            RETURN COMPLETE REPORT
            ---------------------------------------------
            */

            return {

                success: true,

                transactions,

                summary: {

                    transactionCount:
                        transactions.length,

                    income,

                    expense,

                    netBalance
                },

                categories,

                monthly
            };
        }
    },


    /*
    =====================================================
    PROFILE
    =====================================================
    */

    profile: {

        async get() {

            return await apiRequest(
                "/auth/me",
                {
                    method: "GET"
                }
            );
        },


        async update(profile) {

            return await apiRequest(
                "/auth/profile",
                {
                    method: "PUT",

                    body: JSON.stringify(profile)
                }
            );
        }
    },


    /*
    =====================================================
    ERROR MESSAGE
    =====================================================
    */

    errorMessage(error) {

        if (!error) {

            return "Something went wrong.";
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
};


/*
=========================================================
MAKE AVAILABLE GLOBALLY
=========================================================
*/

window.FinanceAPI = FinanceAPI;

window.API_BASE_URL = API_BASE_URL;
