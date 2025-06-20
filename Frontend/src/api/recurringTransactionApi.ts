// recurringTransactionApi.ts
import axios from "axios";

const API_URL = "http://localhost:1711/api/recurring";

const getAuthToken = () => {
  return localStorage.getItem("token"); // Adjust if token stored elsewhere
};

// Add a recurring transaction
export const addRecurringTransaction = async (requestData: any) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/add`, requestData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding recurring transaction:", error);
    throw error;
  }
};

export const getAllRecurringByUser = async ({
  page = 0,
  size = 4,
  sort = "createdAt,desc",
} = {}) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/user`, {
      params: { page, size, sort },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    throw error;
  }
};

// Get recurring transaction by id
export const getRecurringById = async (id: string) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching recurring transaction with id ${id}:`, error);
    throw error;
  }
};

// Update recurring transaction by id
export const updateRecurringTransaction = async (id: string, requestData: any) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, requestData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating recurring transaction with id ${id}:`, error);
    throw error;
  }
};

// Soft delete recurring transaction by id
export const deleteRecurringTransaction = async (id: string) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting recurring transaction with id ${id}:`, error);
    throw error;
  }
};
