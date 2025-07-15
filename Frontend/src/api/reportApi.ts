import axios from "axios";

const API_URL = "http://localhost:1711/api/report";

const getAuthToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

export const fetchReportSummary = async (
  startDate: string,
  endDate: string
) => {
  const response = await axios.get(`${API_URL}/summary`, {
    headers: getHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const downloadPdfReport = async (
  startDate: string,
  endDate: string
): Promise<Blob> => {
  const response = await axios.get(`${API_URL}/download`, {
    headers: getHeaders(),
    params: { startDate, endDate },
    responseType: "blob",
  });
  return response.data;
};

export const fetchTransactionsReport = async (
  startDate: string,
  endDate: string
) => {
  const response = await axios.get(`${API_URL}/transactions`, {
    headers: getHeaders(),
    params: { startDate, endDate },
  });
  return response.data;
};

export const sendReportToFamily = async (
  startDate: string,
  endDate: string,
  recipientEmails: string[]
) => {
  const response = await axios.post(
    `${API_URL}/send-to-family`,
    {
      startDate,
      endDate,
      recipientEmails,
    },
    {
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};