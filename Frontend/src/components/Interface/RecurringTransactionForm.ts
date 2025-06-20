export interface RecurringTransactionForm {
  type: "INCOME" | "EXPENSE";
  title: string;
  amount: string; // keep as string because it’s from input field
  category: string; //optional
  startDate: string; // format "YYYY-MM-DD"
  repeatCycle: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  repeatDay: string; // string because user types day or weekday name
  endDate: string; // optional date string, can be empty string
}
