import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { updateMemberProfile, deleteMemberAccount } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import '../styles/profile.css'

export default function MemberProfile() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const navigate = useNavigate()

  const { user, token, clearCredentials, refreshUser, setUser } = useAuth()

  useEffect(() => {
    let mounted = true
    async function fetchProfile(){
      setIsLoading(true)
      setError(null)
      console.log('MemberProfile: token=', !!token, 'user=', user)
      if (!token && !user) {
        // If there's no token and no user in context, treat as not-authenticated
        setError('Not authenticated. Please login.')
        setIsLoading(false)
        return
      }
      
      // Use user from context/storage (from login response)
      // Don't call /anggota because it returns an array of all members
      if (user && typeof user === 'object' && !Array.isArray(user)) {
        console.log('Using user from context:', user)
        setProfile(user)
        setFormData({
          nama: user.nama || '',
          email: user.email || '',
          no_telepon: user.nomor_telepon || user.no_telepon || '',
          alamat: user.alamat || '',
        })
        setIsLoading(false)
        return
      }
      
      // If user is array or empty, try to get from storage
      const stored = sessionStorage.getItem('user_info') || localStorage.getItem('user_info')
      if (stored) {
        try {
          const parsedUser = JSON.parse(stored)
          if (parsedUser && typeof parsedUser === 'object' && !Array.isArray(parsedUser)) {
            console.log('Using stored user:', parsedUser)
            setProfile(parsedUser)
            setFormData({
              nama: parsedUser.nama || '',
              email: parsedUser.email || '',
              no_telepon: parsedUser.nomor_telepon || parsedUser.no_telepon || '',
              alamat: parsedUser.alamat || '',
            })
            setIsLoading(false)
            return
          }
        } catch (e) {
          console.warn('Failed to parse stored user', e)
        }
      }
      
      // If we get here, profile couldn't be loaded
      setError('Tidak dapat memuat data profil. Silakan login kembali.')
      setIsLoading(false)
    }
    
    fetchProfile()
    return () => mounted = false
  }, [navigate, user, token, clearCredentials])

  if (isLoading) return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="loading-message">
          <div style={{ fontSize: '30px', marginBottom: '15px' }}>⏳</div>
          <p>Memuat data akun...</p>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="error-message">
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
          <p>{error}</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => { setError(null); setIsLoading(true); window.location.reload() }}>
              🔄 Coba Lagi
            </button>
            <button className="btn btn-cancel" onClick={() => navigate('/login')}>
              🔐 Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="error-message">
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>📭</div>
          <p>Tidak ada data profil yang tersedia.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop: 20 }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              🔄 Muat Ulang
            </button>
            <button className="btn btn-cancel" onClick={() => navigate('/login')}>
              🔐 Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  async function handleUpdate() {
    // Prepare update data
    const currentName = profile.nama || profile.name || ''
    const currentPhone = profile.no_telepon || profile.nomor_telepon || ''
    const currentAddress = profile.alamat || ''
    
    const newName = prompt('Nama', currentName)
    if (newName === null) return
    if (!newName.trim()) { alert('Nama tidak boleh kosong'); return }
    
    const newPhone = prompt('Nomor Telepon', currentPhone)
    if (newPhone === null) return
    
    const newAddress = prompt('Alamat', currentAddress)
    if (newAddress === null) return
    
    try {
      const updatePayload = { 
        nama: newName,
        ...(newPhone && { no_telepon: newPhone }),
        ...(newAddress && { alamat: newAddress })
      }
      console.log('Sending update payload:', updatePayload)
      await updateMemberProfile(updatePayload)
      alert('Profil berhasil diperbarui')
      
      // Update local profile state
      const updatedProfile = { 
        ...profile, 
        nama: newName,
        no_telepon: newPhone,
        nomor_telepon: newPhone,
        alamat: newAddress
      }
      setProfile(updatedProfile)
      
      // Update context's user
      setUser(updatedProfile)
      
      // Refresh user from backend to ensure sync
      await refreshUser()
    } catch (err) { 
      console.error('Update failed', err)
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Kesalahan tidak diketahui'
      alert('Gagal memperbarui profil: ' + errorMsg)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try { await deleteMemberAccount(); alert('Account deleted'); window.location.href = '/'; } catch (err) { alert('Failed to delete account') }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const updatePayload = {
        nama: formData.nama,
        ...(formData.no_telepon && { no_telepon: formData.no_telepon }),
        ...(formData.alamat && { alamat: formData.alamat })
      }
      
      if (!formData.nama.trim()) {
        alert('Nama tidak boleh kosong')
        setIsSaving(false)
        return
      }

      await updateMemberProfile(updatePayload)
      
      // Update profile state
      const updatedProfile = { 
        ...profile, 
        nama: formData.nama,
        no_telepon: formData.no_telepon,
        nomor_telepon: formData.no_telepon,
        alamat: formData.alamat
      }
      setProfile(updatedProfile)
      setUser(updatedProfile)
      
      setIsEditing(false)
      alert('Profil berhasil diperbarui!')
    } catch (err) { 
      console.error('Update failed', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Kesalahan tidak diketahui'
      alert('Gagal memperbarui profil: ' + errorMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      nama: profile?.nama || '',
      email: profile?.email || '',
      no_telepon: profile?.nomor_telepon || profile?.no_telepon || '',
      alamat: profile?.alamat || '',
    })
  }

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) return
    try { 
      await deleteMemberAccount()
      alert('Akun berhasil dihapus')
      // Clear auth data
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      sessionStorage.removeItem('user_info')
      localStorage.removeItem('user_role')
      sessionStorage.removeItem('user_role')
      // Redirect to home
      setTimeout(() => window.location.href = '/', 500)
    } catch (err) { 
      console.error('Delete account error:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Kesalahan tidak diketahui'
      alert('Gagal menghapus akun: ' + errorMsg)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">👤</div>
          <div className="profile-info-header">
            <h1 className="profile-title">Profil Anggota</h1>
            <p className="profile-email">{profile?.email}</p>
          </div>
        </div>

        {isEditing ? (
          <form className="profile-form">
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => handleFormChange('nama', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="form-input disabled"
              />
            </div>

            <div className="form-group">
              <label>Nomor Telepon</label>
              <input
                type="tel"
                value={formData.no_telepon}
                onChange={(e) => handleFormChange('no_telepon', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Alamat</label>
              <textarea
                value={formData.alamat}
                onChange={(e) => handleFormChange('alamat', e.target.value)}
                className="form-input form-textarea"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-save" 
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button 
                type="button" 
                className="btn btn-cancel" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nama</span>
                <span className="info-value">{profile?.nama || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile?.email || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Telepon</span>
                <span className="info-value">{profile?.nomor_telepon || profile?.no_telepon || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Alamat</span>
                <span className="info-value">{profile?.alamat || '-'}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => setIsEditing(true)}
              >
                Edit Profil
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                Hapus Akun
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
