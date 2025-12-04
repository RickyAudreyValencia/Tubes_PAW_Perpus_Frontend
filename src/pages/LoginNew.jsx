import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as apiLogin, setAuthToken } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function LoginNew(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()
  const { setCredentials } = useAuth()

  function validate(){
    const e = {}
    if (!email) e.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format email tidak valid'
    if (!password) e.password = 'Password wajib diisi'
    else if (password.length < 6) e.password = 'Password minimal 6 karakter'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e){
    e.preventDefault();
    setApiError(null)
    if (!validate()) return
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      console.log('Login response:', data)
      
      // Extract token - WAJIB ada
      const token = data.token || data.access_token
      if (!token) throw new Error('Auth token not found in response')
      
      // Extract user data dari berbagai struktur respons
      let user = null
      let role = 'anggota'
      
      // Cek struktur: {data: {user: {...}, ...}}
      if (data.data?.user) {
        user = data.data.user
        role = data.data.user.role || data.data.role || 'anggota'
      }
      // Cek struktur: {user: {...}, ...}
      else if (data.user) {
        user = data.user
        role = data.user.role || data.role || 'anggota'
      }
      // Cek struktur: langsung return user fields di top-level
      else if (data.id || data.nama || data.email) {
        user = {
          id: data.id,
          nama: data.nama || data.name,
          email: data.email,
          role: data.role
        }
        role = data.role || 'anggota'
      }
      // Fallback: minimal user object
      else {
        user = { email: email }
        role = 'anggota'
      }
      
      // Normalize role: backend mungkin return 'staff' tapi kita expect 'petugas'
      if (role === 'staff' || role === 'officer') {
        role = 'petugas'
      } else if (role !== 'petugas' && role !== 'anggota') {
        role = 'anggota' // fallback to member if unknown role
      }
      
      console.log('Extracted role:', role, 'user:', user)
      setAuthToken(token)
      await setCredentials({ token, role, user, remember })
      
      const redirectPath = role === 'petugas' ? '/petugas/dashboard' : '/anggota/dashboard'
      console.log('Redirecting to:', redirectPath)
      navigate(redirectPath)
    } catch (err) {
      console.error('Login failed', err)
      const resp = err?.response?.data || err
      if (resp?.message) setApiError(resp.message)
      else setApiError('Gagal melakukan login. Cek koneksi atau kredensial')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container container">
        <div className="login-card">
          <h3 className="login-title">Masuk ke Perpustakaan</h3>
          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="invalid-feedback api-error">{apiError}</div>}
            <div className="input-field">
              <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className={errors.email? 'is-invalid': ''}/>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="input-field">
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className={errors.password? 'is-invalid':''}/>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="input-field" style={{display:'flex', gap: 10, alignItems: 'center'}}>
              <label style={{display:'flex', gap: 8, alignItems:'center'}}>
                <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> Remember me
              </label>
            </div>
            <button className="library-btn login-cta" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Masuk'}</button>
            <div style={{marginTop: 12}}>Belum punya akun? <Link to="/register">Daftar</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}
