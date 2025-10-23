import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import ReportIcon from "@mui/icons-material/Report";
import PersonIcon from "@mui/icons-material/Person";
import AddCardIcon from "@mui/icons-material/AddCard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CategoryIcon from "@mui/icons-material/Category";
import EmojiEventsTwoToneIcon from "@mui/icons-material/EmojiEventsTwoTone";

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
  section?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  toggleSidebar,
  isAuthenticated,
  roles,
}) => {
  if (!isAuthenticated || !roles) return null;

  const userId = localStorage.getItem("user") || "";

  // Define menu items with optional sections for grouping
  const menuItems: Record<string, MenuItem[]> = {
    admin: [
      {
        label: "Income",
        path: "/add_cash",
        icon: <AddCardIcon />,
        section: "Tracking",
      },
      {
        label: "Expense",
        path: "/add_Expense",
        icon: <LocalAtmIcon />,
        section: "Tracking",
      },
      {
        label: "Category",
        path: "/add_Category",
        icon: <CategoryIcon />,
        section: "Tracking",
      },
      {
        label: "Goal Tracker",
        path: "/savingGoals",
        icon: <EmojiEventsTwoToneIcon />,
        section: "Goals",
      },
      {
        label: "Recurring Transaction",
        path: "/recurring_transaction",
        icon: <LocalAtmIcon />,
        section: "Transactions",
      },
      {
        label: "Manage Users",
        path: "/manage-users",
        icon: <PeopleIcon />,
        section: "Administration",
      },
      {
        label: "Reports",
        path: "/report",
        // manage-users-test",
        icon: <ReportIcon />,
        section: "Administration",
      },
      {
        label: "My Profile",
        path: `/edit-user/${userId}`,
        icon: <PersonIcon />,
        section: "User",
      },
    ],
    moderator: [
      {
        label: "Income",
        path: "/add_cash",
        icon: <AddCardIcon />,
        section: "Tracking",
      },
      {
        label: "Expense",
        path: "/add_Expense",
        icon: <LocalAtmIcon />,
        section: "Tracking",
      },
      {
        label: "Category",
        path: "/add_Category",
        icon: <CategoryIcon />,
        section: "Tracking",
      },
      {
        label: "Goal Tracker",
        path: "/savingGoals",
        icon: <EmojiEventsTwoToneIcon />,
        section: "Goals",
      },
      {
        label: "Manage Users",
        path: "/manage-users",
        icon: <PeopleIcon />,
        section: "Administration",
      },
      {
        label: "Reports",
        path: "/report",
        icon: <ReportIcon />,
        section: "Administration",
      },
      {
        label: "Recurring Transaction",
        path: "/recurring_transaction",
        icon: <LocalAtmIcon />,
        section: "Transactions",
      },
      {
        label: "My Profile",
        path: `/edit-user/${userId}`,
        icon: <PersonIcon />,
        section: "User",
      },
    ],
    user: [
      {
        label: "Income",
        path: "/add_cash",
        icon: <AddCardIcon />,
        section: "Tracking",
      },
      {
        label: "Expense",
        path: "/add_Expense",
        icon: <LocalAtmIcon />,
        section: "Tracking",
      },
      {
        label: "Category",
        path: "/add_Category",
        icon: <CategoryIcon />,
        section: "Tracking",
      },
      {
        label: "Goal Tracker",
        path: "/savingGoals",
        icon: <EmojiEventsTwoToneIcon />,
        section: "Goals",
      },
      {
        label: "Recurring Transaction",
        path: "/recurring_transaction",
        icon: <LocalAtmIcon />,
        section: "Transactions",
      },
      {
        label: "Reports",
        path: "/report",
        icon: <ReportIcon />,
        section: "Reports",
      },
      {
        label: "Settings",
        path: "/settings",
        icon: <SettingsIcon />,
        section: "User",
      },
      {
        label: "Profile",
        path: `/edit-user/${userId}`,
        icon: <PersonIcon />,
        section: "User",
      },
    ],
  };

  // Combine and deduplicate menu items if user has multiple roles
  const combinedMenu: MenuItem[] = [];

  roles.forEach((role) => {
    const cleanRole = role.replace("ROLE_", "").toLowerCase();
    const items = menuItems[cleanRole];
    if (items) {
      items.forEach((item) => {
        if (!combinedMenu.some((mi) => mi.label === item.label)) {
          combinedMenu.push(item);
        }
      });
    }
  });

  // Group items by their section for rendering
  const groupedMenu = combinedMenu.reduce((acc, item) => {
    if (!acc[item.section || ""]) acc[item.section || ""] = [];
    acc[item.section || ""].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleMenuItemClick = () => {
    toggleSidebar();
  };

  const getDashboardPath = () => {
    if (!roles) return "/";
    const role = roles
      .find((r) => r.includes("ROLE_"))
      ?.replace("ROLE_", "")
      .toLowerCase();
    switch (role) {
      case "admin":
        return "/admin-dashboard";
      case "moderator":
        return "/moderator-dashboard";
      case "user":
        return "/user-dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleSidebar}
        sx={{
          width: 260,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            backgroundColor: "#fff",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e0e0e0",
            position: "relative",
            minHeight: 64,
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            sx={{
              color: "#555",
              mr: 2,
              transition: "background-color 0.2s",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
            aria-label="close sidebar"
          ></IconButton>
          <Box
            component={RouterLink}
            to={getDashboardPath()}
            onClick={toggleSidebar}
            sx={{
              textDecoration: "none",
              color: "#0077b6",
              fontWeight: "700",
              fontSize: "24px",
              flexGrow: 1,
              ml: 3,
              userSelect: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            BudgetIQ
          </Box>
        </Box>

        {/* Menu sections */}
        <Box sx={{ mt: 2, overflowY: "auto", flexGrow: 1 }}>
          {Object.entries(groupedMenu).map(([section, items], idx) => (
            <Box key={section || idx} sx={{ mb: 3 }}>
              {/* Section heading, skip if no section name */}
              {section && section.trim() !== "" && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    px: 3,
                    mb: 1,
                    color: "#666",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
                >
                  {section}
                </Typography>
              )}

              <List disablePadding>
                {items.map((item, i) => (
                  <ListItem
                    component={RouterLink}
                    to={item.path}
                    key={item.label}
                    onClick={handleMenuItemClick}
                    sx={{
                      cursor: "pointer",
                      px: 3,
                      py: 1.25,
                      color: "#333",
                      borderRadius: 1,
                      transition: "background-color 0.2s, color 0.2s",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      "&:hover": {
                        backgroundColor: "#e1f5fe",
                        color: "#0277bd",
                        "& .MuiListItemIcon-root": {
                          color: "#0277bd",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ color: "#666", minWidth: 36 }}
                      children={item.icon}
                    />
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: 14,
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* Divider between sections */}
              {idx < Object.entries(groupedMenu).length - 1 && (
                <Divider sx={{ mx: 3, mt: 1, mb: 2 }} />
              )}
            </Box>
          ))}
        </Box>
      </Drawer>

      {/* Sidebar toggle button */}
      <IconButton
        onClick={toggleSidebar}
        sx={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 1300,
          backgroundColor: "transparent",
          color: "#ffffff", // bright white stands out over your header gradient
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.15)", // soft white hover background
          },
          boxShadow: "none",
        }}
        aria-label="open sidebar"
      >
        <MenuIcon />
      </IconButton>
    </>
  );
};

export default Sidebar;
