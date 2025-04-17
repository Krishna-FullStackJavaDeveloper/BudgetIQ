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
  Autocomplete,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { getUserDetails, updateUser } from "../../api/user";
import EditIcon from "@mui/icons-material/Edit"; // To show edit button
import SaveIcon from "@mui/icons-material/Save"; // For save button
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation } from "react-router-dom";
import RestoreIcon from '@mui/icons-material/Restore';
import { useNotification } from "../../components/common/NotificationProvider";
import { getTimezone } from "../../api/timeZone";


const Profile = () => {
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
  const [timezones, setTimezones] = useState<any[]>([]);

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

  useEffect(() => {
    // Fetch timezones if not already fetched
    if (timezones.length === 0) {
      const fetchTimezones = async () => {
        try {
          const response = await getTimezone();
          setTimezones(response.data);
        } catch (error) {
          console.error("Error fetching timezones:", error);
        }
      };
  
      fetchTimezones();
    }
  }, [timezones]); // Only runs if timezones is empty

  const handleEdit = async () => {
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
              <Avatar
                src={userDetails?.profilePic || "default.jpg"}
                sx={{ width: 100, height: 100 }}
              >
                <AccountCircleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h5" fontWeight={600}>
                {userDetails?.username}
              </Typography>
            </Stack>

            <Grid container spacing={2} mt={2}>
              {["fullName", "username", "email", "password", "phoneNumber", ""].map(
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="familyName"
                  label="Family Name"
                  value={userDetails?.familyName || ""}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item container xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        isEditing
                          ? editedDetails.twoFactorEnabled
                          : userDetails.twoFactorEnabled
                      }
                      onChange={handleCheckboxChange}
                      name="twoFactorEnabled"
                      disabled={!isEditing}
                    />
                  }
                  label="Two-Factor Authentication"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      whiteSpace: "nowrap", // Prevent label text from wrapping
                      fontSize: "16px", // Adjust label font size
                      color: "#333", // Label text color
                    },
                    marginBottom: 0, // Ensure no extra margin at the bottom
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  disabled={
                    !(
                      userRoles.includes("ROLE_ADMIN") ||
                      userRoles.includes("ROLE_MODERATOR")
                    ) || !isEditing
                  }
                >
                  <Select
                    value={editedDetails?.roles?.[0] || userDetails?.roles?.[0]} // Ensure the selected role is updated during editing
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setEditedDetails((prevDetails: any) => ({
                        ...prevDetails,
                        roles: [newRole], // Update the role when the user selects a new one
                      }));
                    }}
                  >
                    {/* Show available roles in the menu */}
                    <MenuItem value="ROLE_USER">ROLE_USER</MenuItem>
                    <MenuItem value="ROLE_ADMIN">ROLE_ADMIN</MenuItem>
                    <MenuItem value="ROLE_MODERATOR">ROLE_MODERATOR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {["createdAt", "updatedAt", "lastLogin"].map((field) => (
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

<Grid item xs={12}>
  <Autocomplete
    disabled={!isEditing}
    fullWidth
    options={timezones}
    getOptionLabel={(option) => option.country + " - " + option.timezone}
    value={
      timezones.find(
        (tz) =>
          tz.timezone ===
          (isEditing
            ? editedDetails?.timezoneDetails?.timezone
            : userDetails?.timezoneDetails?.timezone)
      ) || null
    }
    onChange={(event, newValue) => {
      setEditedDetails((prevDetails: any) => ({
        ...prevDetails,
        timezone: newValue?.timezone || "", // directly store timezone string
      }));
    }}
    renderInput={(params) => (
      <TextField {...params} label="Timezone" variant="outlined" />
    )}
    filterOptions={(options, { inputValue }) => {
      return options.filter(
        (option) =>
          option.country.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.timezone.toLowerCase().includes(inputValue.toLowerCase())
      );
    }}
  />
</Grid>
              <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                {userRoles.includes("ROLE_ADMIN") ||
                userRoles.includes("ROLE_MODERATOR") ? (
                  <FormControl component="fieldset">
                    <FormLabel id="demo-radio-buttons-group-label">
                      Account Status
                    </FormLabel>
                    <RadioGroup
                      row
                      value={
                        isEditing
                          ? editedDetails.accountStatus
                          : userDetails.accountStatus
                      } // Dynamically set
                      onChange={handleAccountStatusChange}
                    >
                      {["ACTIVE", "INACTIVE", "SUSPENDED", "DEACTIVATED"].map(
                        (status) => (
                          <FormControlLabel
                            key={status}
                            value={status}
                            control={<Radio sx={{ mb: 1.4 }} />}
                            label={
                              status.charAt(0) + status.slice(1).toLowerCase()
                            } // Capitalize first letter
                            disabled={!isEditing} // Disable unless editing
                            sx={{ padding: "1px 12px" }}
                          />
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={userDetails?.accountStatus === "ACTIVE"}
                        disabled // Users cannot modify
                        onChange={handleAccountStatusChange}
                      />
                    }
                    label={
                      userDetails?.accountStatus?.trim().toUpperCase() ===
                      "ACTIVE"
                        ? "Account Active"
                        : "Account Inactive"
                    }
                  />
                )}
              </Grid>
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

export default Profile;
