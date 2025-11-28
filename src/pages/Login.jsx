import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    console.log('Login submitted', { email, remember })
    alert('Simulasi Login Berhasil (visual only)')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-avatar">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6 2h12v4l-6 4-6-4V2z" fill="var(--library-accent)" stroke="none" />
              <path d="M6 6v14h12V6" fill="#fff" opacity="0.9" />
            </svg>
          </div>
          <h3 className="login-title">Welcome Back</h3>
          <div className="login-sub">Login to access your digital library</div>

          <form onSubmit={handleSubmit} noValidate>
              <div className="input-field">
                  <div className="input-wrap">
                    <div className="input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                        <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} className={errors.email? 'is-invalid':''} />
                  </div>
              </div>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}

              <div className="input-field">
                  <div className="input-wrap">
                    <div className="input-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                        <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} className={errors.password? 'is-invalid':''} />
                  </div>
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}

            <div className="small-row">
              <label className="remember"><input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} /> Remember me</label>
              <a className="forgot" href="#">Forgot password?</a>
            </div>

            <button className="login-cta" type="submit">Login to Account →</button>

            <div className="or-sep">Or continue with</div>

            <div className="social-row">
              <button type="button" className="social-btn google-btn">
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google"/>
                <span>Google</span>
              </button>
              <button type="button" className="social-btn facebook-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#1877f2" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.406.593 24 1.325 24h11.5v-9.294H9.692v-3.622h3.133V9.412c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.465h-1.26c-1.242 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.917h-2.33V24H24C23.406 24 24 23.406 24 22.676V1.325C24 .593 23.406 0 22.675 0z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="signup-note">Don't have an account? <Link to="/register">Sign up for free</Link></div>
          </form>
        </div>
      </div>
    </div>
  )
}