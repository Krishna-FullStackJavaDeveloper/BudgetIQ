import { useState, useEffect } from 'react';
import { resetPassword } from '../../api/auth';  // API call for resetting password
import { Button, TextField, Box, Typography, InputAdornment, IconButton, Card } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotification } from '../../components/common/NotificationProvider';
import axios from 'axios';

const ResetPassword = () => {
  const location = useLocation();
  const { token, email } = location.state || {};  // Get token and email from state passed during navigation
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { showNotification} = useNotification();
    const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      // Call the API with token and new password
      const response = await resetPassword(token, newPassword);

      if (response.statusCode === 200) {
        setSuccessMessage(response.message);
        showNotification(response.message, 'success');
        setTimeout(() => {
          navigate('/login');  // Redirect to the login page after a short delay
        }, 2000);
      }else {
        showNotification(response.message || 'Failed to reset password.', 'error');
      }
    } catch (error) {
      if (error instanceof Error) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Failed to reset password.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
      mt:9
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 450,
        padding: 4,
        borderRadius: "16px",
        boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.15)",
        background: "#f4f7fb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        transition: "box-shadow 0.3s ease",
        '&:hover': {
          boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
        }
      }}>
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
          Reset Your Password
        </Typography>
        
        {email && <Typography variant="body2" align="center" sx={{ mb: 2, color: "#777" }}>
          Password reset for: {email}
        </Typography>}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField label="New Password" type={showNewPassword ? "text" : "password"} fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} variant="outlined" margin="normal" sx={{ marginBottom: 2 }} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
          
          <TextField label="Confirm Password" type={showConfirmPassword ? "text" : "password"} fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined" margin="normal" sx={{ marginBottom: 2 }} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), }} />
          
          {error && <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>}
          {successMessage && <Typography color="success" align="center" sx={{ mb: 2 }}>{successMessage}</Typography>}

          <Button type="submit" variant="contained" fullWidth color="primary" disabled={loading} sx={{ padding: "12px 0", fontSize: "16px", textTransform: "none", backgroundColor: "#0069d9", '&:hover': { backgroundColor: "#005cbf" } }}>
            {loading ? 'Submitting...' : 'Reset Password'}
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default ResetPassword;
