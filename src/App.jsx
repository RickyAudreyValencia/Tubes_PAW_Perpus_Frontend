import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Komponen Layout & Navigasi ---
import NavBar from './components/navbar';
import './App.css'; 

// --- Komponen Halaman Publik & Dasar ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';

// --- Komponen Petugas ---
import PetugasPage from './pages/petugasPage'; 
import ManajemenPetugasPage from './pages/ManajemenPetugasPage';

// Helper component untuk dashboard petugas (sesuai kode Anda)
const PetugasDashboard = () => <Home />; 

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Rute Publik & Dasar */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/library" element={<Library />} />
    
        {/* --- PERBAIKAN DISINI: Rute Anggota --- */}
        {/* Kita arahkan /anggota/dashboard agar membuka komponen Home */}
        <Route path="/anggota/dashboard" element={<Home />} />

        {/* Rute Petugas */}
        <Route path="/petugas" element={<PetugasPage />} />
        <Route path="/petugas/dashboard" element={<PetugasDashboard />} />
        <Route path="/petugas/profile" element={<ManajemenPetugasPage />} /> 
        
      </Routes>
    </BrowserRouter>
  )
}