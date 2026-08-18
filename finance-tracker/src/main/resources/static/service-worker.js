"use strict";

/*
=========================================================
FINANCE TRACKER
PROGRESSIVE WEB APP - SERVICE WORKER
=========================================================
*/

const CACHE_NAME = "finance-tracker-v1";

/*
=========================================================
FILES TO CACHE
=========================================================
*/

const APP_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./register.html",
    "./dashboard.html",
    "./accounts.html",
    "./transactions.html",
    "./budgets.html",
    "./savings.html",
    "./recurring.html",
    "./reports.html",
    "./profile.html",
    "./notifications.html",

    "./manifest.json",

    "./static/css/index.css",
    "./static/css/login.css",
    "./static/css/register.css",
    "./static/css/dashboard.css",
    "./static/css/accounts.css",
    "./static/css/transactions.css",
    "./static/css/budgets.css",
    "./static/css/savings.css",
    "./static/css/recurring.css",
    "./static/css/reports.css",
    "./static/css/profile.css",
    "./static/css/notifications.css",

    "./static/js/api.js",
    "./static/js/index.js",
    "./static/js/login.js",
    "./static/js/register.js",
    "./static/js/dashboard.js",
    "./static/js/accounts.js",
    "./static/js/transactions.js",
    "./static/js/budgets.js",
    "./static/js/savings.js",
    "./static/js/recurring.js",
    "./static/js/reports.js",
    "./static/js/profile.js",
    "./static/js/notifications.js",

    "./images/icon-192.png",
    "./images/icon-512.png"
];


/*
=========================================================
INSTALL
=========================================================
*/

self.addEventListener("install", function (event) {

    console.log(
        "Finance Tracker Service Worker: Installing..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function (cache) {

                console.log(
                    "Finance Tracker: Caching application files..."
                );

                return cache.addAll(APP_FILES);

            })
            .then(function () {

                console.log(
                    "Finance Tracker Service Worker: Installation complete."
                );

                return self.skipWaiting();

            })
            .catch(function (error) {

                console.error(
                    "Finance Tracker Service Worker installation failed:",
                    error
                );

            })

    );

});


/*
=========================================================
ACTIVATE
=========================================================
*/

self.addEventListener("activate", function (event) {

    console.log(
        "Finance Tracker Service Worker: Activating..."
    );

    event.waitUntil(

        caches.keys()
            .then(function (cacheNames) {

                return Promise.all(

                    cacheNames.map(function (cacheName) {

                        if (
                            cacheName !== CACHE_NAME &&
                            cacheName.startsWith(
                                "finance-tracker-"
                            )
                        ) {

                            console.log(
                                "Deleting old cache:",
                                cacheName
                            );

                            return caches.delete(cacheName);

                        }

                    })

                );

            })
            .then(function () {

                console.log(
                    "Finance Tracker Service Worker: Activation complete."
                );

                return self.clients.claim();

            })

    );

});


/*
=========================================================
FETCH
=========================================================
*/

self.addEventListener("fetch", function (event) {

    const request = event.request;

    /*
    -----------------------------------------------------
    Only handle GET requests
    -----------------------------------------------------
    */

    if (request.method !== "GET") {

        return;

    }


    /*
    -----------------------------------------------------
    Do not cache API requests
    -----------------------------------------------------
    */

    const url = new URL(request.url);

    if (
        url.pathname.startsWith("/api/")
    ) {

        return;

    }


    /*
    -----------------------------------------------------
    Network first for HTML pages
    -----------------------------------------------------
    */

    if (
        request.mode === "navigate" ||
        request.destination === "document"
    ) {

        event.respondWith(

            fetch(request)
                .then(function (response) {

                    /*
                    Update cached page
                    */

                    if (
                        response &&
                        response.ok
                    ) {

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(function (cache) {

                                cache.put(
                                    request,
                                    responseClone
                                );

                            });

                    }

                    return response;

                })
                .catch(function () {

                    /*
                    If network is unavailable,
                    return cached page.
                    */

                    return caches.match(request)
                        .then(function (cachedResponse) {

                            if (cachedResponse) {

                                return cachedResponse;

                            }

                            return caches.match(
                                "./index.html"
                            );

                        });

                })

        );

        return;

    }


    /*
    -----------------------------------------------------
    Cache first for static files
    -----------------------------------------------------
    */

    event.respondWith(

        caches.match(request)
            .then(function (cachedResponse) {

                if (cachedResponse) {

                    return cachedResponse;

                }

                return fetch(request)
                    .then(function (response) {

                        if (
                            response &&
                            response.ok
                        ) {

                            const responseClone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(function (cache) {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }

                        return response;

                    });

            })

    );

});


/*
=========================================================
MESSAGE HANDLER
=========================================================
*/

self.addEventListener("message", function (event) {

    if (
        event.data &&
        event.data.type === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});
