// API calls for authentication
import axios from "axios";

const API_URL = "http://localhost:1711/api/auth";

export const login = async (username: string, password: string) => {
  return axios.post(`${API_URL}/login`, { username, password });
};

export const verifyOtp = async (username: string, otp: string) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      username,
      otp,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
export const signup = async (userData: any) => {
  return axios.post(`${API_URL}/signup`, userData);
};

export const forgotPassword = async (email: string) => {
  return axios.post(`${API_URL}/forgot-password`, { email }); // Use correct API_URL
};

// API call for resetting the password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        newPassword: newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }

    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Password reset failed: ' + error.message);
    } else {
      throw new Error('Password reset failed due to an unknown error');
    }
  }
};