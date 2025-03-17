import React, { useEffect, useRef, useState } from "react";
import {TableContainer, Box, IconButton, Paper, Table, TableBody, TableRow, TableCell, TableFooter, TablePagination, TableHead, Typography } from "@mui/material";
import { useNotification } from "../../components/common/useNotification";
import { useNavigate } from "react-router-dom";
import { getUsersForAdmin, getUsersForFamilyAdmin } from "../../api/user";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

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

const Row: React.FC<{ row: User }> = ({ row }) => {
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
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
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
                      <TableCell>{row.twoFactorEnabled ? "✓" : "✘"}</TableCell>
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

const FamilyRow: React.FC<{ familyName: string; members: User[] }> = ({ familyName, members }) => {
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
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.fullName}</TableCell>
                        <TableCell>{member.username}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.accountStatus}</TableCell>
                        <TableCell>{member.twoFactorEnabled ? "✓" : "✘"}</TableCell>
                        <TableCell>{member.roles.join(", ")}</TableCell>
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
  const [expandedFamilies, setExpandedFamilies] = useState<{ [key: string]: boolean }>({});
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


  return (
    <>
      {/* Admin Table */}
      {role === ('["ROLE_ADMIN"]') && (
      <TableContainer component={Paper}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ paddingLeft: "20px" }}>Admin</h2>
            <Table aria-label="collapsible table" id="admin table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell style={{ fontWeight: "bold" }}>Full Name</TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>Username</TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>Phone Number</TableCell>
                <TableCell align="right" style={{ fontWeight: "bold" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {usersWithoutFamily.slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage).map((user) => (
                <Row key={user.id} row={user} />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={6}
                  count={usersWithoutFamily.length}
                  rowsPerPage={userRowsPerPage}
                  page={userPage}
                  onPageChange={handleUserPageChange}
                  onRowsPerPageChange={handleUserRowsPerPageChange}
                />
              </TableRow>
            </TableFooter>
            </Table>
      </TableContainer>
    )}
      {/* Family List Table */}
      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ paddingLeft: "20px" }}>Family List</h2>
        <Table aria-label="family list" id="family table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell style={{ fontWeight: "bold" }}>Family Name</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {/* Paginate families: slice families based on the current page and rows per page */}
          {Object.keys(families)
              .slice(familyPage * familyRowsPerPage, familyPage * familyRowsPerPage + familyRowsPerPage)
              .map((familyName) => (
                <FamilyRow key={familyName} familyName={familyName} members={families[familyName].users} />
              ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={3} // Adjusted to match the number of columns in the table
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
