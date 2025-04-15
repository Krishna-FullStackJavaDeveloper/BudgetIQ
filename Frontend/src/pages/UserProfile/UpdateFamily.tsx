import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  Stack,
  Avatar,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDetails, updateUser } from "../../api/user";
import EditIcon from "@mui/icons-material/Edit"; // To show edit button
import SaveIcon from "@mui/icons-material/Save"; // For save button
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation } from "react-router-dom";
import RestoreIcon from '@mui/icons-material/Restore';
import { useNotification } from "../../components/common/NotificationProvider";

const UpdateFamily = () => {
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedDetails, setEditedDetails] = useState<any | null>(null); // For edited values
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const prevUserIdRef = useRef<string | null>(null);
  const LoginUserID = localStorage.getItem("user");
  // const loginUserId = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const { userId } = useParams();
  const userRoles = JSON.parse(localStorage.getItem("roles") || "[]");

  const location = useLocation();
  const [isEditing, setIsEditing] = useState(location.state?.editMode || false);

  useEffect(() => {
    if (!userId || !token || !LoginUserID) {
      // console.error("Please login to access your profile");
      showNotification("Please login to access your profile", "error");
      navigate("/login");
      return;
    }

    if (prevUserIdRef.current !== userId) {
      const fetchUserDetails = async () => {
        setLoading(true);
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
      prevUserIdRef.current = userId;
    }
  }, [userId, token, navigate, showNotification, LoginUserID]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!token || !editedDetails || !LoginUserID || !userId) {
      showNotification("Error: Missing details or authentication", "error");
      return;
    }

    try {
      const updatedUser = await updateUser(userId, LoginUserID, editedDetails);
      setUserDetails(updatedUser);
      showNotification("Profile updated successfully", "success");
      setIsEditing(false); // Exit edit mode

      // Re-fetch user details to show the latest data after update
      const data = await getUserDetails(userId);
      setUserDetails(data?.data); // Update with the latest data
      setEditedDetails(data?.data); // Sync the edited details with the latest data
    } catch (error) {
      showNotification("Error updating profile", "error");
    }
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

  const handleAccountStatusChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    setEditedDetails((prev: any) => ({
      ...prev,
      accountStatus: value,
    }));
  };

  const handleCancel = () => {
    setEditedDetails(userDetails); // Reset editedDetails to the original data
    setIsEditing(false); // Exit edit mode
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textAlign: "center", mt: 2 }}
        >
          Fetching user details...
        </Typography>
      </Box>
    );
  }

  if (!userDetails) {
    return <Typography>No user data found</Typography>; // Display this message if no user data is found
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4, mt: 4 }}>
          {isEditing ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<SaveIcon sx={{ mb: 1.4 }} />}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
            >
              Save
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEdit}
              startIcon={<EditIcon sx={{ mb: 1.4 }} />}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
            >
              Edit
            </Button>
          )}
        </Box>

        <Card
          sx={{ width: "100%", maxWidth: 600, boxShadow: 5, borderRadius: 3 }}
        >
          <CardContent>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h5" fontWeight={600}>
                {userDetails?.username}
              </Typography>
            </Stack>

            <Grid container spacing={2} mt={2}>
              {["familyName", "passkey"].map(
                (field) => (
                  <Grid item xs={12} key={field}>
                    <TextField
                      fullWidth
                      name={field}
                      label={field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                      value={
                        isEditing
                          ? editedDetails?.[field]
                          : userDetails?.[field]
                      }
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                    />
                  </Grid>
                )
              )}
              {/* Family Name Field (Non-Editable) */}
             

              {[ "updated At", "updated By"].map((field) => (
                <Grid item xs={12} key={field}>
                  <TextField
                    fullWidth
                    name={field}
                    label={field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    value={userDetails?.[field]}
                    disabled
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        <Box
          sx={{ display: "flex", justifyContent: "flex-start", mb: 4, mt: 4 }}
        >
          {isEditing && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCancel}
              sx={{ padding: "1px 12px", borderRadius: "10px" }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
};

export default UpdateFamily;
