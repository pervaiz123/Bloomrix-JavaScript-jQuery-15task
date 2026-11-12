import {
  DEFAULT_FILTERS,
  VALID_STATUSES
} from "./constants.js";


export function debounce(callback, delay = 300) {
  let timerId;

  const debounced = (...args) => {
    clearTimeout(timerId);

    timerId = setTimeout(
      () => callback(...args),
      delay
    );
  };

  debounced.cancel = () => clearTimeout(timerId);

  return debounced;
}


export function filterAssignments(
  assignments,
  filters = DEFAULT_FILTERS
) {
  const query =
    (filters.search ?? "").trim().toLowerCase();

  const status =
    filters.status ?? "all";

  return assignments.filter((item) => {
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesStatus =
      status === "all" ||
      item.status === status;

    return matchesQuery && matchesStatus;
  });
}


export function readFiltersFromURL() {
  const params = new URLSearchParams(
    window.location.search
  );

  const status =
    params.get("status") ?? DEFAULT_FILTERS.status;

  return {
    search:
      params.get("q") ?? DEFAULT_FILTERS.search,

    status:
      status === "all" || VALID_STATUSES.includes(status)
        ? status
        : "all"
  };
}


export function writeFiltersToURL(
  filters,
  section = "profile",
  method = "replaceState"
) {
  const url = new URL(window.location.href);

  if (filters.search) {
    url.searchParams.set("q", filters.search);
  } else {
    url.searchParams.delete("q");
  }

  if (filters.status !== "all") {
    url.searchParams.set("status", filters.status);
  } else {
    url.searchParams.delete("status");
  }

  if (section === "profile") {
    url.searchParams.delete("section");
  } else {
    url.searchParams.set("section", section);
  }

  window.history[method](
    { filters, section },
    "",
    url
  );
}


export function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
