import React from 'react';
    const AuthContext = React.createContext(null);
    export const useAuth = () => React.useContext(AuthContext);
    export const AuthProvider = ({ children }) => {
      return React.createElement(AuthContext.Provider, { value: null }, children);
    };