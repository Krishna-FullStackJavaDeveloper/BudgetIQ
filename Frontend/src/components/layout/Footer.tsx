// src/components/layout/Footer.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        padding: '10px',
        background: 'linear-gradient(135deg, #6a11cb, #2575fc)', // Purple to blu
        color: 'white',
        position: 'fixed',
        bottom: 0,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">&copy; {new Date().getFullYear()} Krishna Bhatt - All rights reserved. </Typography>
    </Box>
  );
};

export default Footer;
