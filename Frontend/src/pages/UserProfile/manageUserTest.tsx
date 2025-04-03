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
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LabelList,
  Tooltip,
} from "recharts";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { Home, Subscriptions } from "@mui/icons-material";
import { CheckCircle, Edit, Delete } from "@mui/icons-material";
// Sample data with categories for Expense and date-wise
const data = [
  {
    date: "2025-01-01",
    Income: 3000,
    Rent: 800,
    Subscription: 700,
    Expense: 1500,
  },
  {
    date: "2025-01-08",
    Income: 3500,
    Rent: 900,
    Subscription: 600,
    Expense: 1800,
  },
  {
    date: "2025-01-15",
    Income: 3200,
    Rent: 850,
    Subscription: 750,
    Expense: 1600,
  },
  {
    date: "2025-01-22",
    Income: 4000,
    Rent: 1000,
    Subscription: 900,
    Expense: 1900,
  },
];

const transactions = [
  {
    category: "Rent",
    description: "Monthly House Rent",
    amount: "$1200",
    dueDate: "April 5, 2025",
    icon: <Home sx={{ color: "#3B48E0" }} />,
  },
  {
    category: "Subscription",
    description: "Netflix Premium",
    amount: "$15",
    dueDate: "April 10, 2025",
    icon: <Subscriptions sx={{ color: "#D32F2F" }} />,
  },
];

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 3,
      p: 2,
      textAlign: "center",
      bgcolor: "background.paper",
    }}
  >
    <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
      <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
    </Box>
    <Typography variant="h6" color="textSecondary">
      {title}
    </Typography>
    <Typography variant="h4" color={color}>
      {value}
    </Typography>
  </Card>
);

const ManageUserTest = () => {
  const [filteredData, setFilteredData] = React.useState(data);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [message, setMessage] = React.useState("");

  const handleDateChange = (newStart: Dayjs | null, newEnd: Dayjs | null) => {
    setStartDate(newStart);
    setEndDate(newEnd);

    if (!newStart || !newEnd) {
      setFilteredData(data); // Reset to all data if no range is selected
      setMessage("");
      return;
    }

    const filtered = data.filter((entry) => {
      const entryDate = dayjs(entry.date);
      return (
        entryDate.isAfter(newStart.subtract(1, "day")) &&
        entryDate.isBefore(newEnd.add(1, "day"))
      );
    });

    setFilteredData(filtered);

    if (filtered.length === 0) {
      setMessage("Wow, congrats! You saved some money during this time.");
    } else {
      setMessage("");
    }
  };

  return (
    <>
      <Chip
        icon={<NotificationsActiveIcon />}
        label="Rent Due in 5 Days"
        color="warning"
        sx={{ m: 1 }}
      />
      <Chip
        icon={<NotificationsActiveIcon />}
        label="Credit Card Bill Due Tomorrow"
        color="error"
        sx={{ m: 1 }}
      />
      <Grid container spacing={3} p={3}>
        {/* Income and Expense Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MonetizationOnIcon />}
            title="Total Income"
            value="$8,500"
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingDownIcon />}
            title="Total Expense"
            value="$6,000"
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon />}
            title="Total Savings"
            value="$2,500"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CurrencyExchangeIcon />}
            title="Currency & Time"
            value="USD | GMT -5"
            color="warning.main"
          />
        </Grid>

        {/*  Stacked Bar Chart with hover effects and different colors for categories */}
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                p: 3,
                background: "#f9f9f9",
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  mb={2}
                >
                  <Typography variant="h6" color="primary.dark">
                    Categorized Expense Overview
                  </Typography>
                  <Box display="flex" gap={2}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newVal) => handleDateChange(newVal, endDate)}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newVal) => handleDateChange(startDate, newVal)}
                    />
                  </Box>
                </Box>

                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis dataKey="date" tick={{ fill: "#666" }} />
                    <YAxis tick={{ fill: "#666" }} />
                    <Tooltip
                      content={({ payload, label }) => {
                        if (!payload || payload.length === 0) return null;
                        const { Income, Rent, Subscription, Expense } =
                          payload[0].payload;
                        return (
                          <div
                            style={{
                              padding: "10px",
                              background: "#333",
                              color: "#fff",
                              borderRadius: "8px",
                              width: "180px",
                              textAlign: "left",
                              boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <strong
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                textAlign: "center",
                              }}
                            >
                              {label}
                            </strong>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>Income:</span>{" "}
                              <span style={{ color: "#00C49F" }}>
                                ${Income}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>Expense:</span>{" "}
                              <span style={{ color: "#FF8042" }}>
                                ${Expense}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>Rent:</span>{" "}
                              <span style={{ color: "#8884d8" }}>${Rent}</span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>Subscription:</span>{" "}
                              <span style={{ color: "#82ca9d" }}>
                                ${Subscription}
                              </span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Rent" fill="#8884d8" radius={[10, 10, 0, 0]}>
                      <LabelList
                        dataKey="Rent"
                        position="top"
                        fill="#8884d8"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar
                      dataKey="Subscription"
                      fill="#82ca9d"
                      radius={[10, 10, 0, 0]}
                    >
                      <LabelList
                        dataKey="Subscription"
                        position="top"
                        fill="#82ca9d"
                        fontSize={12}
                      />
                    </Bar>
                    <Bar
                      dataKey="Expense"
                      fill="#FF8042"
                      radius={[10, 10, 0, 0]}
                    >
                      <LabelList
                        dataKey="Expense"
                        position="top"
                        fill="#FF8042"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </LocalizationProvider>
        </Grid>

        {/* Recurring Transactions */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              p: 2,
              background: "linear-gradient(135deg, #f5f7fa 30%, #c3cfe2 100%)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#333",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                {/* 🔁  */}
                Recurring Transactions
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#9001CB" }}>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Category
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Amount
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Next Due
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn, index) => (
                      <TableRow
                        key={txn.category}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#fff",
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Avatar sx={{ bgcolor: "transparent" }}>
                              {txn.icon}
                            </Avatar>
                            {txn.category}
                          </Box>
                        </TableCell>
                        <TableCell>{txn.description}</TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#0288D1" }}
                        >
                          {txn.amount}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          {txn.dueDate}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          <MuiTooltip title="Mark as Paid">
                            <IconButton color="success">
                              <CheckCircle />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Edit">
                            <IconButton color="primary">
                              <Edit />
                            </IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Delete">
                            <IconButton color="error">
                              <Delete />
                            </IconButton>
                          </MuiTooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default ManageUserTest;
