import React from "react";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/layout/MainLayout"; // Import the new MainLayout
import { useNotification } from './components/common/useNotification'; // Import the custom notification hook
import { useAuth } from "./hooks/useAuth";


const App: React.FC = () => {
 // Initialize the notification hook with default values
 const { showNotification, NotificationComponent } = useNotification();  // Pass default arguments if needed
 const { user } = useAuth(); 
 
  return (
    <>
      <CssBaseline /> {/* Material UI baseline styles */}
      <MainLayout>
        <AppRoutes /> {/* Routing for the app */}
      </MainLayout>
      <NotificationComponent /> {/* Global notification component */}
    </>
  );
};

export default App;