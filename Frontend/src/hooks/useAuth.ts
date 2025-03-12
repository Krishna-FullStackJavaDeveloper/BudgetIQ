import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { loginSuccess, logout } from "../redux/slices/authSlice";
import React from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; 

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:1711";

const isTokenExpired = (token: string) => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate(); 

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userString = localStorage.getItem("user"); // This should now be user ID
    const rolesString = localStorage.getItem("roles");
  
    if (token && refreshToken && userString) {
      try {
        const user = JSON.parse(userString); // Convert back to number (user ID)
        const roles = rolesString ? JSON.parse(rolesString) : [];
  
        dispatch(loginSuccess({
          user, // user ID
          token,
          refreshToken,
          roles,
          isAuthenticated: true
        }));
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        handleLogout(); // Clear corrupted data and log out
      }
    }
    // } else {
    //   // handleLogout(); // If data is missing, force logout
    //   console.log("Application Running...");
    // }
  }, [dispatch]);

  const handleLogin = (data: any) => {
    if (data?.token && data?.refreshToken && data?.id) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.id)); // Store user ID instead of object
      localStorage.setItem("roles", JSON.stringify(data.roles || []));
  
      dispatch(loginSuccess({
        user: data.id,  // Store only user ID
        token: data.token,
        refreshToken: data.refreshToken,
        roles: data.roles || [],
        isAuthenticated: true
      }));
    } else {
      console.error("User data is incomplete during login.");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("roles");
    navigate("/");
  };

  let isRefreshing = false;

  const refreshAccessToken = async (refreshToken: string) => {
   if (isRefreshing) return; // Prevent multiple requests
  isRefreshing = true; // Set flag to prevent duplicate requests

  console.log("Attempting to refresh access token...");
    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (response.ok) {
        const newAccessToken = data.data;
        const currentUser = JSON.parse(localStorage.getItem("user") || '{}');
        const rolesString = localStorage.getItem("roles");
        const roles = rolesString ? JSON.parse(rolesString) : [];
        localStorage.setItem("token", newAccessToken);
        dispatch(loginSuccess({
          user: currentUser, token: newAccessToken, refreshToken,
          isAuthenticated: true,
          roles
        }));
      } else {
        console.error('Failed to refresh token:', data.message);
        handleLogout();
      }
    } catch (error) {
      console.error('Error during token refresh:', error);
      handleLogout();
    }finally {
      isRefreshing = false; // Reset flag after request completes
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    if (token && refreshToken) {
      const isAccessTokenExpired = isTokenExpired(token);
      
      if (isAccessTokenExpired) {
        const isRefreshTokenExpired = isTokenExpired(refreshToken);
        if (isRefreshTokenExpired) {
          handleLogout();
        } else {
          refreshAccessToken(refreshToken);
        }
      }
    }
  }, []);

  return { ...auth, handleLogin, handleLogout };
};
