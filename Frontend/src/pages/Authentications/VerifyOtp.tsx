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
    <Card
        sx={{
          width: 500,
          padding: 3,
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          background: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "30vh", // This makes sure the card is centered vertically
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)", // Centers the card in the middle of the page
        }}
      >
      <CardContent>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
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
  <NotificationComponent />
    </>
   
  );
};

export default VerifyOtp;
