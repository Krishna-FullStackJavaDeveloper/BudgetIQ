import React, { useEffect, useRef, useState } from "react";
import {
  TableContainer,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TablePagination,
  TableHead,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import {
  getUserDetails,
  getUsersForAdmin,
  getUsersForFamilyAdmin,
} from "../../api/user";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  PersonAdd,
  Visibility,
} from "@mui/icons-material";
import { Edit } from "@mui/icons-material";
import { Line } from "react-chartjs-2"; // Import Chart.js for graph
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNotification } from "../../components/common/NotificationProvider";
import AddIcon from "@mui/icons-material/Add";

// Register required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  roles: string[];
}

interface ApiResponse {
  data: {
    usersWithoutFamily: User[];
    families: {
      [key: string]: {
        familyId: number;
        familyName: string;
        passkey: string;
        moderatorId: number;
        users: User[];
      };
    };
  };
}

const Row: React.FC<{
  row: User;
  handleViewClick: (id: string) => void;
  handleEditClick: (id: string) => void;
}> = ({ row, handleViewClick, handleEditClick }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.fullName}
        </TableCell>
        <TableCell align="right">{row.username}</TableCell>
        <TableCell align="right">{row.email}</TableCell>
        <TableCell align="right">{row.phoneNumber}</TableCell>
        <TableCell align="right">{row.accountStatus}</TableCell>
        <TableCell align="right">
          {/* Add Edit Icon here */}
          <IconButton
            onClick={() => handleEditClick(String(row.id))}
            sx={{ color: "black" }}
          >
            <Edit sx={{ fontSize: "1.2rem" }} />
          </IconButton>
          {/* Add View Icon here */}
          <IconButton
            onClick={() => handleViewClick(String(row.id))}
            sx={{ color: "black" }}
          >
            <Visibility sx={{ fontSize: "1.2rem" }} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Box sx={{ margin: 1 }}>
            {open && (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  style={{ fontWeight: "bold" }}
                >
                  Admin Details
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>
                        Created At
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        Updated At
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        Last Login
                      </TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>
                        2FA Enabled
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{row.createdAt}</TableCell>
                      <TableCell>{row.updatedAt}</TableCell>
                      <TableCell>{row.lastLogin}</TableCell>
                      <TableCell align="center">
                        {row.twoFactorEnabled ? "✓" : "✘"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

const FamilyRow: React.FC<{
  familyId: number;
  familyName: string;
  members: User[];
  handleViewClick: (id: string) => void;
  handleEditClick: (id: string) => void;
  handleViewFamilyClick: (id: string) => void;
  handleEditFamilyClick: (id: string) => void;
}> = ({
  familyId,
  familyName,
  members,
  handleViewClick,
  handleEditClick,
  handleViewFamilyClick,
  handleEditFamilyClick,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{familyName}</TableCell>
        <TableCell>
          {members.filter((member) => member.accountStatus === "ACTIVE").length}
        </TableCell>
        <TableCell align="left">
          {/* Add Edit Icon here */}
          <IconButton
            onClick={() => handleEditFamilyClick(familyId.toString())}
            sx={{ color: "black" }}
          >
            <Edit sx={{ fontSize: "1.2rem" }} />
          </IconButton>
          {/* Add View Icon here */}
          <IconButton
            onClick={() => handleViewFamilyClick(familyId.toString())}
            sx={{ color: "black" }}
          >
            <Visibility sx={{ fontSize: "1.2rem" }} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Box sx={{ margin: 1 }}>
            {open && (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  component="div"
                  style={{ fontWeight: "bold" }}
                >
                  Family Members
                </Typography>
                <Table size="small" aria-label="family members">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Full Name
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Username
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Email
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Status
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        2FA Enabled
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Role
                      </TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members
                      .slice() // make a copy to avoid mutating props
                      .sort((a, b) => a.fullName.localeCompare(b.fullName))
                      .map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.fullName}</TableCell>
                          <TableCell>{member.username}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          {/* <TableCell>{member.accountStatus}</TableCell> */}
                          <TableCell align="center">
                            <Box
                              component="span"
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "999px",
                                px: 2,
                                py: 0.5,
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                textTransform: "capitalize",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.08)",
                                transition: "all 0.3s ease-in-out",
                                cursor: "default",
                                bgcolor:
                                  member.accountStatus === "ACTIVE"
                                    ? "#e6f4ea"
                                    : member.accountStatus === "INACTIVE"
                                    ? "#fff8e1"
                                    : member.accountStatus === "SUSPENDED"
                                    ? "#fdecea"
                                    : "#eeeeee",
                                color:
                                  member.accountStatus === "ACTIVE"
                                    ? "#2e7d32"
                                    : member.accountStatus === "INACTIVE"
                                    ? "#f57c00"
                                    : member.accountStatus === "SUSPENDED"
                                    ? "#c62828"
                                    : "#666",
                                border: "1px solid",
                                borderColor:
                                  member.accountStatus === "ACTIVE"
                                    ? "#81c784"
                                    : member.accountStatus === "INACTIVE"
                                    ? "#ffcc80"
                                    : member.accountStatus === "SUSPENDED"
                                    ? "#ef9a9a"
                                    : "#ccc",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            >
                              {member.accountStatus === "ACTIVE" && "✅ Active"}
                              {member.accountStatus === "INACTIVE" &&
                                "🟠 Inactive"}
                              {member.accountStatus === "SUSPENDED" &&
                                "🚫 Suspended"}
                              {member.accountStatus === "DEACTIVATED" &&
                                "❌ Deactivated"}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            {member.twoFactorEnabled ? "✓" : "✘"}
                          </TableCell>
                          <TableCell>
                            {member.roles
                              .map((role) =>
                                role
                                  .replace("ROLE_", "")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (c) => c.toUpperCase())
                              )
                              .join(", ")}
                          </TableCell>
                          <TableCell>
                            {/* Add Edit Icon here */}
                            <IconButton
                              onClick={() => handleEditClick(String(member.id))}
                              sx={{ color: "black" }}
                            >
                              <Edit sx={{ fontSize: "1.2rem" }} />
                            </IconButton>
                            {/* Add View Icon here */}
                            <IconButton
                              onClick={() => handleViewClick(String(member.id))}
                              sx={{ color: "black" }}
                            >
                              <Visibility sx={{ fontSize: "1.2rem" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

const ManageUser: React.FC = () => {
  const [usersWithoutFamily, setUsersWithoutFamily] = useState<User[]>([]);
  const [families, setFamilies] = useState<{
    [key: string]: {
      familyId: number;
      familyName: string;
      passkey: string;
      moderatorId: number;
      users: User[];
    };
  }>({});
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("roles");
  const userID = localStorage.getItem("user") || "";
  const [loading, setLoading] = useState(true);
  // Pagination States for Admin Table
  const [userPage, setUserPage] = React.useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = React.useState(5);

  // Pagination States for Family Table
  const [familyPage, setFamilyPage] = React.useState(0);
  const [familyRowsPerPage, setFamilyRowsPerPage] = React.useState(5);
  // Initialize state for graph data
  const [graphData, setGraphData] = useState<{
    labels: string[]; // Explicitly specify that labels are an array of strings
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }[];
  }>({
    labels: [], // Dynamically generated labels (family names or categories)
    datasets: [
      {
        label: "Total Users in Families",
        data: [], // To be populated with dynamic data from the API
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  });

  const handleViewClick = async (userId: string) => {
    try {
      navigate(`/edit-user/${userId}`, { state: { editMode: false } }); // View Mode
      // Here, you can update the state or open a modal with user details
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleEditClick = async (userId: string) => {
    try {
      navigate(`/edit-user/${userId}`, { state: { editMode: true } }); // Edit Mode
      // Here, you can update the state or open a modal with user details
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleViewFamilyClick = async (familyId: string) => {
    try {
      navigate("/my-family", { state: { editMode: false } }); // View Mode
      // Here, you can update the state or open a modal with user details
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleEditFamilyClick = async (familyId: string) => {
    try {
      navigate("/my-family", { state: { editMode: true } }); // Edit Mode
      // Here, you can update the state or open a modal with user details
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      // console.error("Please login to access your profile");
      showNotification("Please login to access your profile", "error");
      navigate("/login");
      return;
    }

    // Check if userID is valid before calling the API
    if (role === '["ROLE_ADMIN"]' && isFirstLoad.current) {
      const fetchUserDetails = async () => {
        try {
          const response: ApiResponse = await getUsersForAdmin();
          if (response && response.data) {
            setUsersWithoutFamily(response.data.usersWithoutFamily);
            setFamilies(response.data.families);
            fetchAndCreateGraphData(response.data);
          }
        } catch (error) {
          showNotification("Error fetching user data", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
      isFirstLoad.current = false;
    }
    // Ensure userID is valid for fetching family data
    if (role === '["ROLE_MODERATOR"]' && userID && isFirstLoad.current) {
      const fetchFamilyDetails = async () => {
        try {
          const response: ApiResponse = await getUsersForFamilyAdmin(userID);
          if (response && response.data) {
            setFamilies(response.data.families);
          }
        } catch (error) {
          showNotification("Error fetching user data", "error");
        } finally {
          setLoading(false);
        }
      };
      fetchFamilyDetails();
      isFirstLoad.current = false;
    }
  }, [token, role, userID, navigate, showNotification]);

  // Handle page change for Admin table
  const handleUserPageChange = (event: unknown, newPage: number) => {
    setUserPage(newPage);
  };

  // Handle rows per page change for Admin table
  const handleUserRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  // Handle page change for Family table
  const handleFamilyPageChange = (event: unknown, newPage: number) => {
    setFamilyPage(newPage);
  };

  // Handle rows per page change for Family table
  const handleFamilyRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFamilyRowsPerPage(parseInt(event.target.value, 10));
    setFamilyPage(0);
  };

  const fetchAndCreateGraphData = (data: any) => {
    const families = data.families;
    const usersWithoutFamily = data.usersWithoutFamily;

    const familyNames: string[] = [];
    const usersCount: number[] = [];

    for (let familyName in families) {
      const family = families[familyName];

      // Filter only active, non-admin users
      const activeNonAdminUsers = family.users.filter((user: any) => {
        return (
          user.accountStatus === "ACTIVE" &&
          !user.roles.includes("ROLE_ADMIN") &&
          !user.roles.includes("ROLE_SUPER_ADMIN")
        );
      });

      // Skip families with no relevant users
      if (activeNonAdminUsers.length > 0) {
        familyNames.push(family.familyName);
        usersCount.push(activeNonAdminUsers.length);
      }
    }

    // Process users without family: only show if not admin
    const activeNonAdminWithoutFamily = usersWithoutFamily?.filter(
      (user: any) => {
        return (
          user.accountStatus === "ACTIVE" &&
          !user.roles.includes("ROLE_ADMIN") &&
          !user.roles.includes("ROLE_SUPER_ADMIN")
        );
      }
    );

    if (activeNonAdminWithoutFamily && activeNonAdminWithoutFamily.length > 0) {
      familyNames.push("No Family");
      usersCount.push(activeNonAdminWithoutFamily.length);
    }

    setGraphData({
      labels: familyNames,
      datasets: [
        {
          label: "Total Active Users in Families",
          data: usersCount,
          borderColor: "rgba(75,192,192,1)",
          tension: 0.1,
        },
      ],
    });
  };
  const handleAddMember = () => navigate(`/create_user`);

  return (
    <>
      {/* Add Box with Typography for Manage Users */}

      {/* Admin Table */}
      {role === '["ROLE_ADMIN"]' && (
        <>
          <div style={{ padding: "20px" }}>
            <Grid container spacing={3}>
              {/* First Row: 2 Cards on the Left, Graph on the Right */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={3}>
                  {/* Full-width Horizontal Card */}
                  <Grid item xs={12}>
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: "20px",
                        backdropFilter: "blur(14px)",
                        background: "rgba(255, 206, 150, 0.2)", // soft warm glass color
                        border: "1px solid rgba(255, 206, 150, 0.3)",
                        boxShadow: "0 10px 40px rgba(255, 206, 150, 0.25)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        padding: 2,
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h5"
                          sx={{
                            color: "#b36f00",
                            fontWeight: 600,
                            letterSpacing: 1,
                            mb: 1,
                          }}
                        >
                          Welcome Back, Krishna!
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#8a5e00", fontWeight: 400 }}
                        >
                          Here's a quick overview of your family dashboard.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Now the existing 4 cards in 2x2 grid */}
                  <Grid item xs={12} sm={6} md={6}>
                    {/* Total Family Card */}
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: "20px",
                        backdropFilter: "blur(12px)",
                        background: "rgba(167, 139, 250, 0.2)",
                        border: "1px solid rgba(167, 139, 250, 0.3)",
                        boxShadow: "0 8px 30px rgba(167, 139, 250, 0.15)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#7c3aed",
                            fontWeight: "600",
                            letterSpacing: 1,
                            mb: 1,
                          }}
                        >
                          Total Family
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "bold",
                            color: "#4c1d95",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {Object.keys(families).length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Repeat for other 3 cards ... */}

                  <Grid item xs={12} sm={6} md={6}>
                    {/* Total Users Card */}
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: "20px",
                        backdropFilter: "blur(12px)",
                        background: "rgba(246, 139, 139, 0.2)",
                        border: "1px solid rgba(246, 139, 139, 0.3)",
                        boxShadow: "0 8px 30px rgba(246, 139, 139, 0.15)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#b91c1c",
                            fontWeight: "600",
                            letterSpacing: 1,
                            mb: 1,
                          }}
                        >
                          Total Users
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "bold",
                            color: "#7f1d1d",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {Object.keys(families).reduce(
                            (total, family) =>
                              total + families[family].users.length,
                            0
                          ) + usersWithoutFamily.length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    {/* Total Active Users Card */}
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: "20px",
                        backdropFilter: "blur(12px)",
                        background: "rgba(107, 191, 107, 0.2)",
                        border: "1px solid rgba(107, 191, 107, 0.3)",
                        boxShadow: "0 8px 30px rgba(107, 191, 107, 0.15)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#15803d",
                            fontWeight: "600",
                            letterSpacing: 1,
                            mb: 1,
                          }}
                        >
                          Total Active Users
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "bold",
                            color: "#14532d",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {Object.keys(families).reduce((total, family) => {
                            return (
                              total +
                              families[family].users.filter(
                                (user) => user.accountStatus === "ACTIVE"
                              ).length
                            );
                          }, 0) +
                            usersWithoutFamily.filter(
                              (user) => user.accountStatus === "ACTIVE"
                            ).length}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    {/* Total Family Admin Card */}
                    <Card
                      sx={{
                        position: "relative",
                        borderRadius: "20px",
                        backdropFilter: "blur(12px)",
                        background: "rgba(106, 191, 255, 0.2)",
                        border: "1px solid rgba(106, 191, 255, 0.3)",
                        boxShadow: "0 8px 30px rgba(106, 191, 255, 0.15)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#2563eb",
                            fontWeight: "600",
                            letterSpacing: 1,
                            mb: 1,
                          }}
                        >
                          Total Family Admin
                        </Typography>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: "bold",
                            color: "#1e40af",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {Object.keys(families).reduce((total, family) => {
                            return (
                              total +
                              families[family].users.filter((user) =>
                                user.roles.includes("ROLE_MODERATOR")
                              ).length
                            );
                          }, 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* First Row: Graph on the Right */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "20px",
                    backdropFilter: "blur(14px)",
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                    transition: "transform 0.4s ease, box-shadow 0.4s ease",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      width: "300px",
                      height: "300px",
                      // background: 'radial-gradient(circle at 30% 30%, #a78bfa, #7dd3fc, transparent)',
                      top: "-100px",
                      right: "-100px",
                      zIndex: 0,
                      opacity: 0.4,
                    },
                  }}
                >
                  <CardContent sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        color: "#1f2937",
                        position: "relative",
                        mb: 4,
                        "&::after": {
                          content: '""',
                          display: "block",
                          width: "60px",
                          height: "3px",
                          background:
                            "linear-gradient(to right, #6366f1, #06b6d4)",
                          margin: "8px auto 0",
                          borderRadius: "2px",
                        },
                      }}
                    >
                      📊 Users in Family
                    </Typography>

                    {graphData.labels.length > 0 &&
                    graphData.datasets[0].data.length > 0 ? (
                      <Box sx={{ height: 345, px: 1 }}>
                        <Line
                          data={graphData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: true,
                                position: "bottom",
                                labels: {
                                  color: "#374151",
                                  font: { size: 13 },
                                },
                              },
                            },
                            scales: {
                              x: {
                                ticks: { color: "#6b7280", font: { size: 12 } },
                                grid: { display: false },
                              },
                              y: {
                                ticks: { color: "#6b7280", font: { size: 12 } },
                                grid: { color: "rgba(0,0,0,0.06)" },
                              },
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography
                        align="center"
                        sx={{ color: "#64748b", mt: 3 }}
                      >
                        No data available at the moment.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>
          <TableContainer
            component={Paper}
            sx={{
              mt: 3,
              borderRadius: "20px",
              backdropFilter: "blur(14px)",
              background: "rgba(255, 255, 255, 0.15)", // translucent white
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
              transition: "transform 0.4s ease, box-shadow 0.4s ease",
              maxHeight: 480, // optional: control height if you want scroll inside table
              overflowY: "auto", // scroll if needed
            }}
          >
            <Table
              aria-label="collapsible table"
              id="admin table"
              sx={{ minWidth: 750 }}
            >
              <TableHead
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))", // subtle blue-purple gradient
                  "& th": {
                    color: "#1e293b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontSize: 14,
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    backdropFilter: "blur(8px)",
                  },
                }}
              >
                <TableRow>
                  <TableCell />
                  <TableCell>Full Name</TableCell>
                  <TableCell align="right">Username</TableCell>
                  <TableCell align="right">Email</TableCell>
                  <TableCell align="right">Phone Number</TableCell>
                  <TableCell align="right">Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  "& tr:hover": {
                    backgroundColor: "transparent", // No color change on hover
                    boxShadow: "inset 0 0 8px rgba(0, 149, 255, 0.15)", // subtle inner glow
                    transform: "translateY(-1px)", // slight lift
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
                {usersWithoutFamily
                  .slice(
                    userPage * userRowsPerPage,
                    userPage * userRowsPerPage + userRowsPerPage
                  )
                  .map((user) => (
                    <Row
                      key={user.id}
                      row={user}
                      handleViewClick={handleViewClick}
                      handleEditClick={handleEditClick}
                    />
                  ))}
              </TableBody>

              <TableFooter
                sx={{
                  "& .MuiTablePagination-root": {
                    borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                      {
                        fontSize: 14,
                        color: "#64748b",
                      },
                  },
                }}
              >
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={7}
                    count={usersWithoutFamily.length}
                    rowsPerPage={userRowsPerPage}
                    page={userPage}
                    onPageChange={handleUserPageChange}
                    onRowsPerPageChange={handleUserRowsPerPageChange}
                    sx={{ color: "#64748b" }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </>
      )}

      {role === '["ROLE_MODERATOR"]' && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
            mb: 1,
          }}
        >
          <Button
            variant="contained"
            onClick={handleAddMember}
            sx={{
              background: "linear-gradient(45deg, #0ea5e9, #38bdf8)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "12px",
              px: 3,
              py: 1,
              height: "44px",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              boxShadow: "0 4px 20px rgba(14, 165, 233, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #0284c7, #0ea5e9)",
                boxShadow: "0 6px 25px rgba(14, 165, 233, 0.6)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, lineHeight: 1 }}
              >
                Add Member
              </Typography>
              <PersonAdd sx={{ fontSize: 22 }} />
            </Box>
          </Button>
        </Box>
      )}

      {/* Family List Table */}
      <TableContainer
        component={Paper}
        sx={{
          marginTop: 4,
          marginBottom: 10,
          borderRadius: "20px",
          backdropFilter: "blur(14px)",
          background: "rgba(255, 255, 255, 0.15)", // translucent white
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          transition: "transform 0.4s ease, box-shadow 0.4s ease",
          maxHeight: "unset", // or remove entirely
          overflowY: "visible", // let the content expand the container
        }}
      >
        <Table
          aria-label="family list"
          id="family table"
          sx={{ minWidth: 750 }}
        >
          <TableHead
            sx={{
              background:
                "linear-gradient(135deg, rgba(99, 179, 255, 0.15), rgba(0, 149, 255, 0.15))", // subtle blue gradient, different from users table
              "& th": {
                color: "#1e293b",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: 14,
                borderBottom: "2px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(8px)",
                textAlign: "center",
              },
            }}
          >
            <TableRow>
              <TableCell />
              <TableCell>Family Name</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={{
              "& tr:hover": {
                backgroundColor: "transparent", // No color change on hover
                boxShadow: "inset 0 0 8px rgba(0, 149, 255, 0.15)", // subtle inner glow
                transform: "translateY(-1px)", // slight lift
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
            {Object.keys(families)
              .sort((a, b) =>
                families[a].familyName.localeCompare(families[b].familyName)
              )
              .slice(
                familyPage * familyRowsPerPage,
                familyPage * familyRowsPerPage + familyRowsPerPage
              )
              .map((familyName) => {
                const family = families[familyName];
                return (
                  <FamilyRow
                    key={family.familyId}
                    familyId={family.familyId}
                    familyName={family.familyName}
                    members={family.users}
                    handleViewFamilyClick={handleViewFamilyClick}
                    handleEditFamilyClick={handleEditFamilyClick}
                    handleViewClick={handleViewClick}
                    handleEditClick={handleEditClick}
                  />
                );
              })}
          </TableBody>

          <TableFooter
            sx={{
              "& .MuiTablePagination-root": {
                borderTop: "1px solid rgba(255, 255, 255, 0.3)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                  {
                    fontSize: 14,
                    color: "#64748b",
                  },
              },
            }}
          >
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[2, 5, 10, 25]}
                colSpan={4}
                count={Object.keys(families).length}
                rowsPerPage={familyRowsPerPage}
                page={familyPage}
                onPageChange={handleFamilyPageChange}
                onRowsPerPageChange={handleFamilyRowsPerPageChange}
                sx={{ color: "#64748b" }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default ManageUser;
