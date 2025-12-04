import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }){
  const { token, role, loading } = useAuth()
  console.log('ProtectedRoute check:', { token: !!token, role, allowedRoles, loading })
  
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && allowedRoles.length && !allowedRoles.includes(role)) {
    console.log(`Role mismatch: user has '${role}', allowed: ${allowedRoles.join(', ')}`)
    // If role is wrong, fallback to root or their default role page
    if (role === 'petugas') return <Navigate to="/petugas/dashboard" replace />
    if (role === 'anggota') return <Navigate to="/anggota/dashboard" replace />
    return <Navigate to="/" replace />
  }
  console.log('ProtectedRoute passed, rendering children')
  return children
}
