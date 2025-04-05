import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Authentications/Login";
import VerifyOtp from "../pages/Authentications/VerifyOtp";
import Dashboard from "../pages/Dashboards/Dashboard";
import AdminDashboard from "../pages/Dashboards/AdminDashboard";
import UserDashboard from "../pages/Dashboards/UserDashboard";
import LandingPage from "../components/layout/LandingPage";
import Signup from "../pages/Authentications/Signup";
import ModeratorDashboard from "../pages/Dashboards/ModeratorDashboar";
import Profile from "../pages/UserProfile/Profile";
import UserOrg from "../pages/UserProfile/ManageUser";
import ManageUserTest from "../pages/UserProfile/manageUserTest";
import ForgotPassword from "../pages/Authentications/ForgotPassword";
import ResetPassword from "../pages/Authentications/ResetPassword";
import AddCashPage from "../pages/BudgetManagement/AddCashPage";

const AppRoutes = () => {
  return (
      <Routes>
        <Route path="*" element={<h2 className="text-center text-red-500">404 - Page Not Found</h2>} />
      {/* Auth  */}
        <Route path="/login" element={<Login />} /> {/* Update path to "/login" */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      {/* landing page */}
        <Route path="/" element={<LandingPage />} />

      {/* User Profilepage */}
      <Route path="/edit-user/:userId" element={<Profile />} />
      <Route path="/manage-users" element={<UserOrg />} />
      <Route path="/manage-users-test" element={<ManageUserTest />} />
      <Route path="/create_user" element={<Signup />} />

      {/* Budget Management pages */}
      <Route path="/add_cash" element={<AddCashPage />} />
      </Routes>
  );
};

export default AppRoutes;
