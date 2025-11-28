import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Library from './pages/Library'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </BrowserRouter>
  )
}