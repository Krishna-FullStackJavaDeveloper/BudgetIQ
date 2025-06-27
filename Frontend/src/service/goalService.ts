import {
  addGoalTransaction,
  createSavingGoal,
  deleteSavingGoal,
  fetchGoalById,
  fetchMySavingGoals,
  getMonthlyProgress,
  searchSavingGoals,
  updateSavingGoal,
} from "../api/goalTrackerApi";

export const GoalService = {
  createGoal: async (data: any) => {
    return await createSavingGoal(data);
  },

  getAllGoals: async () => {
    return await fetchMySavingGoals();
  },

  getGoalById: async (id: number) => {
    return await fetchGoalById(id);
  },

  updateGoal: async (id: number, data: any) => {
    return await updateSavingGoal(id, data);
  },

  deleteGoal: async (id: number) => {
    return await deleteSavingGoal(id);
  },

  addTransaction: async (data: any) => {
    return await addGoalTransaction(data);
  },

  getMonthlyProgress: async (goalId: number) => {
    return await getMonthlyProgress(goalId);
  },

  searchGoals: async (filters: any) => {
    return await searchSavingGoals(filters);
  },
};
