import React from 'react';
import { Drawer, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
  isAuthenticated: boolean;
  roles: string[] | null;
}
interface MenuItem {
  label: string;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleSidebar, isAuthenticated, roles }) => {
  if (!isAuthenticated) return null; // Hide sidebar if not authenticated
  if (!roles) return null;
  // Define different menus based on roles
  const menuItems: Record<string, MenuItem[]> = {
    admin: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Manage Users', path: '/manage-users' },
      { label: 'Reports', path: '/reports' },
      { label: 'Settings', path: '/settings' },
      { label: 'My Profile', path: '/my-profile' }
    ],
    moderator: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Moderation Panel', path: '/moderation' },
      { label: 'Reports', path: '/reports' },
      { label: 'My Profile', path: '/my-profile' }
    ],
    user: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Profile', path: '/profile' },
      { label: 'Settings', path: '/settings' },
      { label: 'My Profile', path: '/my-profile' }
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
          sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1201 }}
          onClick={toggleSidebar}
        >
          <ChevronLeftIcon />
        </IconButton>

       {/* Sidebar List */}
        <List sx={{ marginTop: '80px' }}>
          {selectedMenu.map((item, index) => (
            <ListItem
              key={index}
              component={RouterLink}
              to={item.path}
              sx={{ cursor: 'pointer' }}
              onClick={handleMenuItemClick} // Close sidebar when a menu item is clicked
            >
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Sidebar Toggle Button */}
      <IconButton
        sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1200 }}
        onClick={toggleSidebar}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
};

export default Sidebar;
