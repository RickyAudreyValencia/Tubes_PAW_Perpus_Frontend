import React from 'react'

export default function Footer() {
  return (
    <footer className="site-footer py-4 border-top">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>SMK Atma Gaming</h5>
            <p className="text-muted small">Jl. Atma Gaming.123 - Telp (021) 123456</p>
          </div>
          <div className="col-md-4">
            <h6>Kontak</h6>
            <div className="text-muted small">admin@perpustakaan.sch.id</div>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="small text-muted">© {new Date().getFullYear()} Perpustakaan</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
