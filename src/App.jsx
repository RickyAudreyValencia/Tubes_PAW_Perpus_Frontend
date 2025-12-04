import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'

// --- Komponen Layout & Navigasi ---
import NavBar from './components/navbar';
import './App.css'; 

// --- Komponen Halaman Publik & Dasar ---
import Home from './pages/Home';
import Login from './pages/LoginNew';
import Register from './pages/Register';
import Library from './pages/Library';

// Member & Officer pages
import MemberDashboard from './pages/member/Dashboard';
import MemberProfile from './pages/member/Profile';

import OfficerDashboard from './pages/officer/Dashboard';
import ManageBooks from './pages/officer/ManageBooks';
import ManageLoans from './pages/officer/ManageLoans';
import OfficerProfile from './pages/officer/Profile';
import OfficerReports from './pages/officer/Reports';

// (petugas dashboard implemented in ./pages/officer/Dashboard.jsx)

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Rute Publik & Dasar */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/library" element={<Library />} />
    
        {/* Rute Anggota */}
        <Route path="/anggota/dashboard" element={<ProtectedRoute allowedRoles={["anggota"]}><MemberDashboard /></ProtectedRoute>} />
        <Route path="/anggota/profile" element={<ProtectedRoute allowedRoles={["anggota"]}><MemberProfile /></ProtectedRoute>} />

        {/* Rute Petugas */}
        <Route path="/petugas" element={<Navigate to="/petugas/dashboard" replace />} />
        <Route path="/petugas/dashboard" element={<ProtectedRoute allowedRoles={["petugas"]}><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/petugas/books" element={<ProtectedRoute allowedRoles={["petugas"]}><ManageBooks /></ProtectedRoute>} />
        <Route path="/petugas/loans" element={<ProtectedRoute allowedRoles={["petugas"]}><ManageLoans /></ProtectedRoute>} />
        <Route path="/petugas/reports" element={<ProtectedRoute allowedRoles={["petugas"]}><OfficerReports /></ProtectedRoute>} />
        <Route path="/petugas/profile" element={<ProtectedRoute allowedRoles={["petugas"]}><OfficerProfile /></ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}