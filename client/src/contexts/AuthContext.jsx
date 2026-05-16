// import { createContext, useState, useEffect, useCallback } from "react";
// import api from "../utils/axios";

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//  const [user, setUser] = useState(null);
//  const [loading, setLoading] = useState(true);

//  const logout = useCallback(() => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("user");
//   setUser(null);
//  }, []);

//  const login = async (email, password) => {
//   const { data } = await api.post("/auth/login", { email, password });
//   localStorage.setItem("token", data.token);
//   localStorage.setItem("user", JSON.stringify(data.user));
//   setUser(data.user);
//   return data.user;
//  };

//  const register = async (formData) => {
//   const { data } = await api.post("/auth/register", formData);
//   localStorage.setItem("token", data.token);
//   localStorage.setItem("user", JSON.stringify(data.user));
//   setUser(data.user);
//   return data.user;
//  };

//  const updateUser = (updatedUser) => {
//   setUser(updatedUser);
//   localStorage.setItem("user", JSON.stringify(updatedUser));
//  };

//  useEffect(() => {
//   const initializeAuth = async () => {
//    const token = localStorage.getItem("token");
//    const savedUser = localStorage.getItem("user");

//    if (token && savedUser) {
//     try {
//      setUser(JSON.parse(savedUser));
//      const res = await api.get("/auth/me");
//      setUser(res.data);
//     } catch {
//      logout();
//     }
//    }
//    setLoading(false);
//   };

//   initializeAuth();
//  }, [logout]);

//  return (
//   <AuthContext.Provider
//    value={{ user, loading, login, register, logout, updateUser }}
//   >
//    {children}
//   </AuthContext.Provider>
//  );
// };

import { createContext } from "react";

export const AuthContext = createContext(null);
