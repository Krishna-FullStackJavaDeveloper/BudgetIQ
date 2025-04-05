import React, { useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip as MuiTooltip,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,

  ResponsiveContainer,
  LabelList,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { AccountBalanceWallet, Home, Subscriptions } from "@mui/icons-material";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import { Chart as ChartJS, Title, Tooltip as ChartToolTip , Legend , ArcElement, CategoryScale, LinearScale } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(Title, ChartToolTip, Legend, ArcElement, CategoryScale, LinearScale);
// Sample data with categories for Expense and date-wise

const chartData = [
    { date: "2025-04-01", amount: 200, source: "Salary" },
    { date: "2025-04-02", amount: 450, source: "Freelance" },
    { date: "2025-04-03", amount: 300, source: "Salary" },
    { date: "2025-04-04", amount: 600.3, source: "Freelance" },
    { date: "2025-04-05", amount: 350, source: "Salary" },
    { date: "2025-04-06", amount: 200, source: "Investment" },
    { date: "2025-04-07", amount: 450, source: "Freelance" },
    { date: "2025-04-08", amount: 120, source: "Salary" },
    { date: "2025-04-09", amount: 150, source: "Freelance" },
    { date: "2025-04-10", amount: 730, source: "Salary" },
    { date: "2025-04-11", amount: 60, source: "Freelance" },
    { date: "2025-04-12", amount: 50, source: "Salary" },
    { date: "2025-04-13", amount: 20, source: "Investment" },
    { date: "2025-04-14", amount: 50, source: "Freelance" },
  ];

const AddCashPage = () => {
  const [source, setSource] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null); // Set
  const [totalAmount, setTotalAmount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSubmit = () => {
    if (!source || !amount || !date) {
      //   alert("All fields are required!");
      setOpenSnackbar(true); // Show Snackbar for missing fields
      return;
    }

    setIsLoading(true); // Start loading
    setTimeout(() => {
      setIsLoading(false); // Stop loading after 2 seconds (simulate data processing)
      setOpenModal(true); // Open confirmation modal
    }, 2000);

    console.log("Submitted Data:", {
      source,
      amount,
      date: date?.format("YYYY-MM-DD"),
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Calculate total income by source
  const incomeBySource = chartData.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + item.amount;
    return acc;
  }, {} as { [key: string]: number });

  // Prepare data for chart
  const chartLabels = Object.keys(incomeBySource);
  const chartValues = Object.values(incomeBySource);

  // Handle successful form submission
  const handleFormSubmit = () => {
    setSnackbarMessage("Form submitted successfully!");
    setOpenSnackbar(true);
  };


  const sumBySource = (source: string) => {
    return chartData
      .filter((item) => item.source === source)
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const chartDataBySource = [
    { name: "Salary", amount: sumBySource("Salary") },
    { name: "Freelance", amount: sumBySource("Freelance") },
    { name: "Investment", amount: sumBySource("Investment") },
  ];

  const handleClear = () => {
    setSource("");
    setAmount("");
    setDate(null);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Helper to sum amounts
const sum = (arr: any[]) => arr.reduce((acc, cur) => acc + cur.amount, 0);

// Sort chartData by date ascending
const sortedData = [...chartData].sort((a, b) =>
  dayjs(a.date).diff(dayjs(b.date))
);

// Get up to the last 14 days
const last14Days = sortedData.slice(-14);

// Split smartly
let prev7Days: typeof chartData = [];
let last7Days: typeof chartData = [];

if (last14Days.length >= 7) {
  // If we have at least 7 days, split into two chunks
  last7Days = last14Days.slice(-7);
  prev7Days = last14Days.slice(0, last14Days.length - 7);
} else {
  // If less than 7 days, treat all as current week, no previous data
  last7Days = last14Days;
  prev7Days = [];
}

// Calculate sums
const last7Sum = sum(last7Days);
const prev7Sum = sum(prev7Days);

// Avoid divide-by-zero and cap at 100%
let rawChange =
  prev7Sum > 0 ? ((last7Sum - prev7Sum) / prev7Sum) * 100 : 0;
const cappedChange = Math.min(Math.abs(rawChange), 100);
const isPositive = rawChange >= 0;

// Final percent string
const formattedPercent =
  prev7Days.length > 0 && prev7Sum > 0
    ? `${isPositive ? "▲" : "▼"} ${cappedChange.toFixed(1)}%`
    : "N/A";

  return (
    <>
      <Grid container spacing={1} p={3}>
        {/* Income and Expense Summary */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              position: "relative",
              height: 420, // Increased height for buttons
              background: "linear-gradient(135deg, #f0f4f8, #ffffff)",
            }}
          >
            <CardContent sx={{ pb: 9 }}>
              {/* Title */}
              <Typography
                variant="h6"
                fontWeight={800}
                gutterBottom
                textAlign="center"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box component="span" sx={{ mx: 1 }}>
                  Add Cash
                </Box>
              </Typography>

              {/* Source Field */}
              <TextField
                label="Source"
                fullWidth
                value={source}
                onChange={(e) => setSource(e.target.value)}
                variant="outlined"
                onFocus={handleFocus}
                onBlur={handleBlur}
                sx={{
                  mt: 2,
                  mb: 2,
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: 2,
                  },
                }}
              />

              {/* Amount Field */}
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment:
                    isFocused || amount ? (
                      <InputAdornment position="start">$</InputAdornment>
                    ) : null,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: 2,
                  },
                }}
              />

              {/* Date Picker */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ width: "100%", mb: 2 }}>
                  <DatePicker
                    label="Select Date"
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    slotProps={{
                      textField: { fullWidth: true, variant: "outlined" },
                    }}
                    sx={{
                      mb: 2,
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        boxShadow: 2,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>

              {/* Buttons */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  fullWidth
                  sx={{ mr: 1 }}
                >
                  Submit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {}}
                  fullWidth
                >
                  Clear
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
                ml:1,
              boxShadow: 4,
              borderRadius: 3,
              position: "relative",
              height: 180,
              marginBottom: 2.5,
              background: "linear-gradient(135deg, #16A085, #1ABC9C)", // Modern gradient
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: 2,
            }}
          >
            {/* Icon */}
            <AccountBalanceWallet sx={{ fontSize: 50, mb: 1 }} />

            {/* Title */}
            <Typography variant="h6" fontWeight={700}>
              Total Balance
            </Typography>

            {/* Amount Display */}
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mt: 1,
                color: totalAmount >= 0 ? "#ffffff" : "#ffccbc", // Change color if negative
              }}
            >
              ${chartData.reduce((sum, item) => sum + item.amount, 0)}
              {/* ${totalAmount.toLocaleString()} */}
            </Typography>
          </Card>
          <Card
            sx={{
                ml: 1,
              borderRadius: 4,
              position: "relative",
              height: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 2,
              background: "linear-gradient(135deg, #f0f4f8, #ffffff)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            {/* Header Section */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              {/* Total Amount */}
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: "#2e7d32" }}
                >
                  ${chartData.reduce((sum, item) => sum + item.amount, 0)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#888" }}>
                  Last 30 days
                </Typography>
              </Box>

              {/* Trend Chip */}
              <Chip
                label={formattedPercent}
                size="small"
                sx={{
                  fontSize: 12,
                  borderRadius: "8px",
                  px: 1.5,
                  backgroundColor: isPositive ? "#e8f5e9" : "#ffebee",
                  color: isPositive ? "#2e7d32" : "#d32f2f",
                  fontWeight: 600,
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                }}
              />
            </Box>

            {/* Chart Section */}
            <Box
              sx={{
                width: "100%",
                flexGrow: 1,
                display: "flex",
                alignItems: "flex-end",
              }}
            >
              <LineChart width={500} height={90} data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;

                    const { amount } = payload[0].payload;
                    const formattedLabel = new Date(label).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                      }
                    );

                    return (
                      <div
                        style={{
                          padding: "10px",
                          background: "#333",
                          color: "#fff",
                          borderRadius: "8px",
                          minWidth: "120px",
                          textAlign: "left",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                          fontSize: "12px",
                        }}
                      >
                        <strong
                          style={{
                            display: "block",
                            marginBottom: "5px",
                            textAlign: "center",
                          }}
                        >
                          {formattedLabel}
                        </strong>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Amount:</span>
                          <span
                            style={{ fontWeight: "bold", color: "#4CAF50" }}
                          >
                            ${amount}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
        <Paper  sx={{
             mt: 2,
             borderRadius: 4,
             position: "relative",
             mb:3,
             display: "flex",
             flexDirection: "column",
             justifyContent: "space-between",
             padding: 2,
             background: "linear-gradient(135deg, #f0f4f8, #ffffff)",
             boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
             overflow: "hidden",
        }}>
      {/* <Typography variant="h5">Income Breakdown by Source</Typography> */}
      
  <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start" gap={2}>
    {/* Pie Chart */}
    <Box width={{ xs: "100%", md: "40%" }} display="flex" justifyContent="center">
      <div style={{ width: "250px", height: "270px" }}>
        <Pie
        style={{marginTop: 1}}
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: chartValues,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: { position: "bottom" },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `${tooltipItem.label}: $${tooltipItem.raw}`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </Box>

    {/* Table */}
    <Box width={{ xs: "100%", md: "55%" }}>
      <TableContainer component={Paper} sx={{mt: 4}}>
        <Table aria-label="income breakdown">
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell align="right">Amount ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chartDataBySource.map((item, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">{item.name}</TableCell>
                <TableCell align="right">${item.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </Box>

    </Paper>
    </Grid>
      </Grid>
      {/* Snackbar for Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Please fill in all fields"
      />

      {/* Modal/Popup for Add Cash Confirmation */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Cash Added Successfully</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Source: {source}</Typography>
          <Typography variant="body1">Amount: ${amount}</Typography>
          <Typography variant="body1">Date: {date?.format("YYYY-MM-DD")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Circular Progress for Loading States */}
      {isLoading && (
        <Box sx={{ position: "absolute", top: "50%", left: "50%" }}>
          <CircularProgress />
        </Box>
      )}
    </>
  );
};

export default AddCashPage;
