import { API_BASE_URL } from "./options";

export class ApiError extends Error {
  constructor(message, details = [], statusCode = null) {
    super(message);
    this.name = "ApiError";
    this.details = details;
    this.statusCode = statusCode;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function submitApplication(formData) {
  const response = await fetch(`${API_BASE_URL}/apply`, {
    method: "POST",
    body: formData
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(payload?.message || "Unable to submit the application.", payload?.errors || [], response.status);
  }

  return payload;
}

export async function fetchApplications({ page = 1, limit = 12, search = "", internshipType = "", role = "", adminToken = "" } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search.trim()) {
    query.set("search", search.trim());
  }

  if (internshipType) {
    query.set("internshipType", internshipType);
  }

  if (role) {
    query.set("role", role);
  }

  const requestOptions = {};

  if (adminToken.trim()) {
    requestOptions.headers = {
      "x-admin-token": adminToken.trim()
    };
  }

  const response = await fetch(`${API_BASE_URL}/applications?${query.toString()}`, requestOptions);
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(payload?.message || "Unable to fetch applications.", [], response.status);
  }

  return payload;
}
