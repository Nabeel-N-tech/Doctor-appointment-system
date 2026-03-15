const isDev = import.meta.env.DEV;
let BASE_URL = "";

if (isDev) {
  // In development, use relative path to trigger Vite proxy
  BASE_URL = "/api/accounts";
} else {
  // Force production URL to ensure connection
  BASE_URL = "https://doctor-appointment-system-yzsw.onrender.com/api/accounts";
}

console.log("Environment:", isDev ? "Development" : "Production");
console.log("API BASE URL:", BASE_URL);

/**
 * ✅ IMPROVED: Enhanced API client with better error handling
 */
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers, timeout: 30000 });

    // ✅ Handle 401 Unauthorized - Session expired
    if (res.status === 401) {
      localStorage.clear();
      // Redirect to login without showing error (user might already be redirected)
      if (window.location.pathname !== '/login') {
        window.location.href = "/login?sessionExpired=true";
      }
      throw new Error("Your session has expired. Please log in again.");
    }

    // ✅ Handle 403 Forbidden - Permission denied
    if (res.status === 403) {
      const error = new Error("You do not have permission to perform this action");
      error.response = { status: 403 };
      throw error;
    }

    // ✅ Handle potential empty responses (e.g. 204 No Content)
    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }

    if (!res.ok) {
      const error = new Error(data?.error || data?.detail || `HTTP ${res.status}: Request failed`);
      error.response = { data, status: res.status };
      throw error;
    }

    return { data, status: res.status };
  } catch (err) {
    // ✅ Network or parsing error
    if (err instanceof TypeError) {
      const error = new Error("Network connection failed. Please check your internet and try again.");
      error.response = { status: 0 };
      throw error;
    }
    throw err;
  }
}

const apiClient = {
  get: (url, options) => apiFetch(url, { ...options, method: "GET" }),
  post: (url, body, options) => apiFetch(url, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  put: (url, body, options) => apiFetch(url, {
    ...options,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  patch: (url, body, options) => apiFetch(url, {
    ...options,
    method: "PATCH",
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  delete: (url, options) => apiFetch(url, { ...options, method: "DELETE" }),
};

export default apiClient;
