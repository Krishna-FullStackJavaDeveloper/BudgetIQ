// goalTrackerApi.ts
import axios from "axios";

const API_URL = "http://localhost:1711/api/goals";

const getAuthToken = () => {
  return localStorage.getItem("token"); // Adjust this based on your storage logic
};

const getHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

// 📌 Create a new saving goal
export const createSavingGoal = async (goalData: any) => {
  try {
    const response = await axios.post(`${API_URL}/create`, goalData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error creating saving goal:", error);
    throw error;
  }
};

// 📌 Get all goals of current user
export const fetchMySavingGoals = async () => {
  try {
    const response = await axios.get(`${API_URL}/my`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching saving goals:", error);
    throw error;
  }
};

// 📌 Get goal by ID
export const fetchGoalById = async (goalId: number) => {
  try {
    const response = await axios.get(`${API_URL}/${goalId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching goal details:", error);
    throw error;
  }
};

// 📌 Update goal
export const updateSavingGoal = async (goalId: number, updateData: any) => {
  try {
    const response = await axios.put(`${API_URL}/update/${goalId}`, updateData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating saving goal:", error);
    throw error;
  }
};

// 📌 Soft delete a goal
export const deleteSavingGoal = async (goalId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${goalId}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting saving goal:", error);
    throw error;
  }
};

// 📌 Add transaction to goal
export const addGoalTransaction = async (txnData: any) => {
  try {
    const response = await axios.post(`${API_URL}/add-transaction`, txnData, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error adding goal transaction:", error);
    throw error;
  }
};

// 📌 Get monthly progress chart data
export const getMonthlyProgress = async (goalId: number) => {
  try {
    const response = await axios.get(`${API_URL}/${goalId}/monthly-progress`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly progress:", error);
    throw error;
  }
};

// 📌 Search/paginate/sort goals
export const searchSavingGoals = async (filterParams: any) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      headers: getHeaders(),
      params: filterParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching saving goals:", error);
    throw error;
  } 
};

// 📌 Get all transactions for a specific goal
export const getTransactionsByGoalId = async (goalId: number) => {
  try {
    const response = await axios.get(`${API_URL}/${goalId}/transactions`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching transactions for goal ID ${goalId}:`, error);
    throw error;
  }
};

// 📌 Update a specific transaction by ID
export const updateTransaction = async (
  transactionId: number,
  updatedData: any
) => {
  try {
    const response = await axios.put(
      `${API_URL}/transactions/${transactionId}`,
      updatedData,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating transaction ID ${transactionId}:`, error);
    throw error;
  }
};

// 📌 Delete a specific transaction by ID
export const deleteTransaction = async (transactionId: number) => {
  try {
    const response = await axios.delete(
      `${API_URL}/transactions/${transactionId}`,
      {
        headers: getHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting transaction ID ${transactionId}:`, error);
    throw error;
  }
};

