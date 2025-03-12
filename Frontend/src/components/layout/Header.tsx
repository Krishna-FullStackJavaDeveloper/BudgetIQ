import React from 'react';
import { AppBar, Toolbar, Typography, Button, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 
import BudgetIQIcon from "../../assets/BudgetIQ.png";
// BudgetiQ.png

const Header: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, handleLogout, roles } = useAuth(); // Access the authentication state and handleLogout function
  const navigate = useNavigate();

 
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
    <AppBar position="sticky" sx={{ 
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
  );
};

export default Header;
