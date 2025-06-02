import axios from "axios";

const API_URL = "http://localhost:1711/api/expenses";

// Function to get the token from localStorage (or wherever you store it)
const getAuthToken = () => {
  return localStorage.getItem("token"); // Update this based on where you store the token
};

// Fetch all expenses
export const getAllExpenses = async (
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
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Add a new expenses
export const createExpense = async (expense: {
  category: string;
  amount: number;
  date: string;
}) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(API_URL, expense, {
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
// Update an existing expenses
export const updateExpense = async (
  id: number,
  expense: { category: string; amount: number; date: string }
) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, expense, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

// Delete a expense
export const deleteExpense = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

// Get by Id expense
export const getExpenseHistory = async (id: number) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/history/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting expense:", error);
    throw error;
  }
};

//Get Monthly Expenses
export const getMonthlyExpenses = async (month: number, year: number) => {
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

    return response.data; // full list of expenses for the month
  } catch (error) {
    console.log("Error getting expense:", error);
    throw error;
  }
};
