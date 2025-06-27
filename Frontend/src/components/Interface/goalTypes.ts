export interface GoalResponse {
  id: number;
  title: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  achieved: boolean;
  priority: number;
  sourceCategory: string;
  createdAt: string;
  updatedAt: string;
  totalSaved: number;
  progressPercent: number;
}

export interface MonthlyProgress {
  month: string;
  totalSaved: number;
}