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
  ResponsiveContainer,
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
  PersonAdd,
  Send,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loader from "../../components/common/Loader";
import { Expense } from "../../components/Interface/Expense";
import { SummaryResponse } from "../../components/Interface/SummaryResponse";
import { createExpense, getAllExpenses } from "../../api/expense";
import { fetchUserSummary } from "../../api/dashboard";
import { getCurrencySymbol } from "../../hooks/currencyUtils";
import { getAllCategories } from "../../api/category";
import * as MuiIcons from "@mui/icons-material";
import { getMyFamily } from "../../api/family";
import { LinearProgress } from "@mui/joy";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const userID = localStorage.getItem("user") || "";
const userRoles = JSON.parse(localStorage.getItem("roles") || "[]");

const recurringTransactions = [
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

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFocused, setIsFocused] = useState(false);
  const handleEditFamily = () => navigate(`/my-family`);
  const handleAddMember = () => navigate(`/manage-users`);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const [expenseData, setExpenseData] = useState<Expense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [familyData, setFamilyData] = useState<any | null>(null);
  const fetchedOnce = useRef(false);

  // Use currency this utility(hooks) in your components
  const currencySymbol = getCurrencySymbol(
    summary?.currencyCode || summary?.currencyName || ""
  );
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
  const fetchFamily = async () => {
    try {
      let data;
      const response = await getMyFamily();
      data = response.data;
      setFamilyData(data);
    } catch (error) {
      console.error("Failed to fetch family data", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
    SummaryComponent();
    if (!fetchedOnce.current) {
      fetchFamily();
      fetchedOnce.current = true;
    }

    const timer = setTimeout(() => {
      setLoading(false); // After 1.5 seconds, stop showing the loader
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  if (loading) {
    return <Loader />;
  }

  const isDataMeaningful =
    summary?.monthlyData &&
    summary.monthlyData.length > 0 &&
    summary.monthlyData.some(
      (item) => item.income > 0 || item.expense > 0 || item.saving > 0
    );

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

  const maxSize = 6;
  const userSize = familyData?.userSize;
  const progressValue = (userSize / maxSize) * 100;

  // To avoid 0% progress (invisible bar), set minimum visible value (e.g., 5%)
  const visibleProgress = progressValue > 0 ? progressValue : 6;

  return (
    <>
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
      <Grid container spacing={3}>
        {/* Moderator Card */}

        {/* Left: Family Details */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: 4,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <GroupIcon color="primary" /> Family Details
              </Typography>

              {userRoles.includes("ROLE_MODERATOR") && (
                <Typography variant="body2" color="success.main">
                  You are the Admin of this Family
                </Typography>
              )}

              <Typography variant="body2" sx={{ mt: 2 }}>
                Family Name: <strong>{familyData?.familyName}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Total Members: <strong>{familyData?.userSize}</strong>
              </Typography>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Family Growth
              </Typography>
              <LinearProgress
                determinate
                value={visibleProgress}
                style={{
                  height: 8,
                  borderRadius: 3,
                  backgroundColor: "#ddd",
                }}
                color={
                  visibleProgress === 0
                    ? "neutral" // Color is neutral if the strength is 0
                    : visibleProgress < 50
                    ? "success" // Color is danger if below 50
                    : visibleProgress < 75
                    ? "warning" // Color is warning if between 50 and 75
                    : "danger" // Color is success if above 75
                }
                size="md"
                variant="soft"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {familyData?.userSize} of 6 members
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                gap: 2,
                flexWrap: "nowrap",
                overflowX: "auto",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit fontSize="small" />}
                onClick={handleEditFamily}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  boxShadow: "0 4px 10px rgb(25 118 210 / 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 14px rgb(25 118 210 / 0.5)",
                  },
                  px: 3,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  // gap: 1,

                  // Fix icon vertical alignment here:
                  "& .MuiButton-startIcon": {
                    display: "flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                    marginTop: 0,
                  },
                  "& .MuiSvgIcon-root": {
                    verticalAlign: "middle",
                  },
                }}
              >
                Edit Family
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ManageAccountsIcon fontSize="small" />}
                onClick={handleAddMember}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  px: 3,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderWidth: 2,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  // gap: 0.3,
                  "&:hover": {
                    borderWidth: 2,
                    backgroundColor: "rgba(220, 0, 78, 0.08)",
                  },

                  "& .MuiButton-startIcon": {
                    display: "flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                    marginTop: 0,
                  },
                  "& .MuiSvgIcon-root": {
                    verticalAlign: "middle",
                  },
                }}
              >
                Manage Member
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{ mt: 3, fontStyle: "italic", color: "text.secondary" }}
            >
              "Family is not an important thing, it's everything."
            </Typography>
          </Card>
        </Grid>

        {/* Right: Individual Stat Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {[
              {
                icon: <MonetizationOn />,
                title: "Total Income",
                value: `${currencySymbol} ${
                  currentMonthData?.income?.toLocaleString() || 0
                }`,
                color: "success.main",
              },
              {
                icon: <TrendingDown />,
                title: "Total Expense",
                value: `${currencySymbol} ${
                  currentMonthData?.expense?.toLocaleString() || 0
                }`,
                color: "error.main",
              },
              {
                icon: <TrendingUp />,
                title: "Total Savings",
                value: `${currencySymbol} ${
                  currentMonthData?.saving?.toLocaleString() || 0
                }`,
                color: "primary.main",
              },
              {
                icon: <CurrencyExchange />,
                title: "Currency",
                value: `${currencyLabel} | ${currencySymbol}`,
                color: "warning.main",
              },
            ].map(({ icon, title, value, color }) => (
              <Grid item xs={12} sm={6} key={title}>
                <StatCard
                  icon={icon}
                  title={title}
                  value={value}
                  color={color}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
        {/* Expenses Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Monthly Income & Expenses
              </Typography>

              {isDataMeaningful ? (
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
                              borderRadius: 3,
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
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: "center",
                    marginTop: 10,
                    color: "text.secondary",
                    fontWeight: "bold",
                  }}
                >
                  No data found
                </Typography>
              )}
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
            }}
          >
            <CardContent sx={{ pb: 9 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Transactions
              </Typography>

              {expenseData.length > 0 ? (
                expenseData.map((tx) => {
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
                        borderRadius: 3,
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
                })
              ) : (
                // No data found block with + sign
                <Box
                  sx={{
                    height: 250,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "text.secondary",
                    fontWeight: "bold",
                    gap: 1,
                  }}
                >
                  <Fab color="primary" size="small" disabled>
                    <Add />
                  </Fab>
                  <Typography variant="body1" fontWeight="bold">
                    No data found
                  </Typography>
                </Box>
              )}
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
                sx: { borderRadius: 3 }, // Adjust the value as needed
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
                          <InputAdornment position="start">
                            {currencySymbol}
                          </InputAdornment>
                        ) : null,
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    sx={{
                      mt: 2,
                      borderRadius: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
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
                        borderRadius: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
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
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
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
                  sx={{ borderRadius: 3, padding: "6px 16px" }}
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
                  sx={{ borderRadius: 3, padding: "6px 16px" }}
                >
                  Reset
                </Button>
              </DialogActions>
            </Dialog>
          </Card>
        </Grid>
        {/* Recurring tansaction start */}
        <Grid item xs={12}>
          {/* <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              p: 2,
              mb: 9,
            }}
          > */}
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

              <TableContainer component={Paper} sx={{ borderRadius: 3 , mb: 4}}>
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
          {/* </Card> */}
        </Grid>
      </Grid>
    </>
  );
};

export default ModeratorDashboard;
