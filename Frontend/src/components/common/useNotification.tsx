import { useState } from "react";
import { Snackbar, SnackbarContent } from "@mui/material";

export const useNotification = () => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [open, setOpen] = useState(false);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' | 'warning') => {
    // console.log('Notification triggered:', { msg, type });
    setMessage(msg);
    setSeverity(type);
    setOpen(true);  // Ensure the snackbar is opened
    // console.log('Notification state after update:', { message: msg, open: true });
  };

  const handleClose = () => {
    setOpen(false);
  };


  const NotificationComponent = () => {
    // console.log('NotificationComponent rendered');
    return (
      <Snackbar open={open} autoHideDuration={10000} onClose={handleClose}>
        <SnackbarContent message={message} 
        style={{
          backgroundColor: severity === 'success' ? 'green' : severity === 'error' ? 'red' : severity === 'info' ? 'blue' : 'orange',
        }}
        />
        {/* style={{ backgroundColor: severity === 'success' ? 'red' : severity === 'error' ? 'green' : 'blue' }}  */}
      </Snackbar>
    );
  };

  return { showNotification, NotificationComponent };
};
