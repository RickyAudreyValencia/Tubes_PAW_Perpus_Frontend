import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="library-navbar">
      <div className="container nav-inner">
        <Link className="navbar-brand" to="/">
          <span className="brand-logo" aria-hidden="true">
            {/* Updated library logo */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="bgGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--library-accent)" />
                  <stop offset="100%" stopColor="var(--library-warm)" />
                </linearGradient>

                <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="5" stdDeviation="6" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Background */}
              <rect width="64" height="64" rx="14" fill="url(#bgGrad)" filter="url(#shadow)" />

              {/* Book */}
              <g transform="translate(12,15)">
                {/* Left Page */}
                <path
                  d="M0 5c6-2 14-2 22 0v20c-8-2-16-2-22 0V5z"
                  fill="white"
                  opacity="0.98"
                />

                {/* Right Page */}
                <path
                  d="M20 5c6-2 14-2 22 0v20c-8-2-16-2-22 0V5z"
                  fill="white"
                  opacity="0.96"
                />

                {/* Center spine glow */}
                <rect x="20" y="4" width="4" height="22" fill="#fef7d1" opacity="0.7" />

                {/* Bookmark */}
                <path
                  d="M22 4h6v14l-3 -2l-3 2z"
                  fill="#ffcf6f"
                  opacity="0.95"
                />
              </g>
            </svg>
          </span>

          <span className="brand-text">Perpustakaan</span>
        </Link>

        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span className="hamburger" />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          <NavLink to="/" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
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
        </nav>
      </div>
    </header>
  )
}
