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
