import { loadPortalData } from "./api.js";
import { loadTheme, saveTheme } from "./storage.js";
import {
  debounce,
  filterAssignments,
  formatDate,
  readFiltersFromURL,
  writeFiltersToURL
} from "./utils.js";

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const sections = [
  "profile",
  "assignments",
  "application",
  "notifications"
];

const el = {
  connection: $("#connectionStatus"),
  theme: $("#themeToggle"),
  statusSummary: $("#applicationStatusSummary"),
  initials: $("#profileInitials"),
  name: $("#profileName"),
  role: $("#profileRole"),
  email: $("#profileEmail"),
  programme: $("#profileProgramme"),
  applicationId: $("#profileApplicationId"),
  search: $("#assignmentSearch"),
  filter: $("#statusFilter"),
  count: $("#assignmentCount"),
  list: $("#assignmentList"),
  empty: $("#assignmentEmpty"),
  applicationStatus: $("#applicationStatus"),
  nextStep: $("#applicationNextStep"),
  form: $("#applicationForm"),
  formFeedback: $("#formFeedback"),
  notifications: $("#notificationList"),
  notificationsEmpty: $("#notificationEmpty"),
  unread: $("#unreadCount"),
  dialog: $("#assignmentDialog"),
  modalContent: $("#modalContent"),
  toast: $("#toastRegion"),
  loadError: $("#loadError"),
  loadErrorText: $("#loadErrorText")
};

let assignments = [];
let notifications = [];
let filters = readFiltersFromURL();


function showToast(message, type = "success") {
  const node = document.createElement("div");

  node.className =
    `toast${type === "error" ? " toast-error" : ""}`;

  node.textContent = message;

  el.toast.append(node);

  setTimeout(() => node.remove(), 3000);
}


function renderProfile(profile, application) {
  el.initials.textContent = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "IN";

  el.name.textContent = profile.name;
  el.role.textContent = profile.role;
  el.email.textContent = profile.email;
  el.programme.textContent = profile.programme;
  el.applicationId.textContent = profile.applicationId;

  el.statusSummary.textContent = application.status;
  el.applicationStatus.textContent = application.status;
  el.nextStep.textContent = application.nextStep;

  $("#fullName").value = profile.name;
  $("#email").value = profile.email;
}


function createAssignmentCard(item) {
  const card = document.createElement("article");
  card.className = "section-card assignment-card";
  card.dataset.id = item.id;

  const top = document.createElement("div");
  top.className = "card-topline";

  const category = document.createElement("span");
  category.className = "eyebrow";
  category.textContent = item.category;

  const badge = document.createElement("span");

  badge.className =
    `status-badge status-${item.status
      .toLowerCase()
      .replaceAll(" ", "-")}`;

  badge.textContent = item.status;

  top.append(category, badge);

  const title = document.createElement("h3");
  title.textContent = item.title;

  const description = document.createElement("p");
  description.className = "muted small assignment-description";
  description.textContent = item.description;

  const due = document.createElement("p");
  due.className = "muted small";

  due.textContent =
    `Due: ${formatDate(item.dueDate)} · ${item.estimatedHours} hours`;

  const progressLabel = document.createElement("div");
  progressLabel.className = "progress-label";

  const label = document.createElement("span");
  label.textContent = "Progress";

  const value = document.createElement("strong");
  value.textContent = `${item.progress}%`;

  progressLabel.append(label, value);

  const track = document.createElement("div");
  track.className = "progress-track";

  const fill = document.createElement("span");
  fill.style.width = `${item.progress}%`;

  track.append(fill);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary-button details-button";
  button.dataset.action = "details";
  button.dataset.id = item.id;
  button.textContent = "View details";

  card.append(
    top,
    title,
    description,
    due,
    progressLabel,
    track,
    button
  );

  return card;
}


function renderAssignments() {
  const visible = filterAssignments(
    assignments,
    filters
  );

  el.list.replaceChildren(
    ...visible.map(createAssignmentCard)
  );

  el.count.textContent =
    `${visible.length} of ${assignments.length} assignments`;

  el.empty.hidden = visible.length !== 0;
  el.list.hidden = visible.length === 0;
}


function renderNotifications() {
  const nodes = notifications.map((item) => {
    const article = document.createElement("article");

    article.className =
      `section-card notification-item${
        item.read ? "" : " unread"
      }`;

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = item.title;

    const message = document.createElement("p");
    message.className = "muted small";
    message.textContent = item.message;

    const date = document.createElement("time");
    date.className = "muted tiny";
    date.textContent = formatDate(item.date);

    content.append(title, message, date);

    const button = document.createElement("button");
    button.className = "text-button";
    button.type = "button";
    button.dataset.action = "read-notification";
    button.dataset.id = item.id;
    button.textContent = item.read ? "Read" : "Mark as read";
    button.disabled = item.read;

    article.append(content, button);

    return article;
  });

  el.notifications.replaceChildren(...nodes);

  const unread = notifications.filter(
    (item) => !item.read
  ).length;

  el.unread.textContent = String(unread);
  el.unread.hidden = unread === 0;

  el.notificationsEmpty.hidden =
    notifications.length !== 0;
}


function showModal(item) {
  const title = document.createElement("h2");
  title.id = "modalTitle";
  title.textContent = item.title;

  const description = document.createElement("p");
  description.textContent = item.description;

  const detail = document.createElement("p");
  detail.className = "muted small";

  detail.textContent =
    `Status: ${item.status} · Due: ${formatDate(item.dueDate)} · Progress: ${item.progress}%`;

  el.modalContent.replaceChildren(
    title,
    description,
    detail
  );

  if (!el.dialog.open) {
    el.dialog.showModal();
  }
}


function setSection(name, method = "pushState") {
  if (!sections.includes(name)) return;

  $$("[data-section-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.sectionPanel !== name;
  });

  $$(".nav-tab").forEach((button) => {
    const active = button.dataset.section === name;

    button.classList.toggle("active", active);

    button.setAttribute(
      "aria-current",
      active ? "page" : "false"
    );
  });

  writeFiltersToURL(filters, name, method);
}


function applyHistoryState() {
  filters = readFiltersFromURL();

  el.search.value = filters.search;
  el.filter.value = filters.status;

  renderAssignments();

  const section =
    new URLSearchParams(window.location.search)
      .get("section") || "profile";

  setSection(section, "replaceState");
}


const runSearch = debounce(() => {
  const section =
    new URLSearchParams(window.location.search)
      .get("section") || "profile";

  writeFiltersToURL(filters, section);

  renderAssignments();
}, 300);


function attachEvents() {
  $(".nav-tabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");

    if (button) {
      setSection(button.dataset.section);
    }
  });


  el.search.addEventListener("input", () => {
    filters.search = el.search.value;
    runSearch();
  });


  el.filter.addEventListener("change", () => {
    filters.status = el.filter.value;

    const section =
      new URLSearchParams(window.location.search)
        .get("section") || "profile";

    writeFiltersToURL(filters, section);

    renderAssignments();
  });


  $("#clearFilters").addEventListener("click", () => {
    runSearch.cancel();

    filters = {
      search: "",
      status: "all"
    };

    el.search.value = "";
    el.filter.value = "all";

    const section =
      new URLSearchParams(window.location.search)
        .get("section") || "profile";

    writeFiltersToURL(filters, section);

    renderAssignments();
  });


  // Event delegation handles dynamically created assignment buttons.
  el.list.addEventListener("click", (event) => {
    const button = event.target.closest(
      '[data-action="details"]'
    );

    if (!button) return;

    const item = assignments.find(
      (assignment) => assignment.id === button.dataset.id
    );

    if (item) {
      showModal(item);
    }
  });


  // Event delegation handles dynamically created notification buttons.
  el.notifications.addEventListener("click", (event) => {
    const button = event.target.closest(
      '[data-action="read-notification"]'
    );

    if (!button) return;

    const item = notifications.find(
      (notification) => notification.id === button.dataset.id
    );

    if (!item) return;

    item.read = true;

    renderNotifications();
  });


  $("#markAllRead").addEventListener("click", () => {
    notifications.forEach((item) => {
      item.read = true;
    });

    renderNotifications();

    showToast("All notifications marked as read.");
  });


  $("#closeModal").addEventListener("click", () => {
    el.dialog.close();
  });


  el.dialog.addEventListener("click", (event) => {
    if (event.target === el.dialog) {
      el.dialog.close();
    }
  });


  el.theme.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

    setTheme(next);

    if (!saveTheme(next)) {
      showToast(
        "Theme could not be saved in this browser.",
        "error"
      );
    }
  });


  el.form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!el.form.reportValidity()) return;

    const formData = new FormData(el.form);
    const values = Object.fromEntries(formData.entries());

    el.formFeedback.textContent =
      `Update prepared for ${values.fullName}. No data was sent to a server.`;

    showToast("Application update prepared locally.");
  });


  $("#retryLoad").addEventListener("click", startPortal);

  window.addEventListener("popstate", applyHistoryState);
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
}


function setTheme(theme) {
  document.documentElement.dataset.theme = theme;

  el.theme.textContent =
    theme === "dark" ? "☀️" : "🌙";
}


function updateConnection() {
  el.connection.textContent =
    navigator.onLine ? "Online" : "Offline";

  el.connection.classList.toggle(
    "offline",
    !navigator.onLine
  );
}


async function startPortal() {
  el.loadError.hidden = true;

  try {
    const data = await loadPortalData();

    assignments = data.assignments;
    notifications = data.notifications;

    renderProfile(data.profile, data.application);
    renderAssignments();
    renderNotifications();

    el.search.value = filters.search;
    el.filter.value = filters.status;

  } catch (error) {
    el.loadErrorText.textContent =
      error.message || "Could not load portal data.";

    el.loadError.hidden = false;
  }
}


function initialise() {
  setTheme(loadTheme());
  updateConnection();
  attachEvents();

  const params = new URLSearchParams(
    window.location.search
  );

  setSection(
    params.get("section") || "profile",
    "replaceState"
  );

  el.search.value = filters.search;
  el.filter.value = filters.status;

  startPortal();
}


initialise();
