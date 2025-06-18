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
  LineChart,
  Tooltip,
  Line,
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
  QueryStats,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs"; // Import Dayjs if using Dayjs
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loader from "../../components/common/Loader";
import { Expense } from "../../components/Interface/Expense";
import { SummaryResponse } from "../../components/Interface/SummaryResponse";
import { getCurrencySymbol } from "../../hooks/currencyUtils";
import { fetchUserSummary } from "../../api/dashboard";
import { createExpense, getAllExpenses } from "../../api/expense";
import { getAllCategories } from "../../api/category";
import * as MuiIcons from "@mui/icons-material";
import AddIcon from "@mui/icons-material/PersonAddAlt1";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const glassCardStyle = {
  p: 3,
  borderRadius: "20px",
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.15))",
  boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "#1a1a1a", // deep dark gray for contrast
  transition: "all 0.3s ease-in-out",
};

const AdminData = {
  totalFamily: 3,
  totalMembers: 20,
  familyAdmin: 3,
  activeUsers: 14,
};

const familyMemberData = [
  {
    familyName: "Bhatt Family",
    totalSize: 8,
    activeUsers: 5,
    inactiveUser: 2,
    suspendedUser: 1,
  },
  {
    familyName: "Family 2",
    totalSize: 10,
    activeUsers: 4,
    inactiveUser: 4,
    suspendedUser: 2,
  },
  {
    familyName: "Pandya Family",
    totalSize: 7,
    activeUsers: 5,
    inactiveUser: 2,
    suspendedUser: 0,
  },
  {
    familyName: "Family 3",
    totalSize: 8,
    activeUsers: 5,
    inactiveUser: 2,
    suspendedUser: 1,
  },
  {
    familyName: "Dave Family",
    totalSize: 7,
    activeUsers: 5,
    inactiveUser: 2,
    suspendedUser: 0,
  },
  {
    familyName: "Family 4",
    totalSize: 10,
    activeUsers: 4,
    inactiveUser: 4,
    suspendedUser: 2,
  },
];

// Colors for each slice
const COLORS = { active: "#9FA8DA", inactive: "#CE93D8", suspended: "#F48FB1" };

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState<Dayjs | null>(null); // Set state to Dayjs or null

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isFocused, setIsFocused] = useState(false);
  const handleEditFamily = () => navigate("/edit-family");
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const hasFetched = useRef(false);
  const [expenseData, setExpenseData] = useState<Expense[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<dayjs.Dayjs>(dayjs());

  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  // Use currency this utility(hooks) in your components
  const currencySymbol = getCurrencySymbol(
    summary?.currencyCode || summary?.currencyName || ""
  );
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

  const handlePieClick = () => {
    // Redirect to /manage-users
    navigate("/manage-users");
  };

  const handleCardClick = () => {
    navigate("/add_cash"); // Redirect to the Expense page
  };

  type StatCardProps = {
    icon: React.ReactNode;
    title: string;
    value: string;
    // new props for glass effect colors:
    bgColor: string; // e.g. "rgba(255, 206, 150, 0.2)"
    borderColor: string; // e.g. "rgba(255, 206, 150, 0.3)"
    textColor: string; // e.g. "#b36f00"
    iconBgColor: string; // e.g. "#b36f00"
  };

  const StatCard: React.FC<StatCardProps> = ({
    icon,
    title,
    value,
    bgColor,
    borderColor,
    textColor,
    iconBgColor,
  }) => (
    <Card
      sx={{
        p: 3,
        borderRadius: "20px",
        backdropFilter: "blur(14px)",
        background: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: `0 5px 10px ${borderColor}`,
        color: textColor,
        textAlign: "center",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: `0 10px 10px ${borderColor}`,
        },
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
        <Avatar sx={{ bgcolor: iconBgColor, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h6" sx={{ color: textColor, letterSpacing: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: textColor, fontWeight: 700 }}>
        {value}
      </Typography>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Admin Card */}
      <Grid container spacing={3}>
        {/* Glass Admin Panel */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              borderRadius: "20px",
              backdropFilter: "blur(14px)",
              background: "rgba(255, 206, 150, 0.2)", // soft warm glass color like ref
              border: "1px solid rgba(255, 206, 150, 0.3)",
              boxShadow: "0 10px 40px rgba(255, 206, 150, 0.25)",
              color: "#b36f00", // warm deep gold text color for headings
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ letterSpacing: 1 }}
            >
              👋 Welcome, {summary?.name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#8a5e00" }}>
              You have full control over all families, users, and budgets, including family-admin assignments.
            </Typography>

            <Typography variant="body1" sx={{ my: 1, fontWeight: 600, mt: 4 }}>
              👨‍👩‍👧 Total Families: <strong>{AdminData.totalFamily}</strong>
            </Typography>
            <Typography variant="body1" sx={{ my: 1, fontWeight: 600 }}>
              👥 Total Members: <strong>{AdminData.totalMembers}</strong>
            </Typography>
            <Typography variant="body1" sx={{ my: 1, fontWeight: 600 }}>
              ✅ Active Members: <strong>{AdminData.activeUsers}</strong>
            </Typography>
            <Typography variant="body1" sx={{ my: 1, fontWeight: 600 }}>
              🔐 Admin: <strong>{AdminData.familyAdmin}</strong>
            </Typography>

            {/* Action Buttons */}
            <Grid
              container
              spacing={1.5}
              sx={{
                mt: 3,
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  startIcon={
                    <AddIcon sx={{ fontSize: 20, color: "#b36f00" }} />
                  }
                  onClick={() => navigate("/create_user")}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.2,
                    px: 2,
                    color: "#b36f00",
                    borderColor: "rgba(179, 111, 0, 0.6)",
                    textTransform: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      bgcolor: "rgba(179, 111, 0, 0.1)",
                      borderColor: "#b36f00",
                      boxShadow: "0 0 8px rgba(179, 111, 0, 0.7)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Add Member
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  startIcon={
                    <ManageAccountsIcon
                      sx={{ fontSize: 20, color: "#7c3aed" }}
                    />
                  }
                  onClick={() => navigate("/manage-users")}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.2,
                    px: 2,
                    color: "#7c3aed",
                    borderColor: "rgba(124, 58, 237, 0.6)",
                    textTransform: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      bgcolor: "rgba(124, 58, 237, 0.1)",
                      borderColor: "#7c3aed",
                      boxShadow: "0 0 8px rgba(124, 58, 237, 0.7)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Manage Users
                </Button>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  startIcon={
                    <AttachMoneyIcon sx={{ fontSize: 20, color: "#d97706" }} />
                  }
                  onClick={handleCardClick}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    py: 1.2,
                    px: 2,
                    color: "#d97706",
                    borderColor: "rgba(217, 119, 6, 0.6)",
                    textTransform: "none",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      bgcolor: "rgba(217, 119, 6, 0.1)",
                      borderColor: "#d97706",
                      boxShadow: "0 0 8px rgba(217, 119, 6, 0.7)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  View Income
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* User Analytics Graph */}
        <Grid item xs={12} md={7}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📈 User Activity Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={familyMemberData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.2)"
                />
                <XAxis
                  dataKey="familyName"
                  stroke="#a0c4ff"
                  tick={{ fill: "#a0c4ff", fontSize: 14 }}
                />
                <YAxis
                  stroke="#a0c4ff"
                  tick={{ fill: "#a0c4ff", fontSize: 14 }}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || payload.length === 0) return null;

                    const activeUsers =
                      payload.find((p) => p.dataKey === "activeUsers")?.value ??
                      0;
                    const inactiveUser =
                      payload.find((p) => p.dataKey === "inactiveUser")
                        ?.value ?? 0;
                    const suspendedUser =
                      payload.find((p) => p.dataKey === "suspendedUser")
                        ?.value ?? 0;

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
                          <span>Active Users:</span>
                          <span style={{ color: "#81c784" }}>
                            {activeUsers}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Inactive Users:</span>
                          <span style={{ color: "#ffb74d" }}>
                            {inactiveUser}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Suspended Users:</span>
                          <span style={{ color: "#e57373" }}>
                            {suspendedUser}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#81c784"
                  strokeWidth={3}
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="inactiveUser"
                  stroke="#ffb74d"
                  strokeWidth={3}
                  name="Inactive Users"
                />
                <Line
                  type="monotone"
                  dataKey="suspendedUser"
                  stroke="#e57373"
                  strokeWidth={3}
                  name="Suspended Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Financial Summary */}
        {/* <Grid container spacing={3}> */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MonetizationOn />}
            title={`Total Income`}
            value={`${currencySymbol} ${
              currentMonthData?.income?.toLocaleString() || 0
            }`}
            bgColor="rgba(72, 187, 120, 0.15)" // greenish glass
            borderColor="rgba(72, 187, 120, 0.3)"
            textColor="#22863a"
            iconBgColor="#2c974b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingDown />}
            title={`Total Expense`}
            value={`${currencySymbol} ${
              currentMonthData?.expense?.toLocaleString() || 0
            }`}
            bgColor="rgba(220, 53, 69, 0.15)" // redish glass
            borderColor="rgba(220, 53, 69, 0.3)"
            textColor="#a71d2a"
            iconBgColor="#d6336c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Savings"
            value={`${currencySymbol} ${
              currentMonthData?.saving?.toLocaleString() || 0
            }`}
            bgColor="rgba(13, 110, 253, 0.15)" // blue glass
            borderColor="rgba(13, 110, 253, 0.3)"
            textColor="#084298"
            iconBgColor="#0d6efd"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CurrencyExchange />}
            title="Currency"
            value={`${currencyLabel} | ${currencySymbol}`}
            bgColor="rgba(255, 193, 7, 0.15)" // yellow glass
            borderColor="rgba(255, 193, 7, 0.3)"
            textColor="#664d03"
            iconBgColor="#ffc107"
          />
        </Grid>
        {/* </Grid> */}

        {/* Expenses Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
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
              p: 3,
              borderRadius: "20px",
              backdropFilter: "blur(14px)",
              background: "rgba(255, 206, 150, 0.2)", // warm soft glass background
              border: "1px solid rgba(255, 206, 150, 0.3)",
              boxShadow: "0 10px 40px rgba(255, 206, 150, 0.25)",
              color: "#b36f00", // warm deep gold text
              height: 430,
              position: "relative",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
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
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
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
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 1,
                backgroundColor: "#ffc878", // soft amber color
                color: "#5c3b00", // dark brown icon color
                "&:hover": {
                  backgroundColor: "#ffb347", // deeper warm amber on hover
                },
              }}
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
                          <InputAdornment position="start">
                            {currencySymbol}
                          </InputAdornment>
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

        <Grid item xs={12}>
          {/* <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.1)",
              background: "transparent",
              p: 2,
              mb: 4,
            }}
          > */}
            <CardContent>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  color: "#1e293b",
                  mb: 2,
                  textAlign: "center",
                }}
              >
                 Recurring Transactions
              </Typography>

              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "20px",
                  backdropFilter: "blur(14px)",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                  transition: "transform 0.4s ease, box-shadow 0.4s ease",
                  maxHeight: 480,
                  overflowY: "auto",
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      background:
                        "linear-gradient(135deg, rgba(174, 148, 243, 0.15), rgba(142, 68, 173, 0.15))",
                      "& th": {
                        color: "#1e293b",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontSize: 13,
                        borderBottom: "2px solid rgba(255,255,255,0.3)",
                        backdropFilter: "blur(8px)",
                        textAlign: "center",
                      },
                    }}
                  >
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Next Due</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody
                    sx={{
                      "& tr:hover": {
                        backgroundColor: "transparent",
                        boxShadow: "inset 0 0 8px rgba(142, 68, 173, 0.1)",
                        transform: "translateY(-1px)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        cursor: "pointer",
                      },
                      "& td": {
                        fontSize: 14,
                        color: "#334155",
                        paddingY: 1.5,
                        paddingX: 2,
                        verticalAlign: "middle",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(8px)",
                        textAlign: "center",
                      },
                    }}
                  >
                    {recurringTransactions.map((txn, index) => (
                      <TableRow key={txn.category}>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
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
                          sx={{ fontWeight: "bold", color: "#6C5CE7" }}
                        >
                          {txn.amount}
                        </TableCell>
                        <TableCell
                          sx={{ color: "#2E7D32", fontWeight: "bold" }}
                        >
                          {txn.dueDate}
                        </TableCell>
                        <TableCell>
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
    </Box>
  );
};

export default AdminDashboard;
