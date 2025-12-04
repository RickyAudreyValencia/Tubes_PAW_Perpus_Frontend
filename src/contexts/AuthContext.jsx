import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api, { setAuthToken, logout as apiLogout } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadFromStorage = useCallback(() => {
    const localToken = localStorage.getItem('auth_token')
    const sessionToken = sessionStorage.getItem('auth_token')
    const t = localToken || sessionToken || null
    const storedRole = localStorage.getItem('user_role') || sessionStorage.getItem('user_role')
    const storedUser = localStorage.getItem('user_info') || sessionStorage.getItem('user_info')

    if (t) {
      setToken(t)
      setAuthToken(t)
    }
    if (storedRole) setRole(storedRole)
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)) } catch(e) { setUser(null) }
    }
  }, [])

  useEffect(() => {
    loadFromStorage()
    setLoading(false)
  }, [loadFromStorage])

  const setCredentials = async ({ token, role, user, remember }) => {
    console.log('setCredentials called with:', { token: token?.slice(0, 20) + '...', role, user })
    setToken(token)
    setAuthToken(token)
    setRole(role)
    setUser(user)
    console.log('After setCredentials - role state:', role)
    
    if (remember) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_role', role)
      localStorage.setItem('user_info', JSON.stringify(user || {}))
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_role')
      sessionStorage.removeItem('user_info')
    } else {
      sessionStorage.setItem('auth_token', token)
      sessionStorage.setItem('user_role', role)
      sessionStorage.setItem('user_info', JSON.stringify(user || {}))
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_info')
    }
  }

  const clearCredentials = async () => {
    try { await apiLogout() } catch (e) { console.warn('logout api failed', e) }
    setToken(null)
    setRole(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    sessionStorage.removeItem('user_role')
    localStorage.removeItem('user_info')
    sessionStorage.removeItem('user_info')
  }

  // refresh user from backend if needed
  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      // Try /anggota/me endpoint untuk get current user profile
      const res = await api.get('/anggota/me')
      const remote = res.data?.data || res.data
      console.log('Refresh user from /anggota/me:', remote)
      
      // Only update if it's an object (not an array)
      if (remote && typeof remote === 'object' && !Array.isArray(remote) && Object.keys(remote).length) {
        setUser(remote)
        // Update stored user info
        if (localStorage.getItem('auth_token')) {
          localStorage.setItem('user_info', JSON.stringify(remote))
        } else if (sessionStorage.getItem('auth_token')) {
          sessionStorage.setItem('user_info', JSON.stringify(remote))
        }
      }
    } catch (e) {
      console.warn('refresh user failed', e)
      // Don't update user if endpoint fails - keep the login response data
    }
  }, [token])


  useEffect(() => {
    if (token) refreshUser()
  }, [token, refreshUser])

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole, token, setToken, loading, setCredentials, clearCredentials, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
