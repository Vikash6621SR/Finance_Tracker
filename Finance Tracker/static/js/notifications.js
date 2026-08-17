/* =========================================================
   FINANCE TRACKER
   NOTIFICATIONS PAGE
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", async function () {
  /* =====================================================
           ELEMENTS
        ===================================================== */

  const sidebar = document.getElementById("sidebar");

  const sidebarOverlay = document.getElementById("sidebarOverlay");

  const menuButton = document.getElementById("menuButton");

  const mobileClose = document.getElementById("mobileClose");

  const sidebarAvatar = document.getElementById("sidebarAvatar");

  const sidebarUserName = document.getElementById("sidebarUserName");

  const sidebarUserEmail = document.getElementById("sidebarUserEmail");

  const topbarAvatar = document.getElementById("topbarAvatar");

  const topbarUserName = document.getElementById("topbarUserName");

  const notificationList = document.getElementById("notificationList");

  const emptyState = document.getElementById("emptyState");

  const clearButton = document.getElementById("clearButton");

  const logoutButton = document.getElementById("logoutButton");

  const globalMessage = document.getElementById("globalMessage");

  /* =====================================================
           YEAR
        ===================================================== */

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
           SIDEBAR
        ===================================================== */

  function openSidebar() {
    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");
  }

  menuButton.addEventListener("click", openSidebar);

  mobileClose.addEventListener("click", closeSidebar);

  sidebarOverlay.addEventListener("click", closeSidebar);

  document.querySelectorAll(".nav-item").forEach(function (item) {
    item.addEventListener("click", closeSidebar);
  });

  /* =====================================================
           MESSAGE
        ===================================================== */

  function showMessage(message, type = "success") {
    globalMessage.textContent = message;

    globalMessage.className = "global-message show " + type;

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(function () {
      globalMessage.className = "global-message";
    }, 4000);
  }

  /* =====================================================
           USER
        ===================================================== */

  function extractUser(response) {
    if (!response) {
      return null;
    }

    if (response.user && typeof response.user === "object") {
      return response.user;
    }

    if (response.data && typeof response.data === "object") {
      if (response.data.user && typeof response.data.user === "object") {
        return response.data.user;
      }

      return response.data;
    }

    return response;
  }

  function getInitial(name) {
    return (
      String(name || "U")
        .trim()
        .charAt(0)
        .toUpperCase() || "U"
    );
  }

  function updateUser(user) {
    if (!user) {
      return;
    }

    const name = user.name || user.fullName || user.username || "User";

    const email = user.email || "-";

    const initial = getInitial(name);

    sidebarAvatar.textContent = initial;

    topbarAvatar.textContent = initial;

    sidebarUserName.textContent = name;

    sidebarUserEmail.textContent = email;

    topbarUserName.textContent = name;
  }

  /* =====================================================
           LOAD USER
        ===================================================== */

  async function loadUser() {
    try {
      const response = await getCurrentUser();

      const user = extractUser(response);

      updateUser(user);
    } catch (error) {
      console.error("USER LOAD ERROR:", error);

      if (error.status === 401 || error.status === 403) {
        window.location.href = "login.html";
      }
    }
  }

  /* =====================================================
           NORMALIZE NOTIFICATIONS
        ===================================================== */

  function normalizeNotifications(response) {
    if (!response) {
      return [];
    }

    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.notifications)) {
      return response.notifications;
    }

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    if (response.data && Array.isArray(response.data.notifications)) {
      return response.data.notifications;
    }

    return [];
  }

  /* =====================================================
           ICON
        ===================================================== */

  function getNotificationIcon(notification) {
    const type = String(
      notification.type ||
        notification.category ||
        notification.level ||
        "info",
    ).toLowerCase();

    if (type.includes("warning") || type.includes("budget")) {
      return {
        icon: "fa-solid fa-triangle-exclamation",

        className: "warning",
      };
    }

    if (type.includes("danger") || type.includes("error")) {
      return {
        icon: "fa-solid fa-circle-exclamation",

        className: "danger",
      };
    }

    if (type.includes("success") || type.includes("income")) {
      return {
        icon: "fa-solid fa-circle-check",

        className: "",
      };
    }

    return {
      icon: "fa-solid fa-circle-info",

      className: "info",
    };
  }

  /* =====================================================
           FORMAT DATE
        ===================================================== */

  function formatDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* =====================================================
           RENDER NOTIFICATIONS
        ===================================================== */

  function renderNotifications(notifications) {
    notificationList.innerHTML = "";

    if (!notifications || notifications.length === 0) {
      notificationList.classList.remove("has-items");

      emptyState.style.display = "flex";

      return;
    }

    emptyState.style.display = "none";

    notificationList.classList.add("has-items");

    notifications.forEach(function (notification) {
      const item = document.createElement("div");

      item.className = "notification-item";

      if (notification.read === false || notification.isRead === false) {
        item.classList.add("unread");
      }

      const iconData = getNotificationIcon(notification);

      const icon = document.createElement("div");

      icon.className = "notification-icon " + iconData.className;

      icon.innerHTML = `<i class="${iconData.icon}"></i>`;

      const body = document.createElement("div");

      body.className = "notification-body";

      const title = document.createElement("h3");

      title.textContent =
        notification.title || notification.subject || "Notification";

      const message = document.createElement("p");

      message.textContent =
        notification.message ||
        notification.description ||
        notification.content ||
        "";

      const time = document.createElement("span");

      time.className = "notification-time";

      time.textContent = formatDate(
        notification.createdAt ||
          notification.created_at ||
          notification.date ||
          notification.timestamp,
      );

      body.appendChild(title);

      body.appendChild(message);

      body.appendChild(time);

      const readButton = document.createElement("button");

      readButton.type = "button";

      readButton.className = "notification-read-button";

      readButton.title = "Mark as read";

      readButton.innerHTML = `<i class="fa-solid fa-check"></i>`;

      readButton.addEventListener("click", function () {
        markAsRead(notification, item);
      });

      item.appendChild(icon);

      item.appendChild(body);

      item.appendChild(readButton);

      notificationList.appendChild(item);
    });
  }

  /* =====================================================
           LOAD NOTIFICATIONS
        ===================================================== */

  async function loadNotifications() {
    try {
      /*
       * This endpoint is intentionally used only
       * when your backend provides notifications.
       *
       * No fake/pre-loaded notifications are created.
       */

      const response = await apiGet("/notifications");

      const notifications = normalizeNotifications(response);

      renderNotifications(notifications);
    } catch (error) {
      console.error("NOTIFICATION LOAD ERROR:", error);

      /*
       * A missing notification endpoint should
       * simply result in an empty notification
       * page instead of showing fake data.
       */

      if (error.status === 404) {
        renderNotifications([]);

        return;
      }

      if (error.status === 401 || error.status === 403) {
        window.location.href = "login.html";

        return;
      }

      renderNotifications([]);

      showMessage(error.message || "Unable to load notifications.", "error");
    }
  }

  /* =====================================================
           MARK ONE AS READ
        ===================================================== */

  async function markAsRead(notification, element) {
    const id = notification.id || notification.notificationId;

    if (!id) {
      element.classList.remove("unread");

      return;
    }

    try {
      await apiPut(`/api/notifications/${id}/read`, {});

      element.classList.remove("unread");
    } catch (error) {
      console.error("MARK READ ERROR:", error);

      if (error.status === 404) {
        /*
         * If the backend doesn't expose
         * the read endpoint, don't create
         * fake state.
         */

        return;
      }

      if (error.status === 401 || error.status === 403) {
        window.location.href = "login.html";
      }
    }
  }

  /* =====================================================
           MARK ALL AS READ
        ===================================================== */

  clearButton.addEventListener("click", async function () {
    clearButton.disabled = true;

    clearButton.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Updating...

                `;

    try {
      await apiPut("/api/notifications/read-all", {});

      document
        .querySelectorAll(".notification-item.unread")
        .forEach(function (item) {
          item.classList.remove("unread");
        });

      showMessage("All notifications marked as read.", "success");
    } catch (error) {
      console.error("READ ALL ERROR:", error);

      if (error.status === 404) {
        showMessage(
          "The notification read feature is not available in the backend yet.",
          "error",
        );
      } else if (error.status === 401 || error.status === 403) {
        window.location.href = "login.html";

        return;
      } else {
        showMessage(
          error.message || "Unable to update notifications.",
          "error",
        );
      }
    } finally {
      clearButton.disabled = false;

      clearButton.innerHTML = `

                        <i class="fa-solid fa-check-double"></i>

                        Mark All as Read

                    `;
    }
  });

  /* =====================================================
           LOGOUT
        ===================================================== */

  logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;

    try {
      await logoutUser();
    } catch (error) {
      console.warn("LOGOUT ERROR:", error);
    }

    window.location.href = "login.html";
  });

  /* =====================================================
           ESCAPE
        ===================================================== */

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });

  /* =====================================================
           INITIALIZE
        ===================================================== */

  await loadUser();

  await loadNotifications();

  console.log("Finance Tracker Notifications initialized.");
});
