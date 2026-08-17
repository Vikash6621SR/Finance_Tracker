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
        Add HTTP status so pages such as dashboard.js
        can detect 401 / 403 correctly.
        */

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
        REGISTER / INITIAL SETUP
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

        Dashboard uses:

            FinanceAPI.auth.me()

        The project already has an authenticated
        /profile endpoint, so use it to retrieve
        the current user's information.
        -------------------------------------------------
        */

        async me() {

            const response = await apiRequest(
                "/profile",
                {
                    method: "GET"
                }
            );


            /*
            Backend may return:

                {
                    success: true,
                    user: {...}
                }

            or:

                {
                    success: true,
                    data: {...}
                }

            or directly:

                {...user...}
            */

            if (
                response &&
                response.success &&
                response.user
            ) {
                return response;
            }


            if (
                response &&
                response.success &&
                response.data
            ) {
                return {
                    success: true,
                    user: response.data
                };
            }


            /*
            If /profile directly returns the user object.
            */

            if (
                response &&
                typeof response === "object" &&
                !Array.isArray(response)
            ) {

                /*
                Avoid treating an explicit unsuccessful
                response as a valid user.
                */

                if (response.success === false) {
                    return response;
                }


                return {
                    success: true,
                    user: response
                };
            }


            return {
                success: false,
                user: null
            };
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
        */

        async setupStatus() {

            return await apiRequest(
                "/auth/setup-status",
                {
                    method: "GET"
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
    PROFILE
    =====================================================
    */

    profile: {

        async get() {

            return await apiRequest(
                "/profile",
                {
                    method: "GET"
                }
            );
        },


        async update(profile) {

            return await apiRequest(
                "/profile",
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


        if (error.data?.message) {
            return error.data.message;
        }


        if (error.data?.error) {
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
