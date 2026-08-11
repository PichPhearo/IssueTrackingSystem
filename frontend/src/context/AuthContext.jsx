import { createContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, me as meApi } from '../api/auth';

export const AuthContext = createContext(null);

// Survives StrictMode remounts (useRef does not)
let meInflight = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    let active = true;

    if (!meInflight) {
      meInflight = meApi().finally(() => {
        meInflight = null;
      });
    }

    meInflight
      .then((res) => {
        if (!active) return;
        const userData = res.data.data || res.data;
        setUser(userData);
        setToken(storedToken);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await loginApi(credentials);
    const { access_token, user: userData } = response.data;
    const resolvedUser = userData?.data || userData;

    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(resolvedUser);
    return response.data;
  };

  const register = async (data) => {
    const response = await registerApi(data);
    const { access_token, user: userData } = response.data;
    const resolvedUser = userData?.data || userData;

    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(resolvedUser);
    return response.data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network / token expiration errors on logout
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
