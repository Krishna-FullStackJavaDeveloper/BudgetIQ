// src/hooks/useCsvExporter.ts
import { FinancialReportDto } from "../components/Interface/report";

type Transaction = {
  date: string;
  source?: string;
  category?: string;
  type: string;
  amount: number;
};

type ChartDataItem = {
  period: string;
  income: number;
  expense: number;
};

type UseCsvExporterParams = {
  reportData: FinancialReportDto | null;
  transactions: Transaction[];
  chartData: ChartDataItem[];
  formatDate: (iso: string) => string;
};

export const useCsvExporter = ({
  reportData,
  transactions,
  chartData,
  formatDate,
}: UseCsvExporterParams) => {
  const exportToCsv = () => {
    if (!reportData || !transactions.length) return;

    const lines: string[] = [];

    // Summary
    lines.push(`User:,"${reportData.userFullName}"`);
    lines.push(`Date Range:,"${reportData.startDateStr}" to "${reportData.endDateStr}"`);
    lines.push(`Total Income:,${reportData.totalIncome?.toFixed(2)}`);
    lines.push(`Total Expense:,${reportData.totalExpense?.toFixed(2)}`);
    lines.push(`Net Balance:,${reportData.netBalance?.toFixed(2)}`);

    lines.push("");

    // Detailed Table Header
    lines.push(`Date,Source / Category,Type,Amount`);

    // Detailed Rows
    transactions.forEach((item) => {
      const date = formatDate(item.date);
      const sourceOrCategory = item.source || item.category || "";
      const type = item.type;
      const amount = item.amount.toFixed(2);

      lines.push(`"${date}","${sourceOrCategory}","${type}","${amount}"`);
    });

    lines.push("");

    // Chart data header
    lines.push("Period,Income,Expense");

    // Chart data rows
    chartData.forEach(({ period, income, expense }) => {
      lines.push(`"${period}",${income.toFixed(2)},${expense.toFixed(2)}`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `financial-report_${reportData.startDateStr}_${reportData.endDateStr}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCsv };
};
