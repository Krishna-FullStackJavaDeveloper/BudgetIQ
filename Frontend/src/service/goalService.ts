import {
  addGoalTransaction,
  createSavingGoal,
  deleteSavingGoal,
  deleteTransaction,
  fetchGoalById,
  fetchMySavingGoals,
  getMonthlyProgress,
  getTransactionsByGoalId,
  searchSavingGoals,
  updateSavingGoal,
  updateTransaction,
} from "../api/goalTrackerApi";
import { useNotification } from "../components/common/NotificationProvider";

export const useGoalService = () => {
  const { showNotification } = useNotification();

  return {
    createGoal: async (data: any) => {
      try {
        const res = await createSavingGoal(data);
        showNotification("Goal created successfully!", "success");
        return res;
      } catch (err) {
        showNotification("Failed to create goal.", "error");
        throw err;
      }
    },

    getAllGoals: async () => {
      return await fetchMySavingGoals();
    },

    getGoalById: async (id: number) => {
      return await fetchGoalById(id);
    },

    updateGoal: async (id: number, data: any) => {
      try {
        const res = await updateSavingGoal(id, data);
        showNotification("Goal updated successfully!", "success");
        return res;
      } catch (err) {
        showNotification("Failed to update goal.", "error");
        throw err;
      }
    },

    deleteGoal: async (id: number) => {
      try {
        const res = await deleteSavingGoal(id);
        showNotification("Goal deleted.", "info");
        return res;
      } catch (err) {
        showNotification("Failed to delete goal.", "error");
        throw err;
      }
    },

    addTransaction: async (data: any) => {
      try {
        const res = await addGoalTransaction(data);
        showNotification("Transaction added!", "success");
        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.data || "";
        if (msg.includes("Goal already achieved")) {
          showNotification("Goal is achieved. You cannot add new transactions.", "warning");
        } else if (msg.includes("Amount exceeds target")) {
          showNotification(msg, "error");
        } else {
          showNotification("Failed to add transaction.", "error");
        }
        throw err;
      }
    },

    getMonthlyProgress: async (goalId: number) => {
      return await getMonthlyProgress(goalId);
    },

    searchGoals: async (filters: any) => {
      return await searchSavingGoals(filters);
    },

    getTransactionsByGoalId: async (goalId: number) => {
      return await getTransactionsByGoalId(goalId);
    },

    updateTransaction: async (id: number, data: any) => {
      try {
        const res = await updateTransaction(id, data);
        showNotification("Transaction updated!", "success");
        return res;
      } catch (err) {
        showNotification("Failed to update transaction.", "error");
        throw err;
      }
    },

    deleteTransaction: async (id: number) => {
      try {
        const res = await deleteTransaction(id);
        showNotification("Transaction deleted.", "info");
        return res;
      } catch (err) {
        showNotification("Failed to delete transaction.", "error");
        throw err;
      }
    },
  };
};

