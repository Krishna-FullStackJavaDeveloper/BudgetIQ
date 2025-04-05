import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, useTheme, IconButton, Badge, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import BudgetIQIcon from "../../assets/BudgetIQ.png";
import { useNotification } from '../common/NotificationProvider';
import NotificationsIcon from '@mui/icons-material/Notifications';
// BudgetiQ.png

const Header: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, handleLogout, roles } = useAuth(); // Access the authentication state and handleLogout function
  const navigate = useNavigate();

   // Access notifications from global context
   const { notifications, removeNotification } = useNotification();  
// Notification Menu Logic
const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Only set anchorEl if it's not already open
  if (anchorEl !== event.currentTarget) {
    setAnchorEl(event.currentTarget);
  }
};
const handleNotificationClose = () => {
  setAnchorEl(null);
};
 
  const handleLogoutClick = () => {
    handleLogout(); // Dispatch logout action
    navigate('/login'); // Redirect to login page after logout
  };

  const handleLogoClick = () => {
    if (isAuthenticated && roles) {
      // Check if the user has a role
      const role = roles[0]?.replace('ROLE_', '').toLowerCase(); // Get the first role and clean it
      if (role) {
        // Redirect to corresponding dashboard based on role
        navigate(`/${role}-dashboard`); // Assuming dashboards are named like 'admin-dashboard', 'user-dashboard', etc.
      } else {
        navigate('/'); // Default redirect if no valid role is found
      }
    }else{
      navigate('/'); 
    }
  };
  

  return (
    <>
    <AppBar position="fixed" sx={{ width: '100%',  top: 0,
      background: 'linear-gradient(135deg, #6a11cb, #2575fc, #6a11cb)', // Purple to blue
    }}>
      <Toolbar>
        <Typography
          variant="h6"
           component="div"
           onClick={handleLogoClick}
          sx={{
            flexGrow: 1,
            fontWeight: 300,
            fontSize: '1.5rem',
            letterSpacing: '0.5px',
            marginLeft: '60px',
            textDecoration: 'none',  // Ensures no underline on the Link
            color: 'inherit',  // Inherits the color from the parent or theme
             cursor: 'pointer', 
          }}
        >
           {/* <img src={BudgetIQIcon} alt="BudgetIQ Icon" className="app-icon" /> */}
          BudgetIQ - Your Best Friend for Better Saving.
        </Typography>

        {/* Conditionally render Login or Logout button based on isAuthenticated */}
        {isAuthenticated && (
          <>
            {/* Notification Icon with Badge */}
            <IconButton color="inherit" onClick={handleNotificationClick} sx={{ mr: 1 }}>
              <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon  sx={{ mb: 1.5}}/>
              </Badge>
            </IconButton>

            {/* Notification Dropdown Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleNotificationClose}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem
                    key={index}
                    sx={{ color: notification.severity === "error" ? "red" : "green" }}
                    onClick={() => removeNotification(index)} // Remove on click
                  >
                    {notification.message}
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No new notifications</MenuItem>
              )}
            </Menu>
          </>
        )}
        {isAuthenticated ? (
          <Button
            color="inherit"
            onClick={handleLogoutClick}
            sx={{
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.secondary.main,
              },
            }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.secondary.main,
              },
            }}
          >
            Login
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/signup"
            sx={{
              borderRadius: '4px',
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '1rem',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: theme.palette.secondary.main,
              },
            }}
          >
            Register
          </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
    {/* Add padding to content below the AppBar */}
    <div style={{ paddingTop: "80px" }}>
    {/* The rest of your page content goes here */}
  </div>
</>
  );
};

export default Header;
