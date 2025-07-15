import axios from "axios";

const API_URL = "http://localhost:1711/api/incomes";

// Function to get the token from localStorage (or wherever you store it)
const getAuthToken = () => {
  return localStorage.getItem("token"); // Update this based on where you store the token
};

// Fetch all Income
export const getAllIncome = async (
  page: number,
  size: number,
  sort: string,
  month?: number,
  year?: number
) => {
  try {
    const token = getAuthToken();

    // Build query string with optional month and year
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });

    if (month !== undefined) params.append("month", month.toString());
    if (year !== undefined) params.append("year", year.toString());

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching income:", error);
    throw error;
  }
};

// Add a new income
export const createIncome = async (income: {
  source: string;
  amount: number;
  date: string;
}) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(API_URL, income, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

// Update an existing income
export const updateIncome = async (
  id: number,
  income: { source: string; amount: number; date: string }
) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, income, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating income:", error);
    throw error;
  }
};

// Delete a income
export const deleteIncome = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting income:", error);
    throw error;
  }
};

// Get by Id income
export const getIncomeHistory = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/history/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting income:", error);
    throw error;
  }
};

//Get Monthly Income
export const getMonthlyIncome = async (month: number, year: number) => {
  try {
    const token = getAuthToken();

    const response = await axios.get(
      `${API_URL}/monthly?month=${month}&year=${year}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // full list of income for the month
  } catch (error) {
    console.log("Error getting income:", error);
    throw error;
  }
};
