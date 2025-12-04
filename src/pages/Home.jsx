import React, { useState } from 'react'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const placeholder = 'https://via.placeholder.com/160x220?text=No+Image'

const sampleBooks = [
  { id: 1, title: 'Perahu Kertas', author: 'Dewi Lestari', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', year: 2005, pages: 312, isbn: '978-1234567890', status: 'Available', summary: 'Novel coming-of-age tentang persahabatan, harapan dan perjalanan menjadi dewasa.' },
  { id: 2, title: 'Belajar React', author: 'Andi Susanto', img: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=400&q=80', year: 2021, pages: 256, isbn: '978-0987654321', status: 'Checked Out', summary: 'Panduan praktis membangun aplikasi modern dengan React dan ekosistemnya.' },
  { id: 3, title: 'JavaScript Modern', author: 'Budi Santoso', img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80', year: 2019, pages: 480, isbn: '978-1122334455', status: 'Available', summary: 'Pembahasan lanjutan JavaScript, pattern, dan best-practices untuk pengembang web.' },
  { id: 4, title: 'Desain Web', author: 'Siti Rahma', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80', year: 2018, pages: 200, isbn: '978-6677889900', status: 'Available', summary: 'Dasar-dasar desain antarmuka dan pengalaman pengguna untuk web modern.' },
]

export default function Home() {
  const [selectedBook, setSelectedBook] = useState(null)

  function closeModal() {
    setSelectedBook(null)
  }

  return (
    <div>
      <header className="hero hero-landing">
        <div className="container hero-inner">
          <div className="hero-left">
            <div className="badge">✨ Welcome to Digital Library</div>
            <h1 className="hero-title">
              Discover Your Next <span className="accent">Great Read</span>
            </h1>
            <p className="lead">
              Access thousands of books, journals, and digital resources. Learn, grow, and explore from anywhere, anytime.
            </p>

            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <input className="search-input" placeholder="Search for books, authors, or topics..." />
              <button className="btn btn-search">Search</button>
            </form>

            <div className="hero-actions">
              <Link to="/library" className="btn primary-cta">Explore Library</Link>
              <Link to="/register" className="btn btn-ghost">Join as Member</Link>
              <Link to="/login" className="btn btn-outline-secondary">Officer Login</Link>
            </div>

            <div className="mt-3">
              <div className="d-flex gap-2" style={{ justifyContent: 'flex-start' }}>
                <Link to="/register" className="btn btn-ghost">I'm a Member</Link>
                <Link to="/login" className="btn btn-outline-secondary">I'm a Library Officer</Link>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="image-card">
              <img
                src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f5e6d7c8b9a0c1d2e3f4b5a6c7d8e9f"
                alt="Perpustakaan"
                className="img-fluid rounded-lg"
              />
              <div className="stat-card">
                <div className="stat-icon">🎓</div>
                <div>
                  <div className="stat-number">5,420+</div>
                  <div className="stat-label">Active Readers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mt-5">

        {/* ABOUT SECTION */}
        <section className="about mb-5">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2>Tentang Perpustakaan</h2>
              <p className="text-muted">
                Perpustakaan sekolah menyediakan koleksi buku pelajaran, referensi, dan bacaan umum untuk mendukung proses pembelajaran siswa.
                Kami juga menyediakan layanan peminjaman dan ruang baca yang nyaman.
              </p>
              <a href="#" className="link-primary">Pelajari lebih lanjut &raquo;</a>
            </div>
            <div className="col-md-6 mt-4 mt-md-0">
              <img
                src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&s=4f5e6d7c8b9a0c1d2e3f4b5a6c7d8e9f"
                alt="Perpustakaan"
                className="img-fluid rounded shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* POPULAR BOOKS */}
        <section className="popular-books mb-5 text-center">
          <h3 className="mb-3">Buku Terpopuler</h3>
          <p className="text-muted small">Kumpulan buku yang paling sering dipinjam oleh pengunjung.</p>

          <div className="row mt-4">
            {sampleBooks.map((b) => (
              <div key={b.id} className="col-6 col-md-3 mb-4">
                <div className="book-card card h-100 text-center p-3">
                  <img
                    src={b.img}
                    alt={b.title}
                    className="book-cover mb-3 rounded"
                    onError={(e) => { e.target.src = placeholder }}
                  />
                  <div className="card-body p-0">
                    <h5 className="book-title">{b.title}</h5>
                    <div className="text-muted small">{b.author}</div>
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setSelectedBook(b)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOOK DETAIL MODAL */}
        {selectedBook && (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-head-left">
                  <img
                    src={selectedBook.img}
                    alt={selectedBook.title}
                    className="modal-head-thumb"
                    onError={(e) => { e.target.src = placeholder }}
                  />
                </div>

                <div className="modal-head-main">
                  <h3 className="modal-title">{selectedBook.title}</h3>
                  <p className="text-muted modal-author">by {selectedBook.author}</p>

                  <div className="meta-list">
                    <div className="meta-item">Year: <strong>{selectedBook.year}</strong></div>
                    <div className="meta-item">Pages: <strong>{selectedBook.pages}</strong></div>
                    <div className="meta-item">ISBN: <strong>{selectedBook.isbn}</strong></div>
                    <div className={`meta-item availability ${selectedBook.status === 'Available' ? 'available' : 'unavailable'}`}>
                      {selectedBook.status}
                    </div>
                  </div>
                </div>

                <button className="modal-close" onClick={closeModal} aria-label="Close">✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-body-left modal-thumb">
                  <img
                    src={selectedBook.img}
                    alt={selectedBook.title}
                    className="img-fluid rounded-lg"
                    onError={(e) => { e.target.src = placeholder }}
                  />
                </div>
                <div className="modal-body-right">
                  <p className="modal-summary">{selectedBook.summary}</p>
                  <div className="modal-actions">
                    <button className="btn primary-cta">Pinjam Sekarang</button>
                    <button className="btn btn-ghost" onClick={closeModal}>Tutup</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FEATURES SECTION */}
        <section className="features mb-5">
          <h4 className="mb-3">Fasilitas</h4>
          <div className="row">

            {[
              { name: 'Akses Internet', icon: '🌐' },
              { name: 'Ruang Baca Nyaman', icon: '📖' },
              { name: 'Koleksi Lengkap', icon: '📚' },
              { name: 'Layanan Peminjaman', icon: '📤' },
              { name: 'Ruang Multimedia', icon: '🎧' },
              { name: 'Layanan Konsultasi', icon: '💬' }
            ].map((f, i) => (
              <div key={i} className="col-6 col-md-4 mb-3">
                <div className="feature-box p-3 h-100">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.name}</div>
                  <div className="text-muted small">
                    Deskripsi singkat tentang fasilitas {f.name.toLowerCase()} yang tersedia di perpustakaan.
                  </div>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* CTA */}
        <section className="cta-banner mt-5">
          <div className="container cta-inner">
            <div className="cta-content text-center">
              <div className="cta-icon">⚡</div>
              <h3>Start Your Reading Journey Today</h3>
              <p className="small text-muted">Join thousands of readers and get unlimited access to our digital library</p>

              <div className="cta-buttons mt-3">
                <Link className="btn primary-cta" to="/register">Get Started Free</Link>
                <Link className="btn btn-outline-secondary" to="/library">Browse Library</Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
