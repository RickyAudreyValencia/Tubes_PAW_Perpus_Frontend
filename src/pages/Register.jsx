import React, { useState } from 'react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!name) e.name = 'Name is required'
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match'
    if (!agree) e.agree = 'You must agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    console.log('Register submitted', { name, email })
    alert('Registration successful (visual only)')
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
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Ricky Tamvan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="invalid-feedback">{errors.name}</div>
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
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </div>
          <div className="invalid-feedback">{errors.email}</div>
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
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          </div>
          <div className="invalid-feedback">{errors.password}</div>
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
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="invalid-feedback">{errors.confirmPassword}</div>
        </div>

        <div className="form-group mt-3">
          <label className="remember"><input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} /> I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
          <div className="invalid-feedback">{errors.agree}</div>
        </div>

        <button className="library-btn register-cta">Register</button>
          </form>
        </div>
      </div>
    </div>
  )
}