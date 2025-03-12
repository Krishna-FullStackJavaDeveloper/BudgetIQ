import { useState } from "react";
import { verifyOtp } from "../../api/auth";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import OTP from "../../components/layout/OTP";
import { useNotification } from '../../components/common/useNotification'; // Import the custom hook // Hook to trigger notifications


const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
  const username = location.state?.username;
  const { showNotification, NotificationComponent } = useNotification(); 

  const handleVerify = async () => {
    try {
      // Send OTP and username to backend for verification
      const response = await verifyOtp(username, otp);
      // console.log("API Response:", response.data.statusCode);

      if (response.data.statusCode === 200)  {
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
      }else {
        showNotification('Invalid OTP, please try again.', 'error');
      }
    } catch (error) {
      // console.error("OTP verification failed", error);
      showNotification('OTP verification failed, please try again.', 'error');
    }
  };


  return (
    <>
     <Box className="otp-container">
    <Card className="otp-card">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Verify OTP
        </Typography>
        
        {/* Use the custom OTP component here */}
        <OTP 
          separator={<span>-</span>} 
          value={otp} 
          onChange={setOtp} 
          length={6} // Set the OTP length to 6 (or as needed)
        />
        <Button onClick={handleVerify} variant="contained" color="primary" fullWidth  sx={{'marginTop': '20px'}}>
          Verify OTP
        </Button>
      </CardContent>
    </Card>
  </Box>
  <NotificationComponent />
    </>
   
  );
};

export default VerifyOtp;
