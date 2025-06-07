import React, { JSX, useEffect, useRef, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Stack,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip as MuiTooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import {
  Edit,
  Delete,
  CheckCircle,
  Add,
  Home,
  Subscriptions,
  MonetizationOn,
  TrendingDown,
  TrendingUp,
  CurrencyExchange,
  Close,
  ShoppingCart,
  School,
  LocalGroceryStore,
  Brush,
  Fastfood,
  Language,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loader from "../../components/common/Loader";
import { getAllCategories } from "../../api/category";
import * as MuiIcons from "@mui/icons-material";
import { createExpense, getAllExpenses } from "../../api/expense";
import { fetchUserSummary } from "../../api/dashboard";
import { getCurrencySymbol } from "../../hooks/currencyUtils";
import { Expense } from "../../components/Interface/Expense";
import { SummaryResponse } from "../../components/Interface/SummaryResponse";

const recurringTransactions = [
  {
    category: "Rent",
    description: "Monthly House Rent",
    amount: "1200",
    dueDate: "April 5, 2025",
    icon: <Home sx={{ color: "#3B48E0" }} />,
  },
  {
    category: "Subscription",
    description: "Netflix Premium",
    amount: "15",
    dueDate: "April 10, 2025",
    icon: <Subscriptions sx={{ color: "#D32F2F" }} />,
  },
  // import LanguageIcon from '@mui/icons-material/Language';
  {
    category: "Bill",
    description: "Internet Bill",
    amount: "45",
    dueDate: "April 28, 2025",
    icon: <Language sx={{ color: "#1565C0" }} />,
  },
];

const UserDashboard = () => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null); // Set state to Dayjs or null

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const [expenseData, setExpenseData] = useState<Expense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());

  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  // Use currency this utility(hooks) in your components
  const currencySymbol =
  getCurrencySymbol(summary?.currencyCode || summary?.currencyName || "");
  const timezoneLabel = summary?.timezone?.replace("_", " ") || "N/A";
  const currencyLabel = `${summary?.currencyCode || ""}`;

  const SummaryComponent = () => {
    const getSummary = async () => {
      try {
        const res = await fetchUserSummary();
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    };
    getSummary();
  };

  const handleAddExpense = async () => {
    if (!amount || !category || !date) {
      alert("Please fill out all fields");
      return;
    }
    // Proceed with adding the expense
    try {
      const newExpense = {
        category,
        amount: parseFloat(amount),
        date: date.toISOString(),
      };
      const saved = await createExpense(newExpense);
      setExpenseData((prev) => [...prev, saved.data]);
      setOpenModal(true);
      fetchExpenses();
      SummaryComponent();
      handleClear();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setOpenModal(false);
      setOpen(false); // Close the dialog
    }
  };

  const handleClear = () => {
    setCategory("");
    setAmount("");
    setDate(null);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

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
  //  Function to get category details (color and icon) for each source
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

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  }); // Example: "Jun 2025"
  const formattedMonth = currentMonth.replace(" ", "-"); // "Jun-2025"

  const currentMonthData = summary?.monthlyData?.find(
    (entry) => entry.month === formattedMonth
  );

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

  const fetchExpenses = async () => {
    try {
      const month = selectedMonth.month() + 1; // month is 0-indexed in Dayjs
      const year = selectedMonth.year();

      const res = await getAllExpenses(
        0, // page = 0
        4, // size = 4
        "date,desc", // sort = date,asc
        month, // month = 6
        year
      );

      if (res.data && Array.isArray(res?.data?.content)) {
        setExpenseData(res.data.content);
        // setTotalCount(res.data.page.totalElements || 0);
      } else {
        setExpenseData([]);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenseData([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    SummaryComponent();
    const timer = setTimeout(() => {
      setLoading(false); // After 1.5 seconds, stop showing the loader
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return <Loader />;
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Avatar */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>K</Avatar>
        <Typography variant="h5" fontWeight={600}>
          Welcome Back, {summary?.name}!
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {dayjs().format("MMMM DD, YYYY")}
        </Typography>
      </Stack>

      {/* Alerts */}
      <Grid container spacing={3}>
        {/* Income and Expense Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MonetizationOn />}
            // (${formattedMonth})
            title={`Total Income `} 
            value={`${currencySymbol}  ${currentMonthData?.income?.toLocaleString() || 0}`}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingDown />}
            title={`Total Expense`}
            value={`${currencySymbol} ${currentMonthData?.expense?.toLocaleString() || 0}`}
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Savings"
            value={`${currencySymbol} ${currentMonthData?.saving?.toLocaleString() || 0}`}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CurrencyExchange />}
            title="Currency"
            value={`${currencyLabel} | ${currencySymbol}`}
            color="warning.main"
          />
        </Grid>

        {/* Expenses Chart */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Monthly Income & Expenses
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={summary?.monthlyData || []}
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartTooltip
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      const { income, expense, saving } = payload[0].payload;
                      const formattedIncome = new Intl.NumberFormat().format(
                        income
                      );
                      const formattedExpense = new Intl.NumberFormat().format(
                        expense
                      );
                      const formattedSaving = new Intl.NumberFormat().format(
                        saving
                      );
                      return (
                        <div
                          style={{
                            padding: "10px",
                            background: "#333",
                            color: "#fff",
                            borderRadius: "8px",
                            width: "200px",
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
                            <span>Income:</span>
                            <span style={{ color: "#82CA9D" }}>
                              {currencySymbol} {formattedIncome}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Expense:</span>
                            <span style={{ color: "#FB7E41" }}>
                              {currencySymbol} {formattedExpense}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Saving:</span>
                            <span style={{ color: "#8884D8" }}>
                              {currencySymbol} {formattedSaving}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="income"
                    fill="#82CA9D"
                    radius={[10, 10, 0, 0]}
                    name="Income"
                  >
                    <LabelList
                      dataKey="income"
                      position="top"
                      fill="#82CA9D"
                      fontSize={12}
                    />
                  </Bar>
                  <Bar
                    dataKey="expense"
                    fill="#FB7E41"
                    radius={[10, 10, 0, 0]}
                    name="Expense"
                  >
                    <LabelList
                      dataKey="expense"
                      position="top"
                      fill="#FB7E41"
                      fontSize={12}
                    />
                  </Bar>
                  <Bar
                    dataKey="saving"
                    fill="#8884D8"
                    radius={[10, 10, 0, 0]}
                    name="Saving"
                  >
                    <LabelList
                      dataKey="saving"
                      position="top"
                      fill="#8884D8"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Transactions List */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              boxShadow: 4,
              borderRadius: 3,
              position: "relative",
              height: 380,
              mb: 4,
            }}
          >
            <CardContent sx={{ pb: 9 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Transactions
              </Typography>

              {expenseData.map((tx) => {
                const { color, icon } = getCategoryDetails(tx.category);
                const IconComponent = getMuiIcon(icon); // Assumes a mapping utility for icons

                return (
                  <Box
                    key={tx.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.7,
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.7)",
                      backdropFilter: "blur(8px)",
                      borderLeft: `8px solid ${color}`,
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {IconComponent && (
                        <IconComponent sx={{ color, fontSize: 22 }} />
                      )}
                      <Typography variant="body1" fontWeight="bold">
                        {tx.category}
                      </Typography>
                      {/* <Typography variant="caption" color="text.secondary">
                        {dayjs(tx.date).format("MMM DD, YYYY")}
                      </Typography> */}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      // color="#3498DB"
                      color="#263238"
                    >
                      {currencySymbol} {tx.amount.toFixed(2)}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>

            {/* Floating Add Button */}
            <Fab
              color="primary"
              sx={{ position: "absolute", bottom: 20, right: 20, zIndex: 0 }}
              onClick={handleOpen}
              aria-label="Add Expense"
            >
              <Add />
            </Fab>

            {/* Popup Dialog */}

            <Dialog
              open={open}
              onClose={handleClose}
              TransitionComponent={Slide}
              fullWidth
              PaperProps={{
                sx: { borderRadius: 5 }, // Adjust the value as needed
              }}
            >
              <DialogTitle
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.25rem",
                  position: "relative",
                }}
              >
                Add Expenditure
                {/* Close Icon Button in the top-right corner */}
                <IconButton
                  sx={{ position: "absolute", right: 8, top: 8 }}
                  onClick={handleClose} // Close the dialog when clicked
                >
                  <Close />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ overflow: "auto", padding: 3 }}>
                {/* Form Container */}
                <Box
                  component="form"
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
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
                          <InputAdornment position="start">{currencySymbol}</InputAdornment>
                        ) : null,
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    sx={{
                      mt: 2,
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        boxShadow: 2,
                      },
                    }}
                  />
                  {/* Category Dropdown */}
                  <FormControl fullWidth>
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
                  {/* Date Picker */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Select Date"
                      value={date}
                      onChange={(newDate) => setDate(newDate)}
                    />
                  </LocalizationProvider>
                </Box>
              </DialogContent>

              <DialogActions sx={{ mb: 1, paddingRight: 3 }}>
                {/* Add Button */}
                <Button
                  onClick={() => {
                    console.log(`Amount: ${amount}, Category: ${category}`);
                    setAmount(""); // Reset the Amount field
                    setCategory(""); // Reset the Category field
                    setDate(null); // Reset the Date field

                    handleAddExpense(); // Call your existing add expense function here
                  }}
                  color="primary"
                  sx={{ borderRadius: "8px", padding: "6px 16px" }}
                >
                  Add
                </Button>

                {/* Cancel Button */}
                <Button
                  onClick={() => {
                    setAmount(""); // Reset the Amount field
                    setCategory(""); // Reset the Category field
                    setDate(null); // Reset the Date field
                  }}
                  color="secondary"
                  sx={{ borderRadius: "8px", padding: "6px 16px" }}
                >
                  Reset
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Grid>
        {/* Recurring tansaction start */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              // p: 2,
              mb: 3,
              // background: "linear-gradient(135deg, #f5f7fa 30%, #c3cfe2 100%)",
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
                    <TableRow sx={{ backgroundColor: "#8E44AD" }}>
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
                    {recurringTransactions.map((txn, index) => (
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
                          {currencySymbol} {txn.amount}
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
    </Box>
  );
};

export default UserDashboard;
