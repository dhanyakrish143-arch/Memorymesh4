import { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    saveSession(data);
  };

  const adminLogin = async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });

    if (data.user?.role !== "admin") {
      throw new Error("This account does not have administrator access.");
    }

    saveSession(data);
  };

  const register = async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    saveSession(data);
  };

  const updateUser = (updatedUser) => {
    setUser((current) => {
      const updated = { ...current, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, adminLogin, register, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

