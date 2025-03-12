// src/components/layout/MainLayout.tsx
import React, { ReactNode, useState } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import WatermarkIcon from "../../assets/8.png";
import "../../styles/landing.css";
import { useAuth } from '../../hooks/useAuth';

interface MainLayoutProps {
    children: ReactNode;
  }

  const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar visibility

    // Get authentication state from useAuth hook
  const { isAuthenticated, roles } = useAuth();
  const userRoles = roles || [];
  
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
         <Sidebar open={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isAuthenticated={isAuthenticated} roles={userRoles}  />
        <Box
          sx={{
            flexGrow: 1,
            transition: 'margin-left 0.3s', // Smooth transition when sidebar opens
            marginLeft: { xs: '0', sm: sidebarOpen ? '200px' : '0' }, // Adjust layout based on sidebar state
            paddingLeft: { xs: '0', sm: sidebarOpen ? '0px' : '0' },  // Padding for larger screens
            // background: 'url("../../assets/8.png") center/contain no-repeat', // Add watermark
                    // backgroundColor: '#f4f4f4', // Light background color for better visibility
            //         opacity: 0.9, // Adjust transparency for a subtle effect
      
          }}
        >
            <img src={WatermarkIcon} alt="Watermark" className="watermark-icon" />
          <Header />
          <Container maxWidth="lg" sx={{ padding: 2 }}>
            {children}
          </Container>
          <Footer />
        </Box>
      </Box>
    );
  };

export default MainLayout;
