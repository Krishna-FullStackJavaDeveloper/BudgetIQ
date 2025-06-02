// ExpensePage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { CreditCard, Source } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import * as MuiIcons from "@mui/icons-material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip as PieTooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllCategories } from "../../api/category";
import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpenseHistory,
  getMonthlyExpenses,
  updateExpense,
} from "../../api/expense";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
interface Expense {
  id: number;
  amount: number;
  date: string;
  category: string;
}

const ExpensePage = () => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [category, setCategory] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState<Expense[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());
  const [itemToDelete, setItemToDelete] = useState<{ id: number } | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // For total pages from API
  const [chartData, setChartData] = useState<Expense[]>([]);
  // Handle submit and add new data entry
  const handleSubmit = async () => {
    if (!category || !amount || !date) {
      setOpenSnackbar(true);
      return;
    }

    const categoryDetails = categoryList.find((cat) => cat.name === category);

    if (!categoryDetails) {
      console.error("Category not found");
      return;
    }

    setIsLoading(true);

    try {
      const newExpense = {
        category,
        amount: parseFloat(amount),
        date: date.toISOString(),
      };

      const saved = await createExpense(newExpense);

      setData((prev) => [...prev, saved.data]);
      setOpenModal(true);
      handleClear();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: { id: number }) => {
    setItemToDelete(item);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteExpense(itemToDelete.id);
      setData((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      await handleExpenseAction();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setOpenDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = async (item: { id: number }) => {
    try {
      const data = await getExpenseHistory(item.id);
      setEditingId(item.id);

      // Set values only if category list is already loaded
      if (categoryList.length > 0) {
        setAmount(data.data.amount?.toString() || "");
        setDate(dayjs(data.data.date));

        const exists = categoryList.find(
          (cat) => cat.name === data.data.category
        );
        if (exists) {
          setCategory(data.data.category);
        } else {
          setCategory(""); // fallback
        }
      } else {
        // Retry once category list is fetched
        const waitForList = setInterval(() => {
          if (categoryList.length > 0) {
            clearInterval(waitForList);
            setAmount(data.amount?.toString() || "");
            setDate(dayjs(data.date));
            setCategory(data.category);
          }
        }, 200);
      }
    } catch (error) {
      console.error("Edit failed", error);
    }
  };
  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      await updateExpense(editingId, {
        category,
        amount: Number(amount),
        date: date ? date.toISOString() : "",
      });
      setOpenModal(true);
      // You may want to refresh your expenses list here if applicable
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // Function to get category details (color and icon) for each source
  const getCategoryDetails = (source: string) => {
    const category = categoryList.find((cat) => cat.name === source);
    return category
      ? { color: category.color, icon: category.iconName }
      : { color: "#000", icon: "" }; // fallback
  };

  const capitalizeIconName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  };

  const getMuiIcon = (iconName: string): React.ElementType | null => {
    const capitalized = capitalizeIconName(iconName);
    return (MuiIcons as Record<string, React.ElementType>)[capitalized] || null;
  };

  const handleClear = () => {
    setCategory("");
    setAmount("");
    setDate(null);
    setEditingId(null);
  };

  const filteredData = chartData.filter((item) => {
    const itemDate = dayjs(item.date);
    return (
      selectedMonth &&
      itemDate.month() === selectedMonth.month() &&
      itemDate.year() === selectedMonth.year()
    );
  });

  // 1. Current & Previous Month Keys
  const currentMonthKey = selectedMonth.format("YYYY-MM");
  const previousMonthKey = selectedMonth.subtract(1, "month").format("YYYY-MM");

  // 2. Group by YYYY-MM
  const groupByMonth = (expenses: Expense[]): Record<string, Expense[]> => {
    return expenses.reduce((acc, expense) => {
      const key = dayjs.utc(expense.date).format("YYYY-MM");
      if (!acc[key]) acc[key] = [];
      acc[key].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  };

  // 3. Group chartData
  const grouped = groupByMonth(chartData);

  // 4. Sum function
  const sum = (arr: Expense[]): number =>
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

  // Table functions
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

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

  // Prepare the data for the pie chart from the updated `data` state
  const chartLabels = categoryList.map((item) => item.name);

  // Use `data` state to calculate the amounts for each category dynamically
  const chartValues = categoryList.map((item) =>
    filteredData
      .filter((data) => data.category === item.name)
      .reduce((acc, curr) => acc + curr.amount, 0)
  );
  // console.log("chart data:", chartData);

  const backgroundColors = categoryList.map((item) => item.color);
  const borderColors = categoryList.map((item) => item.color);

  const fetchExpenses = async () => {
    try {
      const month = selectedMonth.month() + 1; // month is 0-indexed in Dayjs
      const year = selectedMonth.year();

      const res = await getAllExpenses(
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
      console.error("Error fetching expenses:", error);
      setData([]);
    }
  };

  const isFetchingRef = useRef(false);

  const fetchMonthlyExpenses = async () => {
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
        getMonthlyExpenses(month, year),
        getMonthlyExpenses(prevMonth, prevYear),
      ]);

      const combinedData = [
        ...(currentRes.data || []),
        ...(prevRes.data || []),
      ];

      setChartData(combinedData);
    } catch (error) {
      console.error("Error fetching monthly expenses:", error);
      setChartData([]);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const fetchCategories = async () => {
    try {
      if (!hasFetched.current) {
        hasFetched.current = true;
        const data = await getAllCategories(0, 100, "name");
        if (data.data && Array.isArray(data.data.content)) {
          setCategoryList(data.data.content);
        } else {
          setCategoryList([]);
        }
      }
    } catch (error) {
      console.error("Failed to load categories", error);
      setCategoryList([]);
    }
  };

  // 1. Combine both into a single reusable function
  const handleExpenseAction = async () => {
    await fetchExpenses(); // paginated data for table
    await fetchMonthlyExpenses(); // full data for chart
  };

  useEffect(() => {
    fetchCategories();
    handleExpenseAction();
  }, [page, rowsPerPage, orderBy, order, selectedMonth]);

  useEffect(() => {
    setTotalAmount(filteredData.reduce((sum, item) => sum + item.amount, 0));
  }, []);

  return (
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
                  Expense Tracker
                </Typography>
              </Grid>

              {/* Selected Month Display */}
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Showing expenses for:
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
            // background: "linear-gradient(135deg, #fefcea,rgb(204, 193, 107))",
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
                {editingId ? "Edit Expense" : "Add Expense"}
              </Box>
            </Typography>

            <FormControl
              fullWidth
              variant="outlined"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              sx={{
                mt: 2,
                mb: 2,
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  boxShadow: 2,
                },
              }}
            >
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
                required
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    boxShadow: 2,
                  },
                }}
                renderValue={(selected) => {
                  const selectedCategory = categoryList.find(
                    (cat) => cat.name === selected
                  );
                  if (selectedCategory) {
                    const IconComponent =
                      MuiIcons[
                        selectedCategory.iconName as keyof typeof MuiIcons
                      ] || MuiIcons.Brush;
                    return (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconComponent
                          sx={{
                            marginRight: 2,
                            color: selectedCategory.color,
                          }}
                        />
                        <Typography sx={{ color: selectedCategory.color }}>
                          {selectedCategory.name}
                        </Typography>
                      </div>
                    );
                  }
                  return null; // Return nothing if no category is selected
                }}
              >
                {categoryList.length === 0 ? (
                  <MenuItem disabled>No categories available</MenuItem>
                ) : (
                  categoryList.map((cat) => {
                    const IconComponent =
                      MuiIcons[cat.iconName as keyof typeof MuiIcons] ||
                      MuiIcons.Brush;

                    return (
                      <MenuItem key={cat.id} value={cat.name}>
                        {/* Apply color to the icon and text */}
                        <IconComponent
                          sx={{ marginRight: 2, color: cat.color }}
                        />
                        <Typography sx={{ color: cat.color }}>
                          {cat.name}
                        </Typography>
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
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
                    color="error"
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
            background:
              "linear-gradient(135deg,rgb(204, 145, 145),rgb(219, 111, 111))",
            // background: "linear-gradient(rgb(219, 111, 111))",
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
            Expense Tracker
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
            {/* ${totalAmount.toLocaleString()} */}
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
                sx={{ color: "#D32F2F" }}
              >
                ${filteredData.reduce((sum, item) => sum + item.amount, 0)}
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
                backgroundColor: isPositive ? "#ffebee" : "#e8f5e9",
                color: isPositive ? "#d32f2f" : "#2e7d32",
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

                  const { amount, category } = payload[0].payload;

                  const formattedLabel = new Date(label).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                    }
                  );

                  // Find the color from categoryList based on the category
                  const categoryColor =
                    categoryList.find(
                      (item) =>
                        item.name.toLowerCase() === category.toLowerCase()
                    )?.color || "#90CAF9"; // fallback color if not found

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
                        <span style={{ fontWeight: "bold", color: "#EF5350" }}>
                          ${amount}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Category:</span>
                        <span
                          style={{ fontWeight: "bold", color: categoryColor }}
                        >
                          {category}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#EF5350"
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
              Expense Details
            </Typography>

            <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
              <Table size="small" aria-label="expense table">
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
                      sortDirection={orderBy === "category" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "category"}
                        direction={orderBy === "category" ? order : "asc"}
                        onClick={() => handleRequestSort("category")}
                      >
                        <strong>Category</strong>
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
                  {data.map((item, index) => {
                    const { color, icon } = getCategoryDetails(item.category); // Get category color and icon based on source
                    const IconComponent = getMuiIcon(icon); // Get the MUI icon component
                    return (
                      <TableRow key={index}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>
                          {dayjs(item.date).format("YYYY-MM-DD")}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              backgroundColor: color, // Background color of the category
                              borderRadius: "12px",
                              padding: "4px 12px",
                              color: "#fff",
                              fontWeight: "600",
                              boxShadow: 1,
                            }}
                          >
                            {IconComponent && (
                              <IconComponent sx={{ marginRight: 1 }} />
                            )}
                            {item.category}
                          </Box>
                        </TableCell>
                        <TableCell>{item.amount.toFixed(2)}</TableCell>
                        {/* Actions Column */}
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(item)} // Add logic to handle edit
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(item)} // Add logic to handle delete
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
          {editingId === null ? "Expense Added" : "Expense Updated"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {editingId === null
              ? "Expense has been successfully recorded."
              : "Expense has been successfully updated."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              setOpenModal(false);
              // await fetchExpenses();
              // await fetchMonthlyExpenses();
              await handleExpenseAction();
              handleClear(); // Safe to clear here
            }}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Expense</DialogTitle>
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
            backgroundColor: "rgba(255,255,255,0.5)",
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
  );
};

export default ExpensePage;
