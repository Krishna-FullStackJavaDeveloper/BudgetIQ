// 📄 src/service/useReportService.ts
import {
  fetchReportSummary,
  downloadPdfReport,
  fetchTransactionsReport,
  sendReportToFamily,
} from "../api/reportApi";
import { useNotification } from "../components/common/NotificationProvider";

export const useReportService = () => {
  const { showNotification } = useNotification();

  return {
    getReportSummary: async (startDate: string, endDate: string) => {
      try {
        const response = await fetchReportSummary(startDate, endDate);
        return response;
      } catch (err) {
        showNotification("Failed to fetch report summary.", "error");
        throw err;
      }
    },

    downloadReportPdf: async (startDate: string, endDate: string) => {
      try {
        const blob = await downloadPdfReport(startDate, endDate);
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);

        // Open a new blank window
        const newWindow = window.open();

        if (!newWindow) {
          showNotification(
            "Popup blocked. Please allow popups for this site.",
            "warning"
          );
          return;
        }

        // Write an HTML page that sets title and embeds the PDF
        newWindow.document.write(`
      <html>
        <head>
          <title>BudgrtIQ-report</title>
          <style>body,html { margin: 0; height: 100%; }</style>
        </head>
        <body>
          <embed src="${url}" type="application/pdf" width="100%" height="100%" />
        </body>
      </html>
    `);

        newWindow.document.close();

        showNotification("PDF report opened in a new tab.", "success");
      } catch (err) {
        showNotification("Failed to download report PDF.", "error");
        throw err;
      }
    },

    getTransactionDetails: async (startDate: string, endDate: string) => {
      try {
        const response = await fetchTransactionsReport(startDate, endDate);
        return response;
      } catch (err) {
        showNotification("Failed to fetch transaction data.", "error");
        throw err;
      }
    },

    sendMonthlyReportToFamily: async (
      startDate: string,
      endDate: string,
      recipientEmails: string[]
    ) => {
      try {
        const res = await sendReportToFamily(startDate, endDate, recipientEmails);
        showNotification("Report successfully sent to selected family members.", "success");
        return res;
      } catch (err) {
        showNotification("Failed to send report to family members.", "error");
        throw err;
      }
    },
  };
};
