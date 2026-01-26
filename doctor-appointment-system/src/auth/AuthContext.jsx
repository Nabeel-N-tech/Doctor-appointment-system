import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest } from "./auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    if (token && role) {
      setUser({ token, role, username: username || "User" });
    }
  }, []);

  const login = (token, role, username) => {
    localStorage.setItem("access", token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);

    setUser({
      token,
      role,
      username,
    });
  };

  const logout = () => {
    localStorage.clear();N
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
