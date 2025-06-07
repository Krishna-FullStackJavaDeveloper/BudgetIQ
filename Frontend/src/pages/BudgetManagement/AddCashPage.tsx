import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  TableContainer,
  Table,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from "@mui/material";
import { XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  AccountBalanceWallet,
  CreditCard,
  Home,
  Subscriptions,
} from "@mui/icons-material";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import {
  Chart as ChartJS,
  Title,
  Tooltip as PieTooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import {
  createIncome,
  deleteIncome,
  getAllIncome,
  getIncomeHistory,
  getMonthlyIncome,
  updateIncome,
} from "../../api/income";
import { alpha } from "@mui/material/styles";

interface Income {
  id: number;
  amount: number;
  date: string;
  source: string;
}

const AddCashPage = () => {
  const [source, setSource] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [amount, setAmount] = useState("");
  const [data, setData] = useState<Income[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: number } | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const [orderBy, setOrderBy] = useState("date");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [chartData, setChartData] = useState<Income[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0); // For total pages from API

  // Handle submit and add new data entry
  const handleSubmit = async () => {
    if (!source || !amount || !date) {
      setOpenSnackbar(true);
      return;
    }
    setIsLoading(true);
    try {
      const newExpense = {
        source,
        amount: parseFloat(amount),
        date: date.toISOString(),
      };

      const saved = await createIncome(newExpense);

      setData((prev) => [...prev, saved.data]);
      setOpenModal(true);
      handleClear();
    } catch (error) {
      console.error("Error adding Income:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //Actions
  const handleClear = () => {
    setSource("");
    setAmount("");
    setDate(null);
    setEditingId(null);
  };
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleDelete = async (item: { id: number }) => {
    setItemToDelete(item);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteIncome(itemToDelete.id);
      setData((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      //  await fetchExpenses();
      // await fetchMonthlyExpenses();
      await handleIncomeAction();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setOpenDeleteModal(false);
      setItemToDelete(null);
    }
  };

  //get by Id
  const handleEdit = async (item: { id: number }) => {
    try {
      const data = await getIncomeHistory(item.id);
      setEditingId(item.id);

      // Directly set values since source is just a string
      setAmount(data.data.amount?.toString() || "");
      setDate(dayjs(data.data.date));
      setSource(data.data.source || "");
    } catch (error) {
      console.error("Edit income failed", error);
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      await updateIncome(editingId, {
        source,
        amount: Number(amount),
        date: date ? date.toISOString() : "",
      });
      setOpenModal(true);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const filteredData = chartData.filter((item) => {
    const itemDate = dayjs(item.date);
    return (
      selectedMonth &&
      itemDate.month() === selectedMonth.month() &&
      itemDate.year() === selectedMonth.year()
    );
  });

  // Table functions
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Chart hooks
  // 1. Current & Previous Month Keys
  const currentMonthKey = selectedMonth.format("YYYY-MM");
  const previousMonthKey = selectedMonth.subtract(1, "month").format("YYYY-MM");

  // 2. Group by YYYY-MM
  const groupByMonth = (incomes: Income[]): Record<string, Income[]> => {
    return incomes.reduce((acc, income) => {
      const key = dayjs.utc(income.date).format("YYYY-MM");
      if (!acc[key]) acc[key] = [];
      acc[key].push(income);
      return acc;
    }, {} as Record<string, Income[]>);
  };

  // 3. Group chartData
  const grouped = groupByMonth(chartData);

  // 4. Sum function
  const sum = (arr: Income[]): number =>
    arr.reduce((acc, item) => acc + item.amount, 0);

  // 5. Get current and previous data
  const currentMonthData = grouped[currentMonthKey] || [];
  const previousMonthData = grouped[previousMonthKey] || [];

  const currentSum = sum(currentMonthData);
  const previousSum = sum(previousMonthData);

  // 6. Calculate percentage change
  let formattedPercent = "N/A";
  let isPositive = true;

  if (!(previousMonthKey in grouped)) {
    formattedPercent = "N/A";
  } else if (previousSum === 0 && currentSum > 0) {
    formattedPercent = "▲ 100%";
  } else if (previousSum === 0 && currentSum === 0) {
    formattedPercent = "N/A";
  } else {
    const rawChange = ((currentSum - previousSum) / previousSum) * 100;
    const cappedChange = Math.min(Math.abs(rawChange), 100);
    isPositive = rawChange >= 0;
    formattedPercent = `${isPositive ? "▲" : "▼"} ${cappedChange.toFixed(1)}%`;
  }

  //Pie chart hooks
  // Register the necessary chart.js components
  ChartJS.register(
    Title,
    PieTooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale
  );

  const sourceColors: Record<string, string> = {
    Salary: "#1ABC9C", // green
    Freelance: "#3498DB", // blue
    Investment: "#E67E22", // orange
    Gift: "#9B59B6", // purple
    Other: "#95A5A6", // grey
  };

  const getSourceGroup = (source: string): string => {
    const normalized = source.toLowerCase();
    const matched = Object.keys(sourceColors).find((key) =>
      normalized.includes(key.toLowerCase())
    );
    return matched || "Other";
  };

  // 1. Get unique sources from filteredData
  const groupedSourceMap = new Map<string, number>();

  filteredData.forEach((item) => {
    const group = getSourceGroup(item.source); // e.g., "Gift"
    if (!groupedSourceMap.has(group)) {
      groupedSourceMap.set(group, 0);
    }
    groupedSourceMap.set(group, groupedSourceMap.get(group)! + item.amount);
  });

  // 2. Extract chart labels and values from the sourceMap
  const chartLabels = Array.from(groupedSourceMap.keys()); // e.g., ["Gift", "Salary"]
  const chartValues = Array.from(groupedSourceMap.values());

  // 3. Get consistent colors from the sourceColors map
  const backgroundColors = chartLabels.map((label) => sourceColors[label]);
  const borderColors = backgroundColors;

  const fetchIncomes = async () => {
    try {
      const month = selectedMonth.month() + 1; // month is 0-indexed in Dayjs
      const year = selectedMonth.year();

      const res = await getAllIncome(
        page,
        rowsPerPage,
        `${orderBy},${order}`,
        month,
        year
      );

      if (res.data && Array.isArray(res?.data?.content)) {
        setData(res.data.content);
        setTotalCount(res.data.page.totalElements || 0);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching incomes:", error);
      setData([]);
    }
  };

  const isFetchingRef = useRef(false);

  const fetchMonthlyIncome = async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    try {
      const month = selectedMonth.month() + 1;
      const year = selectedMonth.year();

      const prevMonthObj = selectedMonth.subtract(1, "month");
      const prevMonth = prevMonthObj.month() + 1;
      const prevYear = prevMonthObj.year();

      const [currentRes, prevRes] = await Promise.all([
        getMonthlyIncome(month, year),
        getMonthlyIncome(prevMonth, prevYear),
      ]);

      const combinedData = [
        ...(currentRes.data || []),
        ...(prevRes.data || []),
      ];

      setChartData(combinedData);
    } catch (error) {
      console.error("Error fetching monthly incomes:", error);
      setChartData([]);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const handleIncomeAction = async () => {
    await fetchIncomes(); // paginated data for table
    await fetchMonthlyIncome(); // full data for chart
  };

  useEffect(() => {
    handleIncomeAction();
  }, [page, rowsPerPage, orderBy, order, selectedMonth]);

  useEffect(() => {
    setTotalAmount(filteredData.reduce((sum, item) => sum + item.amount, 0));
  }, []);

  return (
    <>
      <Grid container spacing={1} p={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f0f4f8, #ffffff)",
              mb: 4,
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {/* Title */}
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" fontWeight="bold">
                    Income Tracker
                  </Typography>
                </Grid>

                {/* Selected Month Display */}
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Showing income for:
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      {selectedMonth?.format("MMMM YYYY")}
                    </Typography>
                  </Box>
                </Grid>

                {/* Date Picker */}
                <Grid item xs={12} sm={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      views={["month", "year"]} // Allow both month and year views
                      label="Select Month"
                      value={selectedMonth}
                      onChange={(newValue) =>
                        setSelectedMonth(newValue ?? dayjs())
                      } // Update selected month
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                          boxShadow: 1,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              height: 420,
              background: "linear-gradient(135deg, #f0f4f8, #ffffff)",
            }}
          >
            <CardContent sx={{ pb: 9 }}>
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
                  {editingId ? "Edit Income" : "Add Income"}
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
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: 2,
                  },
                }}
              />

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

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
              >
                {editingId ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdate}
                      fullWidth
                      sx={{ mr: 1 }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClear}
                      fullWidth
                    >
                      Clear
                    </Button>
                  </>
                ) : (
                  <>
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
                      color="secondary"
                      onClick={handleClear}
                      fullWidth
                    >
                      Clear
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{
              ml: 1,
              boxShadow: 4,
              borderRadius: 3,
              height: 180,
              marginBottom: 2.5,
              background: "linear-gradient(135deg, #16A085, #1ABC9C)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: 2,
            }}
          >
            <CreditCard sx={{ fontSize: 50, mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>
              Income Tracker
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
              $
              {filteredData
                .reduce((sum, item) => sum + item.amount, 0)
                .toFixed(2)}
            </Typography>
          </Card>

          {/* chart */}

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
                  ${filteredData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
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
                  //
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
              <LineChart width={500} height={90} data={filteredData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;

                    const { amount, source } = payload[0].payload;

                    const formattedLabel = new Date(label).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                      }
                    );

                    // Get the source group and color (use your existing functions & color map)
                    const sourceGroup = getSourceGroup(source);
                    const sourceColor = sourceColors[sourceGroup] || "#90CAF9"; // fallback color

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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Source:</span>
                          <span
                            style={{ fontWeight: "bold", color: sourceColor }}
                          >
                            {source}
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

        {/* Pie Chart Grid Item */}
        <Grid item xs={12} sm={8} md={4}>
          <Card sx={{ borderRadius: 4, boxShadow: 4, mt: 2, mb: 4 }}>
            <CardContent>
              <Box width="100%" display="flex" justifyContent="center">
                <div style={{ width: "250px", height: "403px" }}>
                  <Pie
                    style={{ marginTop: 1 }}
                    data={{
                      labels: chartLabels,
                      datasets: [
                        {
                          data: chartValues,
                          backgroundColor: backgroundColors,
                          borderColor: borderColors,
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
            </CardContent>
          </Card>
        </Grid>

        {/* Table Card Grid Item */}
        <Grid item xs={12} sm={8} md={8}>
          <Card
            sx={{
              mt: 2,
              borderRadius: 4,
              boxShadow: 4,
              background: "#ffffff",
              overflow: "auto",
              mb: 4,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Income Details
              </Typography>

              <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                <Table size="small" aria-label="income table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell>
                        <strong>Sr.</strong>
                      </TableCell>
                      <TableCell
                        sortDirection={orderBy === "date" ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === "date"}
                          direction={orderBy === "date" ? order : "asc"}
                          onClick={() => handleRequestSort("date")}
                        >
                          <strong>Date</strong>
                        </TableSortLabel>
                      </TableCell>

                      <TableCell
                        sortDirection={orderBy === "source" ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === "source"}
                          direction={orderBy === "source" ? order : "asc"}
                          onClick={() => handleRequestSort("source")}
                        >
                          <strong>Source</strong>
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={orderBy === "amount" ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === "amount"}
                          direction={orderBy === "amount" ? order : "asc"}
                          onClick={() => handleRequestSort("amount")}
                        >
                          <strong>Amount ($)</strong>
                        </TableSortLabel>
                      </TableCell>
                      {/* New Actions Column */}
                      <TableCell align="center">
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {dayjs(item.date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell>
                          <Box
                            title={item.source} // 👈 Tooltip shows full text on hover
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 1,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: "20px",
                              backgroundColor: alpha(
                                sourceColors[getSourceGroup(item.source)],
                                0.15
                              ),
                              color: sourceColors[getSourceGroup(item.source)],
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              textTransform: "capitalize",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "default",
                            }}
                          >
                            {/* Color Dot */}
                            <Box
                              sx={{
                                flexShrink: 0,
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor:
                                  sourceColors[getSourceGroup(item.source)],
                              }}
                            />
                            {item.source}
                          </Box>
                        </TableCell>
                        <TableCell>{item.amount.toFixed(2)}</TableCell>
                        {/* Actions Column */}
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(item)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(item)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5]}
                />
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          message="All fields are required"
        />

        <Dialog
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            handleClear(); // Clear only after user sees the dialog
          }}
        >
          <DialogTitle>
            {editingId === null ? "Income Added" : "Income Updated"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {editingId === null
                ? "Income has been successfully recorded."
                : "Income has been successfully updated."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                setOpenModal(false);
                await handleIncomeAction();
                handleClear(); // Safe to clear here
              }}
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
        >
          <DialogTitle>Delete Income</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this item?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={confirmDelete} color="error">
              OK
            </Button>
            <Button
              onClick={() => {
                setOpenDeleteModal(false);
                setItemToDelete(null);
              }}
              color="primary"
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        {isLoading && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1300,
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Grid>
    </>
  );
};

export default AddCashPage;
