import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  useTheme,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../common/NotificationProvider";
import BudgetIQIcon from "../../assets/9.png";
import { formatNotificationTime } from "../../hooks/formatNotificationTime";

const Header: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, handleLogout, roles } = useAuth();
  const { notifications, removeNotification } = useNotification();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleNotificationClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (isAuthenticated && roles?.length) {
      const role = roles[0]?.replace("ROLE_", "").toLowerCase();
      navigate(`/${role}-dashboard`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: "100%",
          top: 0,
          background: "linear-gradient(135deg, #6a11cb, #2575fc, #6a11cb)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo + Title */}
          <Box
            onClick={handleLogoClick}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
              marginLeft: isAuthenticated ? "44px" : 0,
            }}
          >
            <Box
              component="img"
              src={BudgetIQIcon}
              alt="BudgetIQ"
              sx={{ height: 40, width: 40, mr: 1 }}
            />

            <Box
              sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.3rem", // Slightly larger
                  letterSpacing: "0.5px",
                }}
              >
                BudgetIQ
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 300,
                  fontSize: "0.75rem", // Smaller for slogan
                  color: "#f0f0f0", // Slightly softer
                }}
              >
                Your Best Friend for Better Saving
              </Typography>
            </Box>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {isAuthenticated && (
              <>
                {/* Notification */}
                <IconButton color="inherit" onClick={handleNotificationClick}>
                  <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* Notification Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleNotificationClose}
                >
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <MenuItem
                        key={index}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 0.3,
                          minWidth: "280px",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                notification.severity === "error"
                                  ? "red"
                                  : notification.severity === "warning"
                                  ? "orange"
                                  : "green",
                              flexGrow: 1,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => removeNotification(index)}
                          >
                            ✖
                          </IconButton>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#888", fontSize: "0.7rem" }}
                        >
                          {formatNotificationTime(
                            new Date(notification.timestamp)
                          )}
                        </Typography>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No new notifications</MenuItem>
                  )}
                </Menu>
              </>
            )}

            {isAuthenticated ? (
              <Button
                color="inherit"
                onClick={handleLogoutClick}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: "1rem",
                  px: 2,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: "1rem",
                    px: 2,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/signup"
                  color="inherit"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: "1rem",
                    px: 2,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page Content Padding */}
      <div style={{ paddingTop: "80px" }} />
    </>
  );
};

export default Header;
