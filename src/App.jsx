import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Komponen Layout & Navigasi ---
import NavBar from './components/navbar';
import './App.css'; // Pastikan CSS Anda diimpor

// --- Komponen Halaman Publik & Dasar ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Library from './pages/Library';

// --- Komponen Anggota ---
// 🎯 BARIS PERBAIKAN 1: Import AnggotaDashboard dengan penulisan yang benar


// --- Komponen Petugas ---
import PetugasPage from './pages/petugasPage'; 
import ManajemenPetugasPage from './pages/ManajemenPetugasPage'; // CRUD Petugas/Admin

// 1. Definisikan komponen PetugasDashboard (Seperti permintaan awal Anda, ini me-render Home)
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
    
 
      
        {/* Rute Petugas */}
        <Route path="/petugas" element={<PetugasPage />} /> {/* Rute Data Buku */}
        <Route path="/petugas/dashboard" element={<PetugasDashboard />} /> {/* Rute HOME Petugas */}
        
        {/* Rute PROFILE/CRUD Petugas */}
        <Route path="/petugas/profile" element={<ManajemenPetugasPage />} /> 
        
      </Routes>
    </BrowserRouter>
  )
}