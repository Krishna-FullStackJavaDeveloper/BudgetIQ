export interface SavingGoalResponse {
  id: number;
  title: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  achieved: boolean;
  priority: number;
  sourceCategory?: string;
  createdAt: string;
  updatedAt: string;
  totalSaved: number;
  progressPercent: number;
}

export interface MonthlyProgressResponse {
  month: string;
  totalSaved: number;
}