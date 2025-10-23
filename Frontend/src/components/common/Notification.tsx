import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type NotificationProps = {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  onClose: () => void;
};

const Notification: React.FC<NotificationProps> = ({ message, severity, onClose }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      onClose();  // Remove notification from context
    }, 5000); // Auto-close after 5s

    return () => clearTimeout(timer);
  }, [onClose]);


  return (
    <Snackbar open={open} autoHideDuration={5000} onClose={() => setOpen(false)}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
