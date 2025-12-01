import React, { useState, useMemo } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom' // Import useNavigate
import { logout } from '../services/api'; // Import fungsi logout

// --- Helper Hook untuk Cek Status Login Global dan Role ---
const useAuthStatus = () => {
    // Mengecek keberadaan token di storage
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    // MENGAMBIL PERAN DARI STORAGE (Disimpan saat login di Login.jsx)
    const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role'); 
    
    return {
        isAuthenticated: !!token,
        userRole: role, // 'petugas', 'anggota', atau null
    };
}

export default function NavBar() {
  const [open, setOpen] = useState(false)
  // STATE BARU: Mengelola tampilan modal konfirmasi
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false); 
  const location = useLocation()
  const navigate = useNavigate();
  
  // Dapatkan status otentikasi dan peran
  const { isAuthenticated, userRole } = useAuthStatus(); 
  const isPetugas = userRole === 'petugas'; 

  // Tentukan path Home Petugas
  const PETUGAS_HOME_PATH = '/petugas/dashboard'; 
  // 🎯 BARIS BARU: Tentukan path Home Anggota
  const ANGGOTA_HOME_PATH = '/anggota/dashboard'; 

  // Tentukan path home/dashboard yang sesuai berdasarkan peran
  const homePath = isPetugas 
    ? PETUGAS_HOME_PATH 
    : userRole === 'anggota' ? ANGGOTA_HOME_PATH : '/'; // <-- LOGIKA DIPERBARUI
  
  // Fungsi Logout yang sebenarnya (Dijalankan setelah konfirmasi "Ya")
  const confirmAndLogout = async () => {
    setIsConfirmingLogout(false); // Tutup modal
    await logout(); 
    console.log('User logged out. Redirecting to /login')
    navigate('/login'); 
  }

  // Fungsi yang dipanggil saat tombol Logout ditekan (Membuka Modal)
  const handleLogout = () => {
    setIsConfirmingLogout(true); 
  }

  // Fungsi baru untuk menavigasi ke halaman profil
  const handleProfileClick = () => {
      if (isPetugas) {
          // Navigasi ke halaman manajemen akun petugas
          navigate('/petugas/profile'); 
      }
      // Tambahkan logic untuk Anggota jika perlu, misalnya: 
      // else if (userRole === 'anggota') { navigate('/anggota/profile'); } 
  }


  return (
    <header className="library-navbar">
      <div className="container nav-inner">
        {/* 🎯 PERBAIKAN DI SINI: Menggunakan homePath untuk navigasi Brand/Logo */}
        <Link className="navbar-brand" to={homePath}> 
          <span className="brand-logo" aria-hidden="true">
            {/* ... Kode SVG Logo ... */}
            <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                 {/* ... SVG content ... */}
                 <defs>
                   <linearGradient id="bgGrad" x1="0" x2="1" y1="0" y2="1">
                     <stop offset="0%" stopColor="var(--library-accent)" />
                     <stop offset="100%" stopColor="var(--library-warm)" />
                   </linearGradient>
                   <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                     <feDropShadow dx="0" dy="5" stdDeviation="6" floodOpacity="0.15" />
                   </filter>
                 </defs>
                 <rect width="64" height="64" rx="14" fill="url(#bgGrad)" filter="url(#shadow)" />
                 {/* ... Book graphics ... */}
                 <g transform="translate(12,15)">
                   <path d="M0 5c6-2 14-2 22 0v20c-8-2-16-2-22 0V5z" fill="white" opacity="0.98" />
                   <path d="M20 5c6-2 14-2 22 0v20c-8-2-16-2-22 0V5z" fill="white" opacity="0.96" />
                   <rect x="20" y="4" width="4" height="22" fill="#fef7d1" opacity="0.7" />
                   <path d="M22 4h6v14l-3 -2l-3 2z" fill="#ffcf6f" opacity="0.95" />
                 </g>
            </svg>
          </span>

          <span className="brand-text">Perpustakaan</span>
        </Link>

        {/* ... Nav Toggle Button ... */}

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          
          {/* Tautan Home: Target path berdasarkan role */}
          <NavLink to={homePath} className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
            Home
          </NavLink>

          {isAuthenticated ? (
            // --- TAMPILAN JIKA SUDAH LOGIN ---
            <>
                {/* Tautan Library (Selalu tampil jika login) */}
                <NavLink to="/library" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Library
                </NavLink>

                {/* Data Buku tampil HANYA JIKA role adalah Petugas */}
                {isPetugas && (
                    <NavLink 
                        to="/petugas" // Rute Data Buku
                        className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}
                    >
                        Data Buku
                    </NavLink>
                )}

                {/* 🎯 LOGO PROFILE (Dapat Diklik) */}
                {isAuthenticated && (
                    <div 
                        className="nav-profile-icon clickable-profile" 
                        title={`Logged in as ${userRole || 'User'}`}
                        onClick={() => { 
                            if (isPetugas) { navigate('/petugas/profile'); }
                            // Jika Anggota (anggota) atau yang lain, bisa ditambahkan rute profil spesifik di sini
                            if (userRole === 'anggota') { navigate('/anggota/profile'); } 
                        }}
                    >
                        {/* Ikon User SVG sederhana */}
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', color: 'var(--library-accent)'}}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                )}
                
                {/* Tombol Logout (Memanggil handler untuk menampilkan modal) */}
                <button 
                    onClick={handleLogout} 
                    className="nav-link btn-register" 
                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', padding: 0 }}
                >
                    Logout
                </button>
            </>
          ) : (
            // --- TAMPILAN JIKA BELUM LOGIN ---
            <>
                {/* Tautan Library (Library Publik) */}
                <NavLink to="/library" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Library
                </NavLink>

                <NavLink to="/login" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Login
                </NavLink>
                <NavLink to="/register" className={({isActive}) => 'nav-link btn-register' + (isActive ? ' active' : '')}>
                    Register
                </NavLink>
            </>
          )}
        </nav>
      </div>
     
    {/* --- MODAL KONFIRMASI LOGOUT DITAMBAHKAN DI SINI --- */}
    {isConfirmingLogout && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsConfirmingLogout(false)}>
            <div className="modal-content" style={{maxWidth: 350, textAlign: 'center'}} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setIsConfirmingLogout(false)}>✕</button>
                <h4 style={{marginBottom: 10, marginTop: 10}}>Konfirmasi Logout</h4>
                <p className="text-muted" style={{marginBottom: 20}}>
                    Apakah Anda yakin ingin keluar dari sesi ini?
                </p>
                <div style={{display: 'flex', justifyContent: 'space-around', gap: 10}}>
                    <button 
                        className="btn btn-ghost" 
                        onClick={() => setIsConfirmingLogout(false)} 
                        style={{flexGrow: 1}}
                    >
                        Tidak
                    </button>
                    <button 
                        className="primary-cta" 
                        onClick={confirmAndLogout} 
                        style={{flexGrow: 1}}
                    >
                        Ya, Logout
                    </button>
                </div>
            </div>
             {/* Styling dasar untuk Modal Konfirmasi (Tambahkan di CSS Anda) */}
             <style jsx="true">{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    position: relative;
                }
                .modal-close {
                    position: absolute;
                    top: 10px; right: 10px;
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #aaa;
                }
                .primary-cta {
                    background-color: var(--library-accent, #007bff);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .btn-ghost {
                    background-color: #f0f0f0;
                    color: #333;
                    border: 1px solid #ccc;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .nav-profile-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 10px;
                    border-radius: 8px;
                    margin-right: 5px; /* Memberi jarak ke tombol Logout */
                    color: var(--library-accent);
                    cursor: pointer; /* Diubah menjadi pointer */
                    transition: background-color 0.2s;
                }
                .nav-profile-icon:hover {
                    background-color: rgba(0, 123, 255, 0.1); /* Efek hover ringan */
                }
             `}</style>
        </div>
    )}
    </header>
  )
}