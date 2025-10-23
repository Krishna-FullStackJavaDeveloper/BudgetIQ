import React from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";
import BudgetIQIcon from "../../assets/9.png";
import security from "../../assets/1.png";
import Email from "../../assets/3.png";
import Graphically from "../../assets/4.png";
import Excel from "../../assets/7.png";
import Budget from "../../assets/6.png";
import Summary from "../../assets/5.png";
import WatermarkIcon from "../../assets/8.png";

const LandingPage = () => {
  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0066cc",
          padding: "20px",
          borderTopLeftRadius: "40px",
          borderTopRightRadius: "40px",
          height: 150,
          position: "relative",
          color: "white",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "15px",
          }}
        >
          <Box
            component="img"
            src={BudgetIQIcon}
            alt="BudgetIQ Icon"
            sx={{
              width: 100,
              height: "auto",
              transform: "scale(1.5)",
              transition: "transform 0.3s ease-in-out",
              mt: 6.25, // 50px roughly
              mr: 6.25, // 50px roughly
            }}
          />
        </Box>

        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 600, mt: 2.5, fontSize: { xs: "2.5rem", sm: "3.125rem" } }}
          >
            BudgetIQ
          </Typography>
          <Typography
            variant="h5"
            sx={{ mt: 1.25, fontSize: { xs: "1rem", sm: "1.0625rem" } }}
          >
            Your Best Friend for Better Saving.
          </Typography>
        </Box>
      </Box>

      {/* Watermark */}
      <Box
        component="img"
        src={WatermarkIcon}
        alt="Watermark"
        sx={{
          position: "fixed",
          bottom: -1,
          left: 1,
          width: "20%",
          opacity: 0.2,
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: "#0066cc",
          color: "white",
          textAlign: "center",
          padding: "30px 20px",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
        }}
      >
        <Box
          component="hr"
          sx={{
            border: "none",
            height: 1,
            backgroundColor: "white",
            margin: "20px auto",
            width: "80%",
            opacity: 1,
          }}
        />

        <Typography variant="h6" sx={{ mb: 5, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Get started now — create an account or log in to keep your wallet chill and your budget thrill!
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "40px",
                px: 6,
                py: 1.5,
                color: "#004080",
                backgroundColor: "white",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  backgroundColor: "#004080",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Login
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to="/signup"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "40px",
                px: 6,
                py: 1.5,
                color: "#004080",
                backgroundColor: "white",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  backgroundColor: "#004080",
                  color: "white",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ p: { xs: 3, sm: 6 }, backgroundColor: "#fefefe" }}>
        <Grid container spacing={3}>
          {[
            {
              icon: security,
              title: "2FA for Security",
              description:
                "Ensure your account is always secure with two-factor authentication.",
            },
            {
              icon: Email,
              title: "Email Notification",
              description:
                "Stay updated with important email notifications about your budget status.",
            },
            {
              icon: Graphically,
              title: "Explain Graphically",
              description:
                "Visualize your financial data with easy-to-understand graphical charts.",
            },
            {
              icon: Excel,
              title: "Export Excel",
              description:
                "Export your budget data easily to Excel for offline management.",
            },
            {
              icon: Budget,
              title: "Manage Budget Family-Wise",
              description:
                "Organize budgets across family members with a single admin user.",
            },
            {
              icon: Summary,
              title: "Filters for Summary",
              description:
                "Filter your budget summary by date, daily, monthly, or weekly.",
            },
          ].map(({ icon, title, description }) => (
            <Grid item xs={12} md={6} key={title}>
              <Box
                sx={{
                  bgcolor: "white",
                  p: 3,
                  borderRadius: 2,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2.5,
                  transition: "transform 0.3s ease-in-out",
                  cursor: "default",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={icon}
                  alt={`${title} Icon`}
                  sx={{ width: 100, flexShrink: 0 }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 500, color: "#333", mb: 0.5 }}
                  >
                    {title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#777" }}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default LandingPage;
