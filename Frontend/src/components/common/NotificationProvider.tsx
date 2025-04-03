import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Notification from "./Notification"; // Import Notification component

// Define the notification type
type NotificationType = {
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

// Context type definition
type NotificationContextType = {
  notifications: NotificationType[];
  showNotification: (message: string, severity: "success" | "error" | "warning" | "info") => void;
  removeNotification: (index: number) => void;
};

// Create the Notification Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Use useCallback to prevent re-creating the functions on every render
  const showNotification = useCallback((message: string, severity: "success" | "error" | "warning" | "info") => {
    setNotifications((prev) => [...prev, { message, severity }]);
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
      {/* Render notifications and pass removeNotification */}
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          message={notification.message}
          severity={notification.severity}
          onClose={() => removeNotification(index)} // Close the notification
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider");
  return context;
};
