// API calls for families
import axios from "axios";

const API_URL = "http://localhost:1711/api/families";

// Function to get the token from localStorage (or wherever you store it)
const getAuthToken = () => {
    return localStorage.getItem("token");  // Update this based on where you store the token
  };

// ✅ Fetch all families (admin only)
export const getAllFamilies = async (page: number, size: number, sort: string) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}&sort=${sort}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching families:", error);
    throw error;
  }
};

// ✅ Get family by ID (must be member or admin)
export const getFamilyById = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching family with ID ${id}:`, error);
    throw error;
  }
};

// ✅ Update family by ID (admin/moderator)
export const updateFamily = async (
  id: number,
  payload: { familyName: string; passkey?: string }
) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating family with ID ${id}:`, error);
    throw error;
  }
};

// ✅ Get the family where the logged-in user is a member
export const getMyFamily = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/my-family`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user's family:", error);
    throw error;
  }
};