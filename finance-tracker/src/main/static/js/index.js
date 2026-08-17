/* =========================================================
   FINANCE TRACKER
   INDEX PAGE
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
           MOBILE MENU
        ===================================================== */

  const menuButton = document.getElementById("menuButton");

  const navLinks = document.getElementById("navLinks");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("open");

      const icon = menuButton.querySelector("i");

      if (navLinks.classList.contains("open")) {
        icon.className = "fa-solid fa-xmark";
      } else {
        icon.className = "fa-solid fa-bars";
      }
    });

    /*
     * Close mobile menu after
     * clicking a navigation link.
     */

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");

        const icon = menuButton.querySelector("i");

        icon.className = "fa-solid fa-bars";
      });
    });
  }

  /* =====================================================
           CURRENT YEAR
        ===================================================== */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
           SMOOTH INTERNAL LINKS
        ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  /* =====================================================
           CONSOLE CHECK
        ===================================================== */

  console.log("Finance Tracker index page loaded.");
});
