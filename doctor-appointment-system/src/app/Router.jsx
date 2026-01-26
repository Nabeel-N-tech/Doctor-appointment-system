import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

// Layout
import Layout from "../components/layout/Layout";

// Patient
import PatientDashboard from "../roles/patient/PatientDashboard";
import BookAppointment from "../roles/patient/BookAppointment";
import AppointmentHistory from "../roles/patient/AppointmentHistory";
import LabReports from "../roles/patient/LabReports";
import Profile from "../pages/Profile";

import AiInsights from "../roles/doctor/AiInsights";

// Doctor
import DoctorDashboard from "../roles/doctor/DoctorDashboard";
import Schedule from "../roles/doctor/Schedule";
import Availability from "../roles/doctor/Availability";
import DoctorPatientDetails from "../roles/doctor/DoctorPatientDetails";

// Admin
import AdminDashboard from "../roles/admin/AdminDashboard";
import ManageUsers from "../roles/admin/ManageUsers";
import AddUser from "../roles/admin/AddUser";
import UserDetails from "../roles/admin/UserDetails";
import AppointmentsOversight from "../roles/admin/AppointmentsOversight";

// Staff
import StaffDashboard from "../roles/staff/StaffDashboard";
import CreateLabReport from "../roles/staff/CreateLabReport";

export default function Router() {
  const { user } = useAuth();


  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // 🚫 Not logged in
  if (user === null) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }


  console.log("Current User Role:", user?.role);

  // Admin routes
  if (user.role && user.role.trim().toLowerCase() === "admin") {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/:userId" element={<UserDetails />} />
          <Route path="/appointments" element={<AppointmentsOversight />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  // 🩺 Doctor routes
  if (user.role && user.role.trim().toLowerCase() === "doctor") {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DoctorDashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/ai-insights" element={<AiInsights />} />
          <Route path="/patient/:id" element={<DoctorPatientDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }


  // 🏥 Staff routes
  if (user.role && user.role.trim().toLowerCase() === "staff") {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<StaffDashboard />} />
          <Route path="/create-report" element={<CreateLabReport />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  // 🧑‍⚕️ Patient routes (default)
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PatientDashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/history" element={<AppointmentHistory />} />
        <Route path="/lab-reports" element={<LabReports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
