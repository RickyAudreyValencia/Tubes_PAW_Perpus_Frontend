import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Footer from '../../components/Footer'

export default function OfficerProfile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const { user, token, clearCredentials, refreshUser } = useAuth()
  useEffect(() => {
    let mounted = true
    
    // Gunakan user dari AuthContext terlebih dahulu
    if (user && Object.keys(user).length > 0) {
      setProfile(user)
      setIsLoading(false)
      return
    }
    
    // Jika tidak ada user di context, coba load dari storage
    const stored = sessionStorage.getItem('user_info') || localStorage.getItem('user_info')
    if (stored) {
      try {
        setProfile(JSON.parse(stored))
        setIsLoading(false)
        return
      } catch(e) {
        console.error('Failed to parse stored user info', e)
      }
    }
    
    // Jika masih tidak ada, tampilkan error
    setError('Informasi profil tidak tersedia')
    setIsLoading(false)
  }, [user])

  // The app has a single preconfigured officer account by requirement — do not allow adding/removing
  return (
    <div className="container mt-4">
      <div className="card p-3">
        <h3>Profil Petugas</h3>
        {isLoading && <div>Loading...</div>}
        {error && (
          <div className="text-danger">
            {error}
            <div style={{ marginTop: 8 }}>
              <button className="btn primary-cta" onClick={() => window.location.reload()}>Retry</button>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
            </div>
          </div>
        )}
        {!isLoading && !error && !profile && (
          <div className="text-muted">No profile data available. Try reloading or login again.</div>
        )}
        {profile && (
          <div>
            <p><strong>Nama:</strong> {profile.nama || profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><em>Note: Administrator account is managed by backend. Only credential: rickyPetugas@gmail.com / 111111</em></p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary-cta">Edit Profil</button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4"><Footer /></div>
    </div>
  )
}
