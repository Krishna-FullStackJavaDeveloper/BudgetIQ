import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import wallet from "../../assets/wallet.png";
import coin from "../../assets/usd-coin.png";

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Simulate data loading and animate the progress from 0% to 100% over 1500ms
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100; // Ensure it stops at 100%
        }
        return prev + 100 / 15; // Progress increment per 100ms (1500ms / 15 intervals)
      });
    }, 100); // Update every 100ms (1500ms / 15)

    // Simulate data loading completion after 1500ms
    setTimeout(() => {
      setDataLoaded(true);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Wallet and Coin Animation */}
      <Box sx={{ width: 120, height: 120, position: "relative" }}>
        {/* Wallet Image */}
        <Box
          component="img"
          src={wallet}// Replace with your wallet image path
          alt="Wallet"
          sx={{
            width: "100%",
            height: "auto",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />

        {/* Coin Image */}
        <Box
          component="img"
          src={coin} // Replace with your coin image path
          alt="Coin"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40px", // Adjust the coin size
            height: "auto",
            animation: `rotateCoin ${1.5}s infinite linear`,
          }}
        />

        {/* Progress Fill Animation */}
        <Box
          // sx={{
          //   position: "absolute",
          //   top: "25%",
          //   left: "5%",
          //   width: `${(progress / 100) * 90}%`,
          //   height: "50%",
          //   backgroundColor: "#3f51b5",
          //   transition: "width 0.1s linear",
          //   borderRadius: "5px",
          // }}
        />

        {/* Progress Percentage Text */}
        <Box
          sx={{
            position: "absolute",
            top: "75%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "18px",
            color: "#2C3E50",
            fontWeight: "bold",
          }}
        >
          {progress.toFixed(0)}%
        </Box>
      </Box>
      {/* Animation keyframes */}
      <style>
        {`
          @keyframes rotateCoin {
            0% {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            100% {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `}
      </style>

      {/* Content displayed after the loader completes */}
      {dataLoaded && (
        <Box sx={{ marginTop: 3 }}>
          <h2>Your Data is Loaded!</h2>
          <p>Now you can display your app's content here.</p>
        </Box>
      )}
    </Box>
  );
};

export default Loader;
