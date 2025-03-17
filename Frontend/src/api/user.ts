// API calls for users
import axios from "axios";

const API_URL = "http://localhost:1711/api/users";

// Function to fetch user details
export const getUserDetails = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User is not authenticated");
    }

    // Add Authorization header with token
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token to the request header
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user details");
  }
  };

  // Function to fetch user details
export const getUsersForAdmin = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User is not authenticated");
    }

    // Add Authorization header with token
    const response = await axios.get(`${API_URL}/admin/getAllUsers`, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token to the request header
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user details");
  }
  };

   // Function to fetch user details for family admin
export const getUsersForFamilyAdmin = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("User is not authenticated");
    }

    // Add Authorization header with token
    const response = await axios.get(`${API_URL}/mod/getAllUsers/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the token to the request header
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user details");
  }
  };