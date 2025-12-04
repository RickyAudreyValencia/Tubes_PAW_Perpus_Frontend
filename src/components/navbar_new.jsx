import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  const { user, token, role, clearCredentials } = useAuth()
  const isAuthenticated = !!token
  const userRole = role
  const isPetugas = userRole === 'petugas'

  const homePath = '/'
  
  const confirmAndLogout = async () => {
    setIsConfirmingLogout(false)
    try { await clearCredentials() } catch(e) { console.warn('clearCredentials failed', e) }
    navigate('/login')
  }

  const handleLogout = () => {
    setIsConfirmingLogout(true)
  }

  return (
    <header className="library-navbar">
      <div className="container nav-inner">
        <Link className="navbar-brand" to={homePath}> 
          <span className="brand-logo" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          {isAuthenticated ? (
            <>
              {/* Tautan Home */}
              {!isPetugas && (
                <NavLink to={homePath} className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  Home
                </NavLink>
              )}

              {/* Tautan Library (hanya untuk anggota) */}
              {!isPetugas && (
                <NavLink to="/library" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  Library
                </NavLink>
              )}

              {/* Dashboard for anggota */}
              {!isPetugas && (
                <NavLink to="/anggota/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                  Dashboard
                </NavLink>
              )}

              {/* Petugas menu */}
              {isPetugas && (
                <>
                  <NavLink to="/petugas/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Laporan
                  </NavLink>
                  <NavLink to="/petugas/books" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Data Buku
                  </NavLink>
                  <NavLink to="/petugas/loans" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                    Peminjaman
                  </NavLink>
                </>
              )}

              {/* Profile and Logout */}
              <div style={{display: 'flex', alignItems: 'center', gap: 4, marginLeft: '-4px'}}>
                <div 
                  className="nav-profile-icon clickable-profile" 
                  title={`Logged in as ${userRole || 'User'}`}
                  onClick={() => {
                    if (isPetugas) navigate('/petugas/profile')
                    if (userRole === 'anggota') navigate('/anggota/profile')
                  }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', color: 'var(--library-accent)'}}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div style={{ marginLeft: 0, fontSize: 13, display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.9)' }}>
                  {user?.nama || user?.name || 'User'}
                </div>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="nav-link btn-logout" 
                style={{ cursor: 'pointer', background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: 8 }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to={homePath} className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
                Home
              </NavLink>
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
     
      {isConfirmingLogout && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsConfirmingLogout(false)}>
          <div className="modal-content" style={{maxWidth: 350, textAlign: 'center'}} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsConfirmingLogout(false)}>✕</button>
            <h4 style={{marginBottom: 10, marginTop: 10}}>Konfirmasi Logout</h4>
            <p className="text-muted" style={{marginBottom: 20}}>Apakah Anda yakin ingin keluar dari sesi ini?</p>
            <div style={{display: 'flex', justifyContent: 'space-around', gap: 10}}>
              <button className="btn btn-ghost" onClick={() => setIsConfirmingLogout(false)} style={{flexGrow: 1}}>Tidak</button>
              <button className="primary-cta" onClick={confirmAndLogout} style={{flexGrow: 1}}>Ya, Logout</button>
            </div>
          </div>
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
              color: var(--library-accent);
              cursor: pointer;
              transition: background-color 0.2s;
            }
            .nav-profile-icon:hover {
              background-color: rgba(0, 123, 255, 0.1);
            }
          `}</style>
        </div>
      )}
    </header>
  )
}
