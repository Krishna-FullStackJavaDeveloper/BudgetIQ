// ExpensePage.tsx
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

interface Category {
  id: number;
  name: string;
  iconName: string;
  color: string;
}

const chartData = [
  { date: "2025-04-01", amount: 20, source: "Food" },
  { date: "2025-04-02", amount: 40, source: "Travel" },
  { date: "2025-04-03", amount: 30, source: "Shopping" },
  { date: "2025-04-04", amount: 6.3, source: "Bills" },
  { date: "2025-04-05", amount: 30, source: "Entertainment" },
  { date: "2025-04-06", amount: 20, source: "Health" },
  { date: "2025-04-07", amount: 50, source: "Grocery" },
  { date: "2025-04-08", amount: 20, source: "Stationery" },
  { date: "2025-04-09", amount: 10, source: "Food" },
  { date: "2025-04-10", amount: 70, source: "Grocery" },
  { date: "2025-04-11", amount: 33, source: "Grocery" },
  { date: "2025-04-12", amount: 23.5, source: "Food" },
  { date: "2025-04-13", amount: 26, source: "Gass" },
  { date: "2025-04-14", amount: 5, source: "Food" },
  { date: "2025-04-15", amount: 12, source: "Food" },
];

const ExpensePage = () => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState(chartData);
  const [category, setCategory] = useState("");
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const hasFetched = useRef(false);

  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs | null>(
    dayjs()
  );

  const filteredData = data.filter((item) => {
    const itemDate = dayjs(item.date);
    return (
      selectedMonth &&
      itemDate.month() === selectedMonth.month() &&
      itemDate.year() === selectedMonth.year()
    );
  });

  const handleEdit = (item: { date: string; amount: number; source: string; } | {
      color: string; // Add the category color
      icon: string; date: string; amount: number; source: string;
    }) => {
    // Logic for editing the item (e.g., open a modal or redirect to a form)
    console.log("Edit item:", item);
  };
  
  const handleDelete = (item: { date: string; amount: number; source: string; } | {
      color: string; // Add the category color
      icon: string; date: string; amount: number; source: string;
    }) => {
    // Open confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to delete this item?`);
    
    if (isConfirmed) {
      // Filter out the item from data based on its unique properties (e.g., `item.date` or `item.source`)
      const updatedData = data.filter(
        (dataItem) => dataItem.date !== item.date || dataItem.source !== item.source
      );
      
      // Update the data state with the new filtered data
      setData(updatedData);
  
      // Optionally, you can log the item to confirm deletion
      console.log("Deleted item:", item);
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

  // Handle submit and add new data entry
  const handleSubmit = () => {
    if (!category || !amount || !date) {
      setOpenSnackbar(true);
      return;
    }

    const categoryDetails = categoryList.find((cat) => cat.name === category);

    if (!categoryDetails) {
      console.error("Category not found");
      return;
    }

    const { color, iconName: icon } = categoryDetails;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpenModal(true);

      const newEntry = {
        date: date.format("YYYY-MM-DD"),
        amount: parseFloat(amount),
        source: category,
        color: color,
        icon: icon,
      };

      setData((prev) => [...prev, newEntry]);
      handleClear();
    }, 2000);
  };

  const handleClear = () => {
    setCategory("");
    setAmount("");
    setDate(null);
  };

  // Helper to sum amounts
  const sum = (arr: any[]) => arr.reduce((acc, cur) => acc + cur.amount, 0);

  // Sort chartData by date ascending
  const sortedData = [...filteredData].sort((a, b) =>
    dayjs(a.date).diff(dayjs(b.date))
  );

  // Get up to the last 14 days
  const last14Days = sortedData.slice(-14);

  // Split smartly
  let prev7Days: typeof data = [];
  let last7Days: typeof data = [];
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
  let rawChange = prev7Sum > 0 ? ((last7Sum - prev7Sum) / prev7Sum) * 100 : 0;
  const cappedChange = Math.min(Math.abs(rawChange), 100);
  const isPositive = rawChange >= 0;

  // Final percent string
  const formattedPercent =
    prev7Days.length > 0 && prev7Sum > 0
      ? `${isPositive ? "▲" : "▼"} ${cappedChange.toFixed(1)}%`
      : "N/A";

  // Table functions
  const handleRequestSort = (property: React.SetStateAction<string>) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (
    event: any,
    newPage: React.SetStateAction<number>
  ) => {
    setPage(newPage);
  };

  const sortedTableData = [...filteredData].sort((a, b) => {
    if (orderBy === "amount") {
      return order === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    if (orderBy === "source") {
      return order === "asc"
        ? a.source.localeCompare(b.source)
        : b.source.localeCompare(a.source);
    }
    // Default: sort by date
    return order === "asc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Adding background color and icon based on the source/category
  const enhancedData = sortedTableData.map((item) => {
    const categoryDetails = categoryList.find(
      (cat) => cat.name === item.source
    );
    if (categoryDetails) {
      return {
        ...item,
        color: categoryDetails.color, // Add the category color
        icon: categoryDetails.icon, // Add the category icon
      };
    }
    return item; // If no matching category, return item unchanged
  });

  const paginatedData = enhancedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
      .filter((data) => data.source === item.name)
      .reduce((acc, curr) => acc + curr.amount, 0)
  );

  const backgroundColors = categoryList.map((item) => item.color);
  const borderColors = categoryList.map((item) => item.color);

  useEffect(() => {
     const fetchCategories = async () => {
          try {
            // Ensure fetch happens only once
            if (!hasFetched.current) {
              hasFetched.current = true;
    
              const data = await getAllCategories(0, 100, "name");
              if (data.data && Array.isArray(data.data.content)) {
                setCategoryList(data.data.content); // Set categories state
              } else {
                setCategoryList([]); // Fallback to empty list
              }
            }
          } catch (error) {
            console.error("Failed to load categories", error);
            setCategoryList([]); // Fallback to empty list
          }
        };
        fetchCategories();
        
    setTotalAmount(filteredData.reduce((sum, item) => sum + item.amount, 0));
  }, [filteredData]);

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
                    onChange={(newValue) => setSelectedMonth(newValue)} // Update selected month
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
                Add Expense
              </Box>
            </Typography>

           <FormControl fullWidth variant="outlined"
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
              }}>
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
                                      <div
                                        style={{ display: "flex", alignItems: "center" }}
                                      >
                                        <IconComponent
                                          sx={{
                                            marginRight: 2,
                                            color: selectedCategory.color,
                                          }}
                                        />
                                        <Typography
                                          sx={{ color: selectedCategory.color }}
                                        >
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

                  const { amount, source } = payload[0].payload;

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
                        <span>Source:</span>
                        <span style={{ fontWeight: "bold", color: "#90CAF9" }}>
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
        <Card sx={{ borderRadius: 4, boxShadow: 4, mt: 2 }}>
          <CardContent>
            <Box width="100%" display="flex" justifyContent="center">
              <div style={{ width: "250px", height: "365px" }}>
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
                      sortDirection={orderBy === "source" ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === "source"}
                        direction={orderBy === "source" ? order : "asc"}
                        onClick={() => handleRequestSort("source")}
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
                  {paginatedData.map((item, index) => {
                    const { color, icon } = getCategoryDetails(item.source); // Get category color and icon based on source
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
                            {item.source}
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
                count={data.length}
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Expense Added</DialogTitle>
        <DialogContent>
          <Typography>Expense has been successfully recorded.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} autoFocus>
            OK
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
