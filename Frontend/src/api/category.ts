// API calls for category
import axios from "axios";

const API_URL = "http://localhost:1711/api/categories";

// Function to get the token from localStorage (or wherever you store it)
const getAuthToken = () => {
    return localStorage.getItem("token");  // Update this based on where you store the token
  };


// Fetch all categories
export const getAllCategories = async (page: number, size: number, sort: string) => {
    try {
        const token = getAuthToken();
        const response = await axios.get(`${API_URL}?page=${page}&size=${size}&sort=${sort}`, {
            headers: {
                Authorization: `Bearer ${token}`  // Pass JWT token in Authorization header
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};
  
  // Add a new category
  export const addCategory = async (category: { name: string; iconName: string; color: string }) => {
    try {
        const token = getAuthToken();
        const response = await axios.post(API_URL, category, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
};
  // Update an existing category
  export const updateCategory = async (id: number, category: { name: string; iconName: string; color: string }) => {
    try {
        const token = getAuthToken();
        const response = await axios.put(`${API_URL}/${id}`, category, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};
  
  // Delete a category
  export const deleteCategory = async (id: number) => {
    try {
        const token = getAuthToken();
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};