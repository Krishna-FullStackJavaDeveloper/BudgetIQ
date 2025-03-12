import React from "react";
import { Button, Typography, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation
import "../../styles/landing.css"; // Importing custom styles
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
     <div className="header">
        <div className="icon-container">
          <img src={BudgetIQIcon} alt="BudgetIQ Icon" className="app-icon" />
        </div>
        <div className="text-container">
          <Typography variant="h3" className="app-name">BudgetIQ</Typography>
          <Typography variant="h5" className="tagline">Your Best Friend for Better Saving.</Typography>
        </div>
      </div>

 {/* Add watermark icon */}
 <img src={WatermarkIcon} alt="Watermark" className="watermark-icon" />
 
      <div className="cta-section">
      <hr className="divider" /> {/* Thin white line between header and cta section */}
        <Typography variant="h6" className="cta-text" style={{ marginBottom: "5%" }}>
          Create an account or logIn to try the web app for free!
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained" className="cta-button login-btn" component={Link} to="/login">
              Login
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" className="cta-button login-btn" component={Link} to="/signup">
              Register
            </Button>
          </Grid>
        </Grid>
      </div>

      <div className="features">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={security} alt="Security Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">2FA for Security</Typography>
              <Typography className="feature-description">
                Ensure your account is always secure with two-factor authentication.
              </Typography>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={Email} alt="Email Notification Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">Email Notification</Typography>
              <Typography className="feature-description">
                Stay updated with important email notifications about your budget status.
              </Typography>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={Graphically} alt="Graphical Explanation Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">Explain Graphically</Typography>
              <Typography className="feature-description">
                Visualize your financial data with easy-to-understand graphical charts.
              </Typography>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={Excel} alt="Export Excel Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">Export Excel</Typography>
              <Typography className="feature-description">
                Export your budget data easily to Excel for offline management.
              </Typography>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={Budget} alt="Family Budgeting Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">Manage Budget Family-Wise</Typography>
              <Typography className="feature-description">
                Organize budgets across family members with a single admin user.
              </Typography>
              </div>
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <div className="feature-item">
              <img src={Summary} alt="Summary Filters Icon" className="feature-icon" />
              <div className="feature-text">
              <Typography variant="h6" className="feature-title">Filters for Summary</Typography>
              <Typography className="feature-description">
                Filter your budget summary by date, daily, monthly, or weekly.
              </Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default LandingPage;
