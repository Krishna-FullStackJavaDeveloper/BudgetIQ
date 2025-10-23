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
        showNotification(
          `Goal "${data.title}" created successfully!`,
          "success"
        );
        return res;
      } catch (err) {
        showNotification(`Failed to create goal "${data.title}".`, "error");
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
        showNotification(
          `Goal "${data.title}" updated successfully!`,
          "success"
        );
        return res;
      } catch (err) {
        showNotification(`Failed to update goal "${data.title}".`, "error");
        throw err;
      }
    },

    deleteGoal: async (id: number, title?: string) => {
      try {
        const res = await deleteSavingGoal(id);
        showNotification(`Goal deleted.`, "info");
        return res;
      } catch (err) {
        showNotification(`Failed to delete goal.`, "error");
        throw err;
      }
    },

    addTransaction: async (data: any) => {
      try {
        const res = await addGoalTransaction(data);
        // Show clear message using sourceNote and amount
        showNotification(
          `Transaction "${data.sourceNote}" of $${data.amount} added successfully!`,
          "success"
        );
        return res;
      } catch (err: any) {
        const msg = err?.response?.data?.data || "";
        if (msg.includes("Goal already achieved")) {
          showNotification(
            `Cannot add transaction "${data.sourceNote}" of $${data.amount}. Goal already achieved.`,
            "warning"
          );
        } else if (msg.includes("Amount exceeds target")) {
          showNotification(msg, "error");
        } else {
          showNotification(
            `Failed to add transaction "${data.sourceNote}" of $${data.amount}.`,
            "error"
          );
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
        showNotification(
          `Transaction "${data.sourceNote}" of $${data.amount} updated successfully!`,
          "success"
        );
        return res;
      } catch (err) {
        showNotification(
          `Failed to update transaction "${data.sourceNote}" of $${data.amount}.`,
          "error"
        );
        throw err;
      }
    },

    deleteTransaction: async (id: number, txn: any) => {
      try {
        const res = await deleteTransaction(id);
        showNotification(
          `Transaction "${txn.sourceNote}" of $${txn.amount} deleted.`,
          "info"
        );
        return res;
      } catch (err) {
        showNotification(
          `Failed to delete transaction "${txn.sourceNote}".`,
          "error"
        );
        throw err;
      }
    },
  };
};
