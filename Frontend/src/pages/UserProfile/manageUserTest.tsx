import React, { useEffect, useState, useRef } from "react";
import { Box, Card, CardContent, Typography, TextField, Grid, Button, CircularProgress, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, FormControl, Stack, Avatar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../../components/common/useNotification";
import { getUserDetails } from "../../api/user";
import EditIcon from '@mui/icons-material/Edit'; // To show edit button
import SaveIcon from '@mui/icons-material/Save'; // For save button
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


const ManageUserTest = () => {
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Track whether the user is in edit mode
  const [editedDetails, setEditedDetails] = useState<any | null>(null); // For edited values
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const isFirstLoad = useRef(true);
  // const loginUserId = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const { userId } = useParams();

  useEffect(() => {
    if (!userId || !token) {
      // console.error("Please login to access your profile");
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
    return <CircularProgress  sx={{ display: "block", margin: "auto" }}/>;
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
    <Card sx={{ width: "100%", maxWidth: 600, boxShadow: 5, borderRadius: 3 }}>
      <CardContent>
        <Stack alignItems="center" spacing={2}>
          <Avatar src={userDetails?.profilePic || "default.jpg"} sx={{ width: 100, height: 100 }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight={600}>
            {userDetails?.username} Profile
          </Typography>
        </Stack>
        <Grid container spacing={2} mt={2}>
          {["fullName", "username", "email", "phoneNumber"].map((field) => (
            <Grid item xs={12} key={field}>
              <TextField
                fullWidth
                name={field}
                label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                value={isEditing ? editedDetails?.[field] : userDetails?.[field]}
                onChange={handleChange}
                disabled={!isEditing}
                variant="outlined"
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <FormControlLabel
              control={<Checkbox checked={userDetails?.accountStatus === "ACTIVE"} disabled />}
              label="Account Active"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <Select value={userDetails?.roles?.[0]} disabled>
                {userDetails?.roles?.map((role: string) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
          {isEditing ? (
            <Button variant="contained" color="primary" onClick={handleSave} startIcon={<SaveIcon />}>Save</Button>
          ) : (
            <Button variant="outlined" color="secondary" onClick={handleEdit} startIcon={<EditIcon />}>Edit</Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  </Box>
  );
};

export default ManageUserTest;
