import React from 'react';
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Example icon
import SettingsIcon from '@mui/icons-material/Settings'; // Example icon
import PeopleIcon from '@mui/icons-material/People'; // Example icon
import ReportIcon from '@mui/icons-material/Report'; // Example icon
import PersonIcon from '@mui/icons-material/Person'; 
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AddCardIcon from '@mui/icons-material/AddCard';
import cashWithdrawIcon from '../../assets/cash-withdrawal.png';
import CategoryIcon from '@mui/icons-material/Category';

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  roles: string[] | null;
}
interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleSidebar, isAuthenticated, roles }) => {
  if (!isAuthenticated) return null; // Hide sidebar if not authenticated
  if (!roles) return null;
  const userId = localStorage.getItem('user') || ''; 
  // Define different menus based on roles
  const menuItems: Record<string, MenuItem[]> = {
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard', icon: <DashboardIcon /> },
      { label: 'Create User', path: '/create_user', icon: <PersonAddAltIcon /> },
      { label: 'Manage Users', path: '/manage-users', icon: <PeopleIcon /> },
      { label: 'Add Cash', path: '/add_cash', icon: <AddCardIcon /> },
      { label: 'Add Expense', path: '/add_Expense', icon: <LocalAtmIcon /> },
      { label: 'Reports', path: '/manage-users-test', icon: <ReportIcon /> },
      { label: 'My Profile', path: `/edit-user/${userId}`, icon: <PersonIcon /> }
    ],
    moderator: [
      { label: 'Dashboard', path: '/moderator-dashboard', icon: <DashboardIcon /> },
      { label: 'Add Cash', path: '/add_cash', icon: <AddCardIcon /> },
      { label: 'Create User', path: '/create_user', icon: <PersonAddAltIcon /> },
      { label: 'Edit Family', path: `/edit-family/${userId}`, icon: <PersonIcon /> },
      { label: 'Manage Users', path: '/manage-users', icon: <PeopleIcon /> },
      { label: 'Reports', path: '/reports', icon: <ReportIcon /> },
      { label: 'My Profile', path: `/edit-user/${userId}`, icon: <PersonIcon /> }
    ],
    user: [
      { label: 'Dashboard', path: '/user-dashboard', icon: <DashboardIcon /> },
      { label: 'Income', path: '/add_cash', icon: <AddCardIcon /> },
      // { label: 'Add Expense', path: '/add_Expense', icon: <img src={cashWithdrawIcon} alt="Withdraw Cash" style={{ width: 24, height: 24 }} /> },
      { label: 'Expense', path: '/add_Expense', icon: <LocalAtmIcon /> },
      { label: 'Category', path: '/add_Category', icon: <CategoryIcon /> },
      { label: 'Test-Profile', path: `/edit-user/${userId}`, icon: <PersonIcon /> },
      { label: 'Dashboard-Test', path: '/manage-users-test', icon: <ReportIcon /> },
      { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
      { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
    ]
  };

  const selectedMenu: MenuItem[] = roles.reduce((acc, role) => {
    // Remove the 'ROLE_' prefix and map the role to its menu
    const cleanRole = role.replace('ROLE_', '').toLowerCase();
    const roleMenuItems = menuItems[cleanRole as keyof typeof menuItems];
    if (roleMenuItems) {
      acc = [...acc, ...roleMenuItems];
    }
    return acc;
  }, [] as MenuItem[]);

  const handleMenuItemClick = () => {
    // Close the sidebar after a link is clicked
    toggleSidebar();
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleSidebar}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' }
        }}
      >
       {/* Close Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 0,
          left: 5,
          zIndex: 1201,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Adjust the hover background color
          },
        }}
        onClick={toggleSidebar}
      >
        <ChevronLeftIcon />
        <h4>BudgetIQ</h4> 
      </IconButton>
      
        {/* Divider between icon and menu list */}
        <Box sx={{ marginTop: '90px' }}> {/* Adjust spacing */}
          <Divider />
        </Box>
        
       {/* Sidebar List */}
       <List sx={{ marginTop: '10px' }}>
          {selectedMenu.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem
                component={RouterLink}
                to={item.path}
                sx={{
                  cursor: 'pointer',
                  color: '#333', // Set the text color
                  '&:hover': {
                    backgroundColor: '#f5f5f5', // Hover color for the list item
                    color: '#0077b6', // Hover text color
                  },
                  padding: '12px 16px', // Adjust padding for better spacing
                }}
                onClick={handleMenuItemClick} // Close sidebar when a menu item is clicked
              >
                <ListItemIcon sx={{ color: '#333' }}>
                  {item.icon} {/* Display icon */}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ textAlign: 'left', fontWeight: 500 }} />
              </ListItem>

              {/* Add a Divider after certain items */}
              {index === 2 && <Divider />} {/* For example, add a divider after the third item */}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Sidebar Toggle burger Button */}
      <IconButton
      sx={{
        position: 'fixed', // Make it fixed relative to the viewport
        top: '10px', // Adjust the top distance from the viewport
        left: '10px', // Adjust the left distance from the viewport (to prevent any gap)
        zIndex: 1200, // Ensure it's above other content
        color: 'white', // Keep the icon color white or adjust accordingly
      }}
      onClick={toggleSidebar}
    >
      <MenuIcon />
    </IconButton>
    </>
  );
};

export default Sidebar;
