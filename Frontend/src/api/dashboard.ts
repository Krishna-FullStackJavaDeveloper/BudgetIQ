import axios from "axios";

const API_URL = "http://localhost:1711/api/summary"; // Adjust if the actual endpoint is different

// Function to get the token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token"); // Ensure token is set after login
};

/**
 * Fetches 6-month income, expense, and savings summary for the current user.
 */
export const fetchUserSummary = async () => {
  try {
    const token = getAuthToken();

    const response = await axios.get(`${API_URL}/getSummary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // This should include { message, data: { name, monthlyData }, statusCode }
  } catch (error) {
    console.error("Error fetching summary data:", error);
    throw error;
  }
};