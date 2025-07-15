export interface FinancialReportDto {
  userFullName: string;
  startDateStr: string;
  endDateStr: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomes: {
    date: string;
    source: string;
    amount: number;
  }[];
  expenses: {
    date: string;
    category: string;
    amount: number;
  }[];
  monthlyBreakdown?: any[]; // Optional if you're using charts later
}