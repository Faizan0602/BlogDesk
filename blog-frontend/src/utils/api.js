function humanizeDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || item.detail)
      .filter(Boolean)
      .join(" ");
  }

  if (typeof detail === "string") {
    const lower = detail.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1).replaceAll("_", " ");
  }

  return "";
}

function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error.response) {
    return "Unable to connect to the server.";
  }

  const detail = humanizeDetail(error.response.data?.detail);

  if (detail) {
    return detail;
  }

  if (error.response.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.response.status === 404) {
    return "Blog not found.";
  }

  return fallback;
}

function normalizeBlogList(payload) {
  return {
    page: Number(payload?.page || 1),
    limit: Number(payload?.limit || 5),
    total: Number(payload?.total || 0),
    data: Array.isArray(payload?.data) ? payload.data : [],
  };
}

export { getErrorMessage, normalizeBlogList };
