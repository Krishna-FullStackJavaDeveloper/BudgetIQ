import { useState } from "react";
import { login } from "../../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Box, Button, Card, CardContent, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AxiosError } from "axios"; // Import AxiosError if not already imported
import { useNotification } from '../../components/common/useNotification'; // Import the custom hook


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const { showNotification, NotificationComponent } = useNotification(); 

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
          showNotification("Welcome ", 'success');
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
    <Box className="login-container">
    <Card className="login-card">
      <CardContent>
        <Typography variant="h5" gutterBottom className="login-header">
          Login
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <Typography variant="body2" sx={{ textAlign: 'center', marginTop: 2 }}>
            Don&apos;t have an account? <Link to="/sign-up">Sign up</Link>
          </Typography>
      </CardContent>
    </Card>
  </Box>
  <NotificationComponent />
    </>
  );
};

export default Login;
