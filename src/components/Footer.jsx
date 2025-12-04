import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer py-4 border-top">
      <div className="container">
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>SMK Atma Gaming</div>
          <div className="text-muted small">Jl. Atma Gaming.123 - Telp (021) 123456</div>
          <div style={{ marginTop: 8 }}><strong>Kontak</strong> <span className="text-muted small">admin@perpustakaan.sch.id</span></div>
          <div className="small text-muted" style={{ marginTop: 10 }}>&copy; {new Date().getFullYear()} Perpustakaan</div>
        </div>
      </div>
    </footer>
  )
}
