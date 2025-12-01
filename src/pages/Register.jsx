import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Import useNavigate
// Pastikan Anda mengimpor fungsi register dari file api Anda
import { register, setAuthToken } from '../services/api'; 

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  // Tambahkan state untuk API submission
  const [isSubmitting, setIsSubmitting] = useState(false) 
  const [apiError, setApiError] = useState(null) 

  const navigate = useNavigate(); // Inisialisasi useNavigate

  // Modifikasi fungsi validate agar pesan error berbahasa Indonesia 
  // dan lebih ringkas (opsional, tapi disarankan agar konsisten dengan Login.jsx)
  function validate() {
    const e = {}
    if (!name) e.name = 'Nama wajib diisi'
    if (!email) e.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format email tidak valid'
    if (!password) e.password = 'Password wajib diisi'
    else if (password.length < 6) e.password = 'Password minimal 6 karakter'
    if (!confirmPassword) e.confirmPassword = 'Konfirmasi password wajib diisi'
    else if (confirmPassword !== password) e.confirmPassword = 'Password tidak cocok'
    if (!agree) e.agree = 'Anda harus menyetujui syarat & ketentuan'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Ubah handleSubmit menjadi async function untuk memanggil API
  async function handleSubmit(ev) {
    ev.preventDefault()
    setApiError(null) 

    if (!validate()) return

    setIsSubmitting(true)

    try {
      // 1. Panggil API Register
      // Sesuaikan parameter fungsi register di bawah ini dengan kebutuhan API Anda.
      const response = await register(name, email, password, confirmPassword) 

      // 2. Ambil Token (jika API register langsung mengembalikan token/langsung login)
      const token = response.token || response.access_token 

      if (token) {
        // 3. Simpan token dan atur header Axios (Asumsi: registrasi otomatis login)
        // Disimpan di sessionStorage untuk kasus register, biasanya tidak ingat saya
        sessionStorage.setItem('auth_token', token)
        localStorage.removeItem('auth_token')
        setAuthToken(token)  
        
        // 4. NAVIGASI KE HALAMAN PETUGAS SETELAH SUKSES REGISTRASI/LOGIN
        navigate('/petugas') 
      } else {
        // Jika API register tidak mengembalikan token, mungkin perlu navigasi ke halaman login
        alert('Registrasi berhasil. Silakan login.')
        navigate('/login') 
      }

    } catch (err) {
      console.error('Registrasi Gagal:', err)

      // Penanganan Error API
      const responseError = err.response?.data || err;

      if (responseError.errors) {
        // Penanganan error validasi dari server (jika ada)
        const serverErrors = {};
        for (const key in responseError.errors) {
            serverErrors[key] = responseError.errors[key].join(' ');
        }
        setErrors(prev => ({ ...prev, ...serverErrors }));
        setApiError('Gagal melakukan registrasi karena beberapa kesalahan input.');
      } else if (responseError.message) {
        setApiError(responseError.message);
      } else if (responseError.error) {
        setApiError(responseError.error);
      } else {
        setApiError('Gagal terhubung ke server atau terjadi kesalahan tak terduga.');
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-avatar">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M12 2l7 3v4c0 5-3 9-7 11-4-2-7-6-7-11V5l7-3z" fill="currentColor" />
              <path d="M9.5 11.5c0-1.657 1.343-3 3-3v3h-3z" fill="#fff" opacity="0.95" />
            </svg>
          </div>
          <h3 className="register-title">Create Account</h3>
          <p className="register-sub">Join our digital library community</p>

          <form onSubmit={handleSubmit} noValidate>
             {/* Menampilkan Error API di sini */}
             {apiError && <div className="invalid-feedback api-error">{apiError}</div>}

            <div className="mb-3 input-field">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <div className="input-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.25" fill="none" />
                    <path d="M6 20c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  // Ubah dari `form-control` ke class yang konsisten dengan login.jsx (jika ada)
                  className={`form-control ${errors.name || apiError ? 'is-invalid' : ''}`} 
                  placeholder="Ricky Tamvan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting} // Disable saat submit
                />
              </div>
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3 input-field">
              <label className="form-label">Email</label>
              <div className="input-wrap">
                <div className="input-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <input
                  type="email"
                  className={`form-control ${errors.email || apiError ? 'is-invalid' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting} // Disable saat submit
                />
              </div>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3 input-field">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <div className="input-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  type="password"
                  className={`form-control ${errors.password || apiError ? 'is-invalid' : ''}`}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting} // Disable saat submit
                />
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3 input-field">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrap">
                <div className="input-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword || apiError ? 'is-invalid' : ''}`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting} // Disable saat submit
                />
              </div>
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <div className="form-group mt-3">
              <label className="remember">
                <input 
                  type="checkbox" 
                  checked={agree} 
                  onChange={(e)=>setAgree(e.target.checked)} 
                  disabled={isSubmitting} // Disable saat submit
                /> 
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
              {errors.agree && <div className="invalid-feedback">{errors.agree}</div>}
            </div>

            <button 
                className="library-btn register-cta" 
                type="submit" 
                disabled={isSubmitting} // Disable saat submit
            >
                {isSubmitting ? 'Registering...' : 'Register →'}
            </button>
            
            <div className="signup-note">Already have an account? <Link to="/login">Login here</Link></div>

          </form>
        </div>
      </div>
    </div>
  )
}