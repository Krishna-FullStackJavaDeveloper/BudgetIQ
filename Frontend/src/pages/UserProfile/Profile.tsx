import React, { useEffect, useState, useRef } from "react";
import { Box, Card, CardContent, Typography, TextField, Grid, Button, CircularProgress, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../components/common/useNotification";
import { getUserDetails } from "../../api/user";
import EditIcon from '@mui/icons-material/Edit'; // To show edit button
import SaveIcon from '@mui/icons-material/Save'; // For save button

const Profile = () => {
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Track whether the user is in edit mode
  const [editedDetails, setEditedDetails] = useState<any | null>(null); // For edited values
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const isFirstLoad = useRef(true);
  const userId = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      console.error("Please login to access your profile");
      showNotification("Please login to access your profile", "error");
      navigate("/login");
      return;
    }

    if (isFirstLoad.current) {
      const fetchUserDetails = async () => {
        try {
          const data = await getUserDetails(userId);
          setUserDetails(data?.data); // Make sure to use the right path for your response data
          setEditedDetails(data?.data); // Initialize the edited details with fetched data
        } catch (error) {
          showNotification("Error fetching user data", "error");
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
      isFirstLoad.current = false;
    }
  }, [userId, token, navigate, showNotification]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Logic to save updated details (e.g., API call to update user data)
    setUserDetails(editedDetails); // Update the userDetails with the editedDetails
    showNotification("Profile updated successfully", "success");
    setIsEditing(false); // Exit edit mode after saving
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDetails((prevDetails: any) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedDetails((prevDetails: any) => ({
      ...prevDetails,
      [name]: checked,
    }));
  };
  

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ padding: 3, display: "flex", justifyContent: "center" }}>
      <Card sx={{ width: "100%", maxWidth: 800 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
          {isEditing ? editedDetails.username : userDetails.username} profile
          </Typography>
          {userDetails ? (
            <form>
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography> Full Name</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="fullName"
                    value={isEditing ? editedDetails.fullName : userDetails.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter full name"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Username</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="username"
                    value={isEditing ? editedDetails.username : userDetails.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter username"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Email</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="email"
                    value={isEditing ? editedDetails.email : userDetails.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter email"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Phone Number</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="phoneNumber"
                    value={isEditing ? editedDetails.phoneNumber : userDetails.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    variant="outlined"
                    placeholder="Enter phone number"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Account Status</Typography>
                </Grid>
                <Grid item xs={8}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEditing ? editedDetails.accountStatus : userDetails.accountStatus === "ACTIVE"}
                        onChange={handleCheckboxChange}
                        name="accountStatus"
                        // disabled={!isEditing} -- only when update user status.
                        disabled
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Created At</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    value={userDetails.createdAt}
                    disabled
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Updated At</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    value={userDetails.updatedAt}
                    disabled
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Last Login</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    value={userDetails.lastLogin}
                    disabled
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </Grid>
                
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Profile Picture</Typography>
                </Grid>
                <Grid item xs={8}>
                  <img
                    src={userDetails.profilePic || "default.jpg"}
                    alt="Profile"
                    style={{ width: 100, height: 100, borderRadius: "50%", marginBottom: "20px" }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Two-Factor Authentication</Typography>
                </Grid>
                <Grid item xs={8}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEditing ? editedDetails.twoFactorEnabled : userDetails.twoFactorEnabled}
                        onChange={handleCheckboxChange}
                        name="twoFactorEnabled"
                        disabled={!isEditing}
                      />
                    }
                    label="Enabled"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center"  sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Typography>Roles</Typography>
                </Grid>
                <Grid item xs={8}>
                  <FormControl fullWidth disabled>
                    {/* <InputLabel>Roles</InputLabel> */}
                    <Select value={userDetails.roles[0]}>
                      <MenuItem value="ROLE_USER">ROLE_USER</MenuItem>
                      <MenuItem value="ROLE_ADMIN">ROLE_ADMIN</MenuItem>
                      <MenuItem value="ROLE_MODERATOR">ROLE_MODERATOR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} justifyContent="center"  sx={{ mb: 2 }}>
                <Grid item>
                  {isEditing ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <SaveIcon sx={{ marginRight: "8px" }} />
                      Save Changes
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleEdit}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <EditIcon sx={{ marginRight: "8px" }} />
                      Edit Profile
                    </Button>
                  )}
                </Grid>
              </Grid>
            </form>
          ) : (
            <Typography>No user data found</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
