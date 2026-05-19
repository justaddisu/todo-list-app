import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, meRequest, registerRequest, updateProfileRequest } from "../api/authApi";
import { setAuthToken } from "../api/http";

const AuthContext = createContext(null);

const STORAGE_KEY = "todo_mern_auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setIsBootstrapping(false);
      return;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.token) {
      setIsBootstrapping(false);
      return;
    }

    setToken(parsed.token);
    setAuthToken(parsed.token);

    meRequest()
      .then((response) => {
        setUser(response.user);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken("");
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken }));
  };

  const register = async (payload) => {
    const response = await registerRequest(payload);
    persistAuth(response.token, response.user);
    return response;
  };

  const login = async (payload) => {
    const response = await loginRequest(payload);
    persistAuth(response.token, response.user);
    return response;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setAuthToken("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = async (payload) => {
    const response = await updateProfileRequest(payload);
    setUser(response.user);
    return response;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      register,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(token),
      isBootstrapping,
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
