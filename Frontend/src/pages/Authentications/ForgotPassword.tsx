import { useState } from "react";
import { forgotPassword } from "../../api/auth";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../components/common/NotificationProvider";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { showNotification} = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await forgotPassword(email);

      if (response.status === 200) {
        // Display notification and redirect to reset password page with the token
        showNotification('Check your email for password reset instructions.', 'success');
        navigate('/reset-password', { state: { token: response.data.resetToken, email } });
      } else {
        showNotification('Failed to send reset link. Please try again.', 'error');
      }
    } catch (error) {
      showNotification('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              minHeight: "40vh",
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
          }}
      >
          <CardContent>
              <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#333" }}>
                  Forgot Your Password?
              </Typography>
              <Typography variant="body2" align="center" sx={{ color: "#666", mb: 3 }}>
                  Enter your email address to receive a password reset link.
              </Typography>

              <form onSubmit={handleSubmit}>
                  <TextField
                      label="Email Address"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={email}
                      
                      onChange={(e) => setEmail(e.target.value)} />
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit'}
                  </Button>
              </form>
          </CardContent>
      </Card>
      </>
  );
};

export default ForgotPassword;
