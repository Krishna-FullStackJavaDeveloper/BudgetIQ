import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import wallet from "../../assets/wallet.png";
import coin from "../../assets/usd-coin.png";

const Loader = () => {
  const [progress, setProgress] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const duration = 500; // Faster load duration
    const steps = 10; // 10 updates
    const intervalTime = duration / steps; // 50ms intervals
    const increment = 100 / steps;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    setTimeout(() => {
      setDataLoaded(true);
    }, duration);

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
      <Box sx={{ width: 120, height: 120, position: "relative" }}>
        <Box
          component="img"
          src={wallet}
          alt="Wallet"
          sx={{
            width: "100%",
            height: "auto",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <Box
          component="img"
          src={coin}
          alt="Coin"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40px",
            height: "auto",
            animation: `rotateCoin 0.5s infinite linear`,
          }}
        />
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

      {/* {dataLoaded && (
        <Box sx={{ marginTop: 3 }}>
          <h2>Your Data is Loaded!</h2>
          <p>Now you can display your app's content here.</p>
        </Box>
      )} */}
    </Box>
  );
};

export default Loader;
