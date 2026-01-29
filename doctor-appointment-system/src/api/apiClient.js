// Hardcoded for reliability during debugging
const BASE_URL = import.meta.env.DEV
  ? "/api/accounts"
  : "https://doctor-appointment-system-yzsw.onrender.com/api/accounts";
console.log("API BASE URL:", BASE_URL);

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, { ...options, headers });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  // Handle potential empty responses (e.g. 204 No Content)
  let data = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    const error = new Error(data?.error || data?.detail || "Request failed");
    error.response = { data, status: res.status };
    throw error;
  }

  return { data, status: res.status };
}

const apiClient = {
  get: (url, options) => apiFetch(url, { ...options, method: "GET" }),
  post: (url, body, options) => apiFetch(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (url, body, options) => apiFetch(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body, options) => apiFetch(url, { ...options, method: "PATCH", body: JSON.stringify(body) }),
  delete: (url, options) => apiFetch(url, { ...options, method: "DELETE" }),
};

export default apiClient;
