import React, { useEffect, useRef, useState } from "react";
import {TableContainer, Box, IconButton, Paper, Table, TableBody, TableRow, TableCell, TableFooter, TablePagination, TableHead, Typography, Card, CardContent, Grid } from "@mui/material";
import { useNotification } from "../../components/common/useNotification";
import { useNavigate } from "react-router-dom";
import { getUserDetails, getUsersForAdmin, getUsersForFamilyAdmin } from "../../api/user";
import { KeyboardArrowDown, KeyboardArrowUp, Visibility } from "@mui/icons-material";
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
    families: { [key: string]: { familyId: number, familyName: string, passkey: string, moderatorId: number, users: User[] } };
  };
}
   
const Row: React.FC<{ row: User; handleViewClick: (id: string) => void; handleEditClick: (id: string) => void}> = ({ row, handleViewClick, handleEditClick }) => {
  const [open, setOpen] = React.useState(false);
 
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
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
          <IconButton  onClick={() => handleEditClick(String(row.id))}   sx={{ color: 'black' }}>
            <Edit sx={{ fontSize: '1.2rem' }}/>
          </IconButton>
          {/* Add View Icon here */}
          <IconButton onClick={() => handleViewClick(String(row.id))}  sx={{ color: 'black' }}>
            <Visibility sx={{ fontSize: '1.2rem' }} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Box sx={{ margin: 1 }}>
            {open && (
              <>
                <Typography variant="h6" gutterBottom component="div" style={{ fontWeight: "bold" }}>
                  Admin Details
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow >
                      <TableCell style={{ fontWeight: "bold" }}>Created At</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Updated At</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Last Login</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>2FA Enabled</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{row.createdAt}</TableCell>
                      <TableCell>{row.updatedAt}</TableCell>
                      <TableCell>{row.lastLogin}</TableCell>
                      <TableCell align="center">{row.twoFactorEnabled ? "✓" : "✘"}</TableCell>
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

const FamilyRow: React.FC<{ familyName: string; members: User[]; handleViewClick: (id: string) => void; handleEditClick: (id: string) => void}> = ({ familyName, members,  handleViewClick, handleEditClick }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{familyName}</TableCell>
        <TableCell>{members.length}</TableCell>
        <TableCell align="left">
                      {/* Add Edit Icon here */}
                      <IconButton onClick={() => console.log("Edit clicked for:", members[0]?.id)}   sx={{ color: 'black' }}>
                        <Edit sx={{ fontSize: '1.2rem' }}/>
                      </IconButton>
                      {/* Add View Icon here */}
                      <IconButton  onClick={() => console.log("View clicked for:", members[0]?.id)}  sx={{ color: 'black' }}>
                        <Visibility sx={{ fontSize: '1.2rem' }} />
                      </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Box sx={{ margin: 1 }}>
            {open && (
              <>
                <Typography variant="h6" gutterBottom component="div" style={{ fontWeight: "bold" }}>
                  Family Members
                </Typography>
                <Table size="small" aria-label="family members">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold" }}>Full Name</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Username</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Email</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>2FA Enabled</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Role</TableCell>
                      <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.accountStatus}</TableCell>
                        <TableCell align="center">{member.twoFactorEnabled ? "✓" : "✘"}</TableCell>
                        <TableCell>
                        {member.roles.map(role => role.replace("ROLE_", "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(", ")}
                        </TableCell>
                        <TableCell>
                        {/* Add Edit Icon here */}
                        <IconButton onClick={() => handleEditClick(String(member.id))}  sx={{ color: 'black' }}>
                          <Edit sx={{ fontSize: '1.2rem' }}/>
                        </IconButton>
                        {/* Add View Icon here */}
                        <IconButton onClick={() => handleViewClick(String(member.id))}  sx={{ color: 'black' }}>
                          <Visibility sx={{ fontSize: '1.2rem' }} />
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
  const [families, setFamilies] = useState<{ [key: string]: { familyId: number, familyName: string, passkey: string, moderatorId: number, users: User[] } }>({});
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("roles");
  const userID = localStorage.getItem("user")|| "";
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


  useEffect(() => {
    if (!token) {
      // console.error("Please login to access your profile");
      showNotification("Please login to access your profile", "error");
      navigate("/login");
      return;
    }

    // Check if userID is valid before calling the API
  if (role ===  '["ROLE_ADMIN"]' && isFirstLoad.current) {
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
  const handleUserRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
  };

  // Handle page change for Family table
  const handleFamilyPageChange = (event: unknown, newPage: number) => {
    setFamilyPage(newPage);
  };

  // Handle rows per page change for Family table
  const handleFamilyRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      familyNames.push(family.familyName);
      usersCount.push(family.users.length);
    }
  
    // If there are users without families
    if (usersWithoutFamily && usersWithoutFamily.length > 0) {
      familyNames.push("No Family");
      usersCount.push(usersWithoutFamily.length);
    }
  
    setGraphData({
      labels: familyNames,
      datasets: [
        {
          label: "Total Users in Families",
          data: usersCount,
          borderColor: "rgba(75,192,192,1)",
          tension: 0.1,
        },
      ],
    });
  };


  return (
    <>
     {/* Add Box with Typography for Manage Users */}
          <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
              Manage Users
            </Typography>
          </Box>
      {/* Admin Table */}
      {role === ('["ROLE_ADMIN"]') && (
      <>
       <div style={{ padding: "20px" }}>
                <Grid container spacing={3}>
                    {/* First Row: 2 Cards on the Left, Graph on the Right */}
                    <Grid item xs={12} md={6}>
                    <Grid container spacing={3}>
                        {/* Total Family Card */}
                        <Grid item xs={12} sm={6} md={6}>
                        <Card sx={{ 
                            background: 'linear-gradient(50deg, #e8d7f3, #d0a3e0, #9c67d6)'
                            , 
                            borderRadius: '10px' 
                        }}>
                            <CardContent>
                            <Typography variant="h5" color="text.secondary">
                                Total Family
                            </Typography>
                            <Typography variant="h4" color="text.primary" style={{ fontWeight: 'bold' }}>
                                {Object.keys(families).length}
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>

                        {/* Total Users Card */}
                        <Grid item xs={12} sm={6} md={6}>
                        <Card sx={{ 
                            background: 'linear-gradient(50deg, #f8d6d6, #f2a3a3, #d66f6f)'
                            , 
                            borderRadius: '10px' 
                        }}>
                            <CardContent>
                            <Typography variant="h5" color="text.secondary">
                                Total Users
                            </Typography>
                            <Typography variant="h4" color="text.primary" style={{ fontWeight: 'bold' }}>
                                {
                                Object.keys(families).reduce((total, family) => total + families[family].users.length, 0)
                                + usersWithoutFamily.length
                                }
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={6}>
                        <Card sx={{ 
                            background: 'linear-gradient(50deg, #e0f8e0, #a8d8a3, #6bbf6b)'
                            , 
                            borderRadius: '10px' 
                        }}>
                            <CardContent>
                            <Typography variant="h5" color="text.secondary">
                                Total Active Users
                            </Typography>
                            <Typography variant="h4" color="text.primary" style={{ fontWeight: 'bold' }}>
                                {/* Active users logic */}
                                {
                                    // Count active users in families
                                    Object.keys(families).reduce((total, family) => {
                                    return total + families[family].users.filter(user => user.accountStatus === "ACTIVE").length;
                                    }, 0) 
                                    + 
                                    // Count active users in usersWithoutFamily
                                    usersWithoutFamily.filter(user => user.accountStatus === "ACTIVE").length
                                }
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                        <Card sx={{ 
                            background: 'linear-gradient(50deg, #e0f4ff, #b3e0ff, #6abfff)',
                            borderRadius: '10px' 
                        }}>
                            <CardContent>
                            <Typography variant="h5" color="text.secondary">
                                Total Family Admin
                            </Typography>
                            <Typography variant="h4" color="text.primary" style={{ fontWeight: 'bold' }}>
                            {
                                // Count family admins (moderators)
                                Object.keys(families).reduce((total, family) => {
                                return total + families[family].users.filter(user => user.roles.includes("ROLE_MODERATOR")).length;
                                }, 0)
                            }
                            </Typography>
                            </CardContent>
                        </Card>
                        </Grid>
                    </Grid>
                </Grid>

                    {/* First Row: Graph on the Right */}
                    <Grid item xs={12} md={6}>
                    <Card sx={{   
                        background: 'linear-gradient(45deg, #f0f4f7, #d1e8e2, #c5c1e0)', // Gradient background
                        borderRadius: "10px" 
                        }}>
                        <CardContent>
                        <Typography variant="h5" color="text.secondary" style={{ marginBottom: "20px" }}>
                            Users Over Time
                        </Typography>
                        {graphData.labels.length > 0 && graphData.datasets[0].data.length > 0 && (
                            <Line data={graphData} />
                        )}
                        </CardContent>
                    </Card>
                    </Grid>
                </Grid>
            </div>
      <TableContainer component={Paper}>
                  {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ paddingLeft: "20px" }}>Admin</h2> */}
                  <Table aria-label="collapsible table" id="admin table">
                      <TableHead
                      sx={{
                        background: 'linear-gradient(135deg, rgba(75, 192, 192, 0.2), rgba(135, 206, 250, 0.2))', // Soft gradient
                        color: '#333', 
                        textAlign: 'center',
                     }}
                      >
                          <TableRow>
                              <TableCell />
                              <TableCell style={{ fontWeight: "bold" }}>Full Name</TableCell>
                              <TableCell align="right" style={{ fontWeight: "bold" }}>Username</TableCell>
                              <TableCell align="right" style={{ fontWeight: "bold" }}>Email</TableCell>
                              <TableCell align="right" style={{ fontWeight: "bold" }}>Phone Number</TableCell>
                              <TableCell align="right" style={{ fontWeight: "bold" }}>Status</TableCell>
                              <TableCell align="right" style={{ fontWeight: "bold" }}>Actions</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {usersWithoutFamily.slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage).map((user) => (
                              <Row key={user.id} row={user}  handleViewClick={handleViewClick} handleEditClick={handleEditClick} />
                          ))}
                      </TableBody>
                      <TableFooter>
                          <TableRow>
                              <TablePagination
                                  rowsPerPageOptions={[5, 10, 25]}
                                  colSpan={7}
                                  count={usersWithoutFamily.length}
                                  rowsPerPage={userRowsPerPage}
                                  page={userPage}
                                  onPageChange={handleUserPageChange}
                                  onRowsPerPageChange={handleUserRowsPerPageChange} />
                          </TableRow>
                      </TableFooter>
                  </Table>
              </TableContainer>
        </>
    )}

      {/* Family List Table */}
      <TableContainer component={Paper} sx={{ marginTop: 4 , marginBottom: 10, borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',}}>
        {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ paddingLeft: "20px" }}>Family List</h2> */}
        <Table aria-label="family list" id="family table">
        <TableHead 
        sx={{
            background: 'linear-gradient(135deg, rgba(75, 192, 192, 0.2), rgba(135, 206, 250, 0.2))', // Soft gradient
            color: '#333', 
            textAlign: 'center',
         }}
         >
            <TableRow>
              <TableCell />
              <TableCell style={{ fontWeight: "bold" }}>Family Name</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Members</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody 
        //   sx={{
        //         background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.9), rgba(245, 245, 245, 0.9))', // Light gradient on rows for a soft look
        //     }}
        >
          {/* Paginate families: slice families based on the current page and rows per page */}
          {Object.keys(families)
              .slice(familyPage * familyRowsPerPage, familyPage * familyRowsPerPage + familyRowsPerPage)
              .map((familyName) => (
                <FamilyRow key={familyName} familyName={familyName} members={families[familyName].users}  handleViewClick={handleViewClick} handleEditClick={handleEditClick}/>
              ))}
          </TableBody>
          <TableFooter 
        //   sx={{
        //     background: 'linear-gradient(135deg, rgba(0, 173, 255, 0.1), rgba(173, 216, 230, 0.1))', // Subtle gradient on the footer
        //     textAlign: 'center',
        //  }}
         >
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={4} // Adjusted to match the number of columns in the table
                count={Object.keys(families).length}
                rowsPerPage={familyRowsPerPage}
                page={familyPage}
                onPageChange={handleFamilyPageChange}
                onRowsPerPageChange={handleFamilyRowsPerPageChange}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
};

export default ManageUser;
