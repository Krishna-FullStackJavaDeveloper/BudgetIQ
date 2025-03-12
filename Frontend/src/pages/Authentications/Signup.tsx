import { useState } from "react";
import { signup } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  Checkbox,
} from "@mui/material";
import { LinearProgress } from '@mui/joy';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AxiosError } from "axios";
import { useNotification } from "../../components/common/useNotification";
import React from "react";

interface ISignup{
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: string[];
  profilePic: string;
  twoFactorEnabled: boolean;
  passkey: string;
  familyName: string;
  accountStatus: string;
}

const Signup = () => {
  const [formData, setFormData] = useState<ISignup>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    role: [],
    profilePic: "",
    twoFactorEnabled: false,
    passkey: "",
    familyName: "",
    accountStatus: "ACTIVE",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { showNotification, NotificationComponent } = useNotification();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
     // If password is being updated, evaluate its strength
      if (name === "password") {
        evaluatePasswordStrength(value);
      }
  };
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: [value],
    });
  };

  const evaluatePasswordStrength = (password: string) => {
    let strength = 0;
  
  if (password.length >= 8) strength += 30;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^A-Za-z0-9]/.test(password)) strength += 15;

  // Check for common patterns or sequences (e.g., "12345", "password")
  const commonPatterns = ["12345", "password", "qwerty", "abc123"];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    strength -= 10;  // Deduct points for common patterns
  }

  // Check for spaces
  if (/\s/.test(password)) {
    strength -= 10;  // Deduct points if the password contains spaces
  }

  setPasswordStrength(strength);
  };
  

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      console.error("No file selected.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;

    setImageUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const response = await fetch("http://localhost:1711/api/files/convertToBase64", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileData: reader.result }),
        });

        const data = await response.json();

        // Directly update the profilePic in the signupOrg object
        const updatedSignupOrg = {
          ...formData,
          profilePic: data.base64, // Update profilePic
        };

        setFormData({ ...formData,  profilePic: data.base64 });
        showNotification("Profile picture uploaded successfully", "success");
      } catch {
        showNotification("Failed to upload profile picture", "error");
      } finally {
        setImageUploading(false);
      }
    };
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (!formData.familyName) {
      newErrors.role = "Family name is required";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    if (!formData.passkey) {
      newErrors.passkey = "Family passkey is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await signup(formData); // Ensure formData is properly formatted
      showNotification(response.data.message, "success");
      navigate("/login");
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        showNotification(error.response.data.message, "error");
      } else {
        showNotification("An unexpected error occurred. Please try again.", "error");
      }
    }
  };


  return (
    <>
      <Box className="signup-container">
        <Card className="signup-card">
          <CardContent>
            <Typography variant="h5" gutterBottom className="signup-header">
              Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
              {[{ label: "Username", name: "username", type: "text" }, 
              { label: "Full Name", name: "fullName", type: "text" }, 
              { label: "Email", name: "email", type: "email" }, 
              { label: "Phone Number", name: "phoneNumber", type: "text" },
              { label: "Family Name", name: "familyName", type: "text" },].map(
                ({ label, name, type }) => (
                  <Grid container spacing={2} alignItems="center" key={name} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Typography>{label}</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        fullWidth
                        name={name}
                        type={type}
                        value={formData ? (formData[name as keyof ISignup] || "") : ""}
                        onChange={handleInputChange}
                        error={!!errors[name]}
                        helperText={errors[name]}
                      />
                    </Grid>
                  </Grid>
                )
              )}

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography>Family Password</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="passkey"
                    type={showPasskey ? "text" : "password"}
                    value={formData.passkey || ""}
                    onChange={handleInputChange}
                    error={!!errors.passkey}
                    helperText={errors.passkey}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPasskey((prev) => !prev)}>
                            {showPasskey ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography>Role</Typography>
              </Grid>
              <Grid item xs={8}>
                <FormControl fullWidth>
                  {/* <InputLabel id="role-label">Role</InputLabel> Set an id for InputLabel */}
                  <Select
                    name="role"
                    labelId="role-label" // Link the label to the select using the labelId
                    value={formData.role[0] || ""}  // Ensure that value is correctly handled
                    onChange={handleSelectChange}
                    displayEmpty
                    error={!!errors.role}
                  >
                    <MenuItem value="" disabled>
                      Select Role
                    </MenuItem>
                    <MenuItem value="MODERATOR">Family Admin</MenuItem>
                    <MenuItem value="USER">User</MenuItem>
                  </Select>
                  {errors.role && <Typography color="error">{errors.role}</Typography>}
                </FormControl>
              </Grid>
            </Grid>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography>Password</Typography>
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    onInput={(e) => evaluatePasswordStrength((e.target as HTMLInputElement).value)} // Casting to HTMLInputElement
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography>Password Strength</Typography>
                </Grid>
                <Grid item xs={8}>
                  <LinearProgress
                    determinate
                    value={passwordStrength}
                    style={{
                      height: 8,
                      borderRadius: 5,
                      backgroundColor: "#ddd",
                    }}
                    color={
                      passwordStrength === 0
                        ? 'neutral' // Color is neutral if the strength is 0
                        : passwordStrength < 50
                        ? 'danger' // Color is danger if below 50
                        : passwordStrength < 75
                        ? 'warning' // Color is warning if between 50 and 75
                        : 'success' // Color is success if above 75
                    }
                    size="md"
                    variant="soft"
                  />
                </Grid>
              </Grid>
              {/* for spacing */}
              <Grid item xs={12} sx={{ mb: 3 }}></Grid>  

              <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Profile Picture */}
              <Grid item xs={6} container alignItems="center">
                  <Grid item xs={6}>
                    <Typography>Profile Picture</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Button variant="contained" component="label">
                      Upload
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    {imageUploading && <LinearProgress />}
                    {/*  && <LinearProgress /> */}
                  </Grid>
                </Grid>
              {/* Two-Factor Authentication */}
              <Grid item xs={6} container alignItems="center">
                  <Grid item xs={6}>
                    <Typography>Two-Factor Authentication</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl>
                      <Checkbox
                        name="twoFactorEnabled"
                        checked={formData.twoFactorEnabled || false} // Check if 2FA is enabled
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                                twoFactorEnabled: e.target.checked, // Update the twoFactorEnabled field                              
                          });
                        }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" fullWidth>
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>

      <NotificationComponent />
    </>
  );
};

export default Signup;

