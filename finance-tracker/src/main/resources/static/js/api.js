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

            /*
            IMPORTANT:
            Send the session cookie with every request.
            Your Spring Boot backend uses HTTP session
            authentication.
            */

            credentials: "include",

            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    /*
    =====================================================
    READ RESPONSE
    =====================================================
    */

    let data = null;

    try {

        data = await response.json();

    } catch (error) {

        data = null;
    }


    /*
    =====================================================
    HANDLE HTTP ERRORS
    =====================================================
    */

    if (!response.ok) {

        const error = new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );


        /*
        IMPORTANT:
        Keep the HTTP status available.

        dashboard.js uses this to detect:

        401 = Unauthorized
        403 = Forbidden
        */

        error.status = response.status;

        error.data = data;

        throw error;
    }


    /*
    =====================================================
    RETURN SUCCESS RESPONSE
    =====================================================
    */

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


        /*
        -------------------------------------------------
        LOGIN
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        REGISTER / FIRST-TIME SETUP
        -------------------------------------------------
        */

        async register(userData) {

            return await apiRequest(
                "/auth/setup",
                {
                    method: "POST",

                    body: JSON.stringify(userData)
                }
            );
        },


        /*
        -------------------------------------------------
        CURRENT LOGGED-IN USER
        -------------------------------------------------

        Backend endpoint:

        GET /api/auth/me

        This is used by dashboard.js:

        FinanceAPI.auth.me()

        The backend returns:

        {
            success: true,
            user: {
                id,
                name,
                email,
                phone,
                occupation,
                createdAt
            }
        }
        -------------------------------------------------
        */

        async me() {

            return await apiRequest(
                "/auth/me",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        LOGOUT
        -------------------------------------------------
        */

        async logout() {

            return await apiRequest(
                "/auth/logout",
                {
                    method: "POST"
                }
            );
        },


        /*
        -------------------------------------------------
        SETUP STATUS
        -------------------------------------------------

        GET /api/auth/setup-status
        -------------------------------------------------
        */

        async setupStatus() {

            return await apiRequest(
                "/auth/setup-status",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        CHANGE PASSWORD
        -------------------------------------------------

        POST /api/auth/change-password
        -------------------------------------------------
        */

        async changePassword(currentPassword, newPassword) {

            return await apiRequest(
                "/auth/change-password",
                {
                    method: "POST",

                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword
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


        /*
        -------------------------------------------------
        GET ALL ACCOUNTS
        -------------------------------------------------
        */

        async getAll() {

            return await apiRequest(
                "/accounts",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        CREATE ACCOUNT
        -------------------------------------------------
        */

        async create(account) {

            return await apiRequest(
                "/accounts",
                {
                    method: "POST",

                    body: JSON.stringify(account)
                }
            );
        },


        /*
        -------------------------------------------------
        UPDATE ACCOUNT
        -------------------------------------------------
        */

        async update(id, account) {

            return await apiRequest(
                `/accounts/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(account)
                }
            );
        },


        /*
        -------------------------------------------------
        DELETE ACCOUNT
        -------------------------------------------------
        */

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
    TRANSACTIONS
    =====================================================
    */

    transactions: {


        /*
        -------------------------------------------------
        GET ALL TRANSACTIONS
        -------------------------------------------------
        */

        async getAll() {

            return await apiRequest(
                "/transactions",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        CREATE TRANSACTION
        -------------------------------------------------
        */

        async create(transaction) {

            return await apiRequest(
                "/transactions",
                {
                    method: "POST",

                    body: JSON.stringify(transaction)
                }
            );
        },


        /*
        -------------------------------------------------
        UPDATE TRANSACTION
        -------------------------------------------------
        */

        async update(id, transaction) {

            return await apiRequest(
                `/transactions/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(transaction)
                }
            );
        },


        /*
        -------------------------------------------------
        DELETE TRANSACTION
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        GET ALL BUDGETS
        -------------------------------------------------
        */

        async getAll() {

            return await apiRequest(
                "/budgets",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        CREATE BUDGET
        -------------------------------------------------
        */

        async create(budget) {

            return await apiRequest(
                "/budgets",
                {
                    method: "POST",

                    body: JSON.stringify(budget)
                }
            );
        },


        /*
        -------------------------------------------------
        UPDATE BUDGET
        -------------------------------------------------
        */

        async update(id, budget) {

            return await apiRequest(
                `/budgets/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(budget)
                }
            );
        },


        /*
        -------------------------------------------------
        DELETE BUDGET
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        GET ALL SAVINGS
        -------------------------------------------------
        */

        async getAll() {

            return await apiRequest(
                "/savings",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        CREATE SAVING
        -------------------------------------------------
        */

        async create(saving) {

            return await apiRequest(
                "/savings",
                {
                    method: "POST",

                    body: JSON.stringify(saving)
                }
            );
        },


        /*
        -------------------------------------------------
        UPDATE SAVING
        -------------------------------------------------
        */

        async update(id, saving) {

            return await apiRequest(
                `/savings/${id}`,
                {
                    method: "PUT",

                    body: JSON.stringify(saving)
                }
            );
        },


        /*
        -------------------------------------------------
        DELETE SAVING
        -------------------------------------------------
        */

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
    PROFILE
    =====================================================
    */

    profile: {


        /*
        -------------------------------------------------
        GET CURRENT PROFILE
        -------------------------------------------------

        Backend does NOT have:

        GET /api/profile

        Instead the backend provides:

        GET /api/auth/me
        -------------------------------------------------
        */

        async get() {

            return await apiRequest(
                "/auth/me",
                {
                    method: "GET"
                }
            );
        },


        /*
        -------------------------------------------------
        UPDATE PROFILE
        -------------------------------------------------

        Backend endpoint:

        PUT /api/auth/profile
        -------------------------------------------------
        */

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


        /*
        Backend error message
        */

        if (
            error.data &&
            error.data.message
        ) {

            return error.data.message;
        }


        /*
        Backend error field
        */

        if (
            error.data &&
            error.data.error
        ) {

            return error.data.error;
        }


        /*
        JavaScript error message
        */

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
