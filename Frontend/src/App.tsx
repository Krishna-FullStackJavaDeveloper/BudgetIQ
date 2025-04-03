import React from "react";
import { CssBaseline } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/layout/MainLayout"; // Import the new MainLayout
// Import the custom notification hook
import { useAuth } from "./hooks/useAuth";
import Header from "./components/layout/Header";
import { NotificationProvider } from "./components/common/NotificationProvider";


const App: React.FC = () => {
 // Initialize the notification hook with default values

 const { user } = useAuth(); 
 
  return (
    <>
     <NotificationProvider>
     <CssBaseline /> {/* Material UI baseline styles */}
      <MainLayout>
        <AppRoutes /> {/* Routing for the app */}
      </MainLayout>
     </NotificationProvider>
      
      
    </>
  );
};

export default App;