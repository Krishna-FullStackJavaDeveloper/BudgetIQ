import { useState } from "react";
import { login } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Box, Button, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AxiosError } from "axios"; // Import AxiosError if not already imported// Import the custom hook
import { useNotification } from "../../components/common/NotificationProvider";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { showNotification } = useNotification(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      if (response.data.statusCode === 202) {
        showNotification(response.data.message,'info');
        navigate("/verify-otp", { state: { username } });
     
      }else if (response.data.statusCode === 200) {
        const { data } = response.data;

        handleLogin(data); // Save authentication details
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("roles", JSON.stringify(data.roles));
        // console.log("Roles saved in localStorage:", JSON.stringify(roles));
        showNotification(response.data.message, 'success');
      
         // Role-based redirection
         if (data.roles.includes("ROLE_ADMIN")) {
          showNotification("Welcome Admin", 'success');
          navigate("/admin-dashboard");
        } else if (data.roles.includes("ROLE_MODERATOR")) {
         
          navigate("/moderator-dashboard");
        } else {
          showNotification("Welcome user", 'success');
          navigate("/user-dashboard");
        }
      }
    } catch (error: unknown) {
      // Type the error as AxiosError
      if (error instanceof AxiosError) {
        if (error.response && error.response.data) {
          showNotification(error.response.data.message, 'error');  // Show error message from the server
        } else {
          showNotification("An unexpected error occurred. Please try again.", 'error');  // General error message
        }
      } else {
        showNotification("An unexpected error occurred. Please try again.",'error');
      }
    }
  };

  return (
    <>
     {/* <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ece9e6, #ffffff)",
      }}
    > */}
    <Card
        sx={{
          width: 350,
          padding: 3,
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "40vh", // This makes sure the card is centered vertically
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)", // Centers the card in the middle of the page
        }}
      >
      <CardContent>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#333" }}>
            Welcome Back!
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: "#666", mb: 3 }}>
            Sign in to your account
          </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username or Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // helperText="You can use either your username or email to log in."
            // sx={{mb:0}}
          />
           <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2, color: "#555" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#1976d2", fontWeight: "bold", textDecoration: "none" }}>
              Sign up
            </Link>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 1, color: "#1976d2" }}>
            <Link to="/forgot-password" style={{ color: "#1976d2" , textDecoration: "none", fontWeight: "bold" }}>
              Forgot your password?
            </Link>
          </Typography>
      </CardContent>
    </Card>
    </>
  );
};

export default Login;
