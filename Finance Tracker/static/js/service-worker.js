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
APP FILES
=========================================================
*/

const APP_FILES = [

    "./",

    "./index.html",
    "./login.html",
    "./register.html",
    "./forgot-password.html",

    "./dashboard.html",
    "./accounts.html",
    "./transactions.html",
    "./budgets.html",
    "./savings.html",
    "./recurring.html",
    "./reports.html",
    "./profile.html",
    "./notifications.html",

    "./manifest.json"

];


/*
=========================================================
INSTALL
=========================================================
*/

self.addEventListener(
    "install",
    event => {

        console.log(
            "Finance Tracker service worker installing..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll(
                            APP_FILES
                        );

                    }
                )

        );


        self.skipWaiting();

    }
);


/*
=========================================================
ACTIVATE
=========================================================
*/

self.addEventListener(
    "activate",
    event => {

        console.log(
            "Finance Tracker service worker activated."
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames.map(
                                cacheName => {

                                    if (
                                        cacheName !==
                                        CACHE_NAME
                                    ) {

                                        return caches.delete(
                                            cacheName
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

        );


        self.clients.claim();

    }
);


/*
=========================================================
FETCH
=========================================================
*/

self.addEventListener(
    "fetch",
    event => {

        /*
        -------------------------------------------------
        Only handle GET requests
        -------------------------------------------------
        */

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
        -------------------------------------------------
        API requests should ALWAYS use the network.
        -------------------------------------------------
        */

        const requestURL =
            new URL(
                event.request.url
            );


        if (
            requestURL.pathname.startsWith(
                "/api/"
            )
        ) {

            return;

        }


        /*
        -------------------------------------------------
        Network first
        -------------------------------------------------
        */

        event.respondWith(

            fetch(
                event.request
            )
                .then(
                    response => {

                        /*
                        -----------------------------
                        Save successful response
                        -----------------------------
                        */

                        if (
                            response &&
                            response.status === 200 &&
                            response.type ===
                                "basic"
                        ) {

                            const responseClone =
                                response.clone();


                            caches
                                .open(
                                    CACHE_NAME
                                )
                                .then(
                                    cache => {

                                        cache.put(
                                            event.request,
                                            responseClone
                                        );

                                    }
                                );

                        }


                        return response;

                    }
                )
                .catch(
                    () => {

                        /*
                        -----------------------------
                        Offline fallback
                        -----------------------------
                        */

                        return caches.match(
                            event.request
                        );

                    }
                )

        );

    }
);
