// File: src/pages/PetugasDashboard.jsx

import React from 'react';
import Home from './Home'; // Import komponen Home publik yang ingin Anda tampilkan

// Komponen ini akan melayani rute /petugas/dashboard
export default function PetugasDashboard() {
    // Karena Petugas sudah login, tampilan ini akan terlihat sama 
    // dengan Home publik, tetapi navigasi dan sesi loginnya akan tetap terjaga.
    return (
        <Home />
    );
}