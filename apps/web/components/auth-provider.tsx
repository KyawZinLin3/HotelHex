"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "hotelhex.room-session";
type AppUser = Record<string, any>;
type AuthContextValue = {
  token: string;
  user: AppUser | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

async function responseData(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : data.message || "Something went wrong. Please try again.");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  const discard = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }, []);

  const refresh = useCallback(async (sessionToken: string) => {
    const response = await fetch(API + "/v1/security/auth/me", { headers: { Authorization: "Bearer " + sessionToken } });
    return responseData(response);
  }, []);

  useEffect(() => {
    let active = true;
    const existing = sessionStorage.getItem(TOKEN_KEY) || "";
    if (!existing) { setReady(true); return () => { active = false; }; }
    setToken(existing);
    refresh(existing).then((currentUser) => {
      if (active) setUser(currentUser);
    }).catch(() => {
      if (active) discard();
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, [discard, refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await responseData(await fetch(API + "/v1/security/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }),
    }));
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser({ ...result.user, mustChangePassword: result.mustChangePassword });
    setReady(true);
    return !!result.mustChangePassword;
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await responseData(await fetch(API + "/v1/security/auth/change-password", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ oldPassword, newPassword }),
    }));
    discard();
  }, [discard, token]);

  const logout = useCallback(async () => {
    if (token) await fetch(API + "/v1/security/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + token } }).catch(() => undefined);
    discard();
  }, [discard, token]);

  const value = useMemo(() => ({ token, user, ready, login, changePassword, logout }), [token, user, ready, login, changePassword, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
