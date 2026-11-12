const DATA_URL = new URL(
  "../data/assignments.json",
  import.meta.url
);

export async function loadPortalData({ signal } = {}) {
  const response = await fetch(DATA_URL, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (!response.ok) {
    throw new Error(
      `Could not load portal data (HTTP ${response.status}).`
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Portal data is empty or invalid JSON."
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new TypeError(
      "Portal data must be a JSON object."
    );
  }

  const profile =
    data.profile && typeof data.profile === "object"
      ? data.profile
      : {};

  const application =
    data.application && typeof data.application === "object"
      ? data.application
      : {};

  if (!Array.isArray(data.assignments)) {
    throw new TypeError(
      "Portal data must contain an assignments array."
    );
  }

  const assignments = data.assignments
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    )
    .map((item, index) => ({
      id: String(item.id ?? `assignment-${index + 1}`),

      title:
        typeof item.title === "string" && item.title.trim()
          ? item.title.trim()
          : "Untitled assignment",

      description:
        typeof item.description === "string"
          ? item.description
          : "No description provided.",

      status:
        ["Pending", "In Progress", "Completed"].includes(item.status)
          ? item.status
          : "Pending",

      dueDate:
        typeof item.dueDate === "string"
          ? item.dueDate
          : "",

      progress: Number.isFinite(Number(item.progress))
        ? Math.max(0, Math.min(100, Number(item.progress)))
        : 0,

      category:
        typeof item.category === "string"
          ? item.category
          : "General",

      estimatedHours: Number.isFinite(Number(item.estimatedHours))
        ? Math.max(0, Number(item.estimatedHours))
        : 0
    }));

  const notifications = Array.isArray(data.notifications)
    ? data.notifications
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item)
        )
        .map((item, index) => ({
          id: String(item.id ?? `notification-${index + 1}`),

          title:
            typeof item.title === "string"
              ? item.title
              : "Notification",

          message:
            typeof item.message === "string"
              ? item.message
              : "",

          date:
            typeof item.date === "string"
              ? item.date
              : "",

          read: Boolean(item.read)
        }))
    : [];

  return {
    profile: {
      name:
        typeof profile.name === "string"
          ? profile.name
          : "Intern",

      role:
        typeof profile.role === "string"
          ? profile.role
          : "Trainee",

      email:
        typeof profile.email === "string"
          ? profile.email
          : "Not provided",

      programme:
        typeof profile.programme === "string"
          ? profile.programme
          : "Not assigned",

      applicationId:
        typeof profile.applicationId === "string"
          ? profile.applicationId
          : "Not assigned"
    },

    application: {
      status:
        typeof application.status === "string"
          ? application.status
          : "Not available",

      nextStep:
        typeof application.nextStep === "string"
          ? application.nextStep
          : "No next step is available."
    },

    assignments,
    notifications
  };
}
