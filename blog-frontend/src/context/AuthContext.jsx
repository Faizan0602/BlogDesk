/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "../api/axios";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken("");
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function restoreUser() {
      if (!token) {
        return;
      }

      try {
        const response = await api.get("/me");

        if (!ignore) {
          setUser(response.data);
        }
      } catch {
        if (!ignore) {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    restoreUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const login = async (credentials) => {
    const response = await api.post("/login", credentials);
    const accessToken = response.data?.access_token;

    if (!accessToken) {
      throw new Error("The login response did not include an access token.");
    }

    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setLoading(true);

    try {
      const meResponse = await api.get("/me");
      setUser(meResponse.data);
    } finally {
      setLoading(false);
    }

    return accessToken;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setLoading(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      loading,
      token,
      user,
      login,
      logout,
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };
