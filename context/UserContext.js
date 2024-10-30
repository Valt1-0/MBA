import React, { createContext, useEffect, useState } from "react";
import {  onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";
// Create a context for the user
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userInfo, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => { 
    console.log("auth", auth);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, isAuthenticated, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
