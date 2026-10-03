import config from "../../config/config";

// BASE_URL = "http://localhost:8000/api/v1/users"
const BASE_URL = `${config.apiBaseUrl}/users`;

/**
 * 1. Login user (accepts email OR username)
 */
async function login(identity, password) {
  const isEmail = identity.includes("@");
  const payload = {
    [isEmail ? "email" : "username"]: identity.trim(),
    password: password.trim(),
  };

  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Automatically stores accessToken & refreshToken cookies
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Please check credentials.");
  }

  // Cross-domain fallback for Netlify <-> Render
  if (data.data?.accessToken) {
    localStorage.setItem("deckle_token", data.data.accessToken);
  }

  // Returns { user, personas, accessToken, refreshToken }
  return data.data;
}

/**
 * 2. Register new user
 */
async function register(userData) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  // Returns { user, defaultPersona }
  return data.data;
}

/**
 * 3. Logout user
 */
async function logout() {
  const token = localStorage.getItem("deckle_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Logout failed");
    }

    return data;
  } finally {
    localStorage.removeItem("deckle_token");
  }
}

/**
 * 4. Get Current User profile & personas (Session restoration on page reload)
 */
async function getCurrentUser() {
  const token = localStorage.getItem("deckle_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/current-user`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    localStorage.removeItem("deckle_token");
    throw new Error(data.message || "Session expired");
  }

  return data.data; // { user, personas }
}

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default authService;
