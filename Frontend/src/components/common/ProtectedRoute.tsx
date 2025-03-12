import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;


/* Added import React and import { Navigate } from React Router to prevent errors.
Used React.FC<ProtectedRouteProps> for better type safety.
children is wrapped in a fragment <>{children}</> for better performance. */