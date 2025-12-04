import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'
import api from '../../services/api'

export default function MemberDashboard() {
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ tanggal_kembali: '' })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    async function fetchBooks() {
      let raw = []
      try {
        // 1. Coba endpoint khusus anggota
        const res = await api.get('/peminjaman')
        if (Array.isArray(res?.data)) raw = res.data
        else if (Array.isArray(res?.data?.data)) raw = res.data.data
        else if (Array.isArray(res?.data?.peminjaman)) raw = res.data.peminjaman
        else if (Array.isArray(res?.data?.data?.peminjaman)) raw = res.data.data.peminjaman
        else if (Array.isArray(res?.data?.loans)) raw = res.data.loans
        else raw = []
      } catch (err) {
        // Jika endpoint tidak ditemukan, fallback ke /peminjaman dan filter manual
        if (err?.response?.status === 404 && user) {
          try {
            const allRes = await api.get('/peminjaman')
            let all = []
            if (Array.isArray(allRes?.data)) all = allRes.data
            else if (Array.isArray(allRes?.data?.data)) all = allRes.data.data
            else if (Array.isArray(allRes?.data?.peminjaman)) all = allRes.data.peminjaman
            else if (Array.isArray(allRes?.data?.data?.peminjaman)) all = allRes.data.data.peminjaman
            else if (Array.isArray(allRes?.data?.loans)) all = allRes.data.loans
            else all = []
            // Filter berdasarkan id anggota
            const userId = user.id || user.id_anggota || user.id_user
            raw = all.filter(item => {
              const anggotaId = item.id_anggota || item.anggota_id || item.user_id || item.anggota?.id || item.user?.id
              return anggotaId && userId && String(anggotaId) === String(userId)
            })
          } catch (err2) {
            console.warn('Fallback /peminjaman error:', err2)
          }
        } else {
          console.warn('Failed loading borrowed books', err)
        }
      }
      const data = raw.map(item => {
        const book =
          item.itemBuku?.buku ||
          item.item_buku?.buku ||     // untuk snake_case dari Laravel
          item.itemBuku ||            // kalau buku langsung di itemBuku
          item.item_buku ||           // versi snake_case
          item.buku ||                // fallback
          item;
        // Cari tanggal pinjam dari berbagai kemungkinan nama field
        const tanggalPinjam = item.tanggal_pinjam || item.tgl_pinjam || item.start_date || item.createdAt || item.tanggal || ''
        const tanggalKembali = item.tanggal_kembali || item.tgl_kembali || item.tgl_jatuh_tempo || item.end_date || item.due_date || item.return_date || item.returnDate || item.kembali || ''
        
        // Cari penulis dari berbagai kemungkinan field
        let penulis = ''
        if (book) {
          penulis = book.penulis || book.pengarang || book.author || book.penulis_buku || ''
        } else if (item.penulis) {
          penulis = item.penulis
        } else if (item.pengarang) {
          penulis = item.pengarang
        }
        
        return {
          ...item,
          judul: (book && (book.judul || book.title)) || item.judul || '',
          penulis: penulis || 'Penulis Tidak Diketahui',
          gambar: (book && (book.gambar || book.img)) || item.gambar || 'https://via.placeholder.com/80x110?text=No+Cover',
          tanggal_pinjam: tanggalPinjam,
          tanggal_kembali: tanggalKembali,
          status: item.status || 'Dipinjam',
        }
      })
      if (mounted) setBorrowedBooks(data)
    }
    fetchBooks()
    return () => { mounted = false }
  }, [user])

  const handleCancelLoan = async (loanId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan peminjaman ini?')) return
    
    setLoading(true)
    try {
      await api.delete(`/peminjaman/delete/${loanId}`)
      // Hapus dari list
      setBorrowedBooks(borrowedBooks.filter(b => b.id_peminjaman !== loanId))
      alert('Peminjaman berhasil dibatalkan')
    } catch (err) {
      console.error('Gagal membatalkan peminjaman:', err)
      alert('Gagal membatalkan peminjaman: ' + (err?.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleStartEdit = (book) => {
    setEditingId(book.id_peminjaman)
    setEditData({ tanggal_kembali: book.tanggal_kembali || book.tgl_jatuh_tempo || '' })
  }

  const handleUpdateLoan = async (loanId) => {
    if (!editData.tanggal_kembali) {
      alert('Tanggal kembali harus diisi')
      return
    }

    setLoading(true)
    try {
      await api.put(`/peminjaman/update/${loanId}`, {
        tgl_jatuh_tempo: editData.tanggal_kembali
      })
      // Update data di list
      setBorrowedBooks(borrowedBooks.map(b => 
        b.id_peminjaman === loanId 
          ? { ...b, tanggal_kembali: editData.tanggal_kembali }
          : b
      ))
      setEditingId(null)
      alert('Peminjaman berhasil diperbarui')
    } catch (err) {
      console.error('Gagal memperbarui peminjaman:', err)
      alert('Gagal memperbarui peminjaman: ' + (err?.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({ tanggal_kembali: '' })
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(180deg, #f4f7fb 0%, #f9fbff 100%)', padding: '40px 0', marginBottom: 32 }}>
        <div className="container">
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ color: 'rgba(13, 43, 64, 0.6)', fontSize: 14, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>DASHBOARD ANGGOTA</div>
            <h1 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '2rem', color: '#0d2b40', letterSpacing: 0.3 }}>Kelola Peminjaman Buku Anda</h1>
            <p style={{ margin: 0, fontSize: '1.05rem', color: 'rgba(30, 30, 30, 0.75)' }}>Lihat daftar buku yang sedang Anda pinjam dari perpustakaan kami</p>
          </div>
        </div>
      </div>

      <main className="container">
        <section className="borrowed-books-section mb-5">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, color: '#0d2b40', letterSpacing: 0.5, fontSize: '1.5rem', margin: 0 }}>Buku yang Sedang Kamu Pinjam</h3>
          </div>
          
          <div className="row justify-content-center">
            {borrowedBooks.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info" style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: 12, padding: '24px', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                  <span style={{ fontSize: 24, marginRight: 8 }}>📚</span>
                  <span>Kamu belum meminjam buku apapun.</span>
                </div>
              </div>
            ) : (
              borrowedBooks.map((b, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4 mb-4 d-flex align-items-stretch">
                  <div className="book-card card h-100 text-left p-4 shadow-sm" style={{ borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="d-flex align-items-start mb-3">
                      <div style={{ position: 'relative', marginRight: 18 }}>
                        <img 
                          src={b.gambar || 'https://via.placeholder.com/80x110?text=No+Cover'} 
                          alt={b.judul || 'No Title'} 
                          style={{ 
                            width: 80, 
                            height: 110, 
                            objectFit: 'cover', 
                            borderRadius: 8, 
                            background: '#e0e7ef',
                            border: '1px solid #d1d5db',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                          }} 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x110?text=No+Cover'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 
                          className="book-title mb-1" 
                          style={{ 
                            fontWeight: 600, 
                            color: '#0ea5e9', 
                            fontSize: '0.95rem', 
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.5em'
                          }}
                        >
                          {b.judul || 'No Title'}
                        </h5>
                        <div 
                          className="text-muted small mb-2" 
                          style={{ 
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            color: '#6b7280'
                          }}
                        >
                          {b.penulis || b.pengarang || 'Unknown'}
                        </div>
                        <div
                          className="badge"
                          style={{
                            background: '#bae6fd',
                            color: '#0369a1',
                            fontSize: 12,
                            borderRadius: 6,
                            padding: '4px 10px',
                            display: 'inline-block',
                            fontWeight: 600
                          }}
                        >
                          {b.status === 'selesai'
                            ? '✓ Selesai'
                            : b.status === 'pinjam'
                            ? '📖 Pinjam'
                            : '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <div><strong>Tanggal Pinjam:</strong> {b.tanggal_pinjam ? new Date(b.tanggal_pinjam).toLocaleDateString('id-ID') : '-'}</div>
                      {editingId === b.id_peminjaman ? (
                        <div style={{ marginTop: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem' }}>Tanggal Kembali</label>
                          <input 
                            type="date"
                            value={editData.tanggal_kembali.split('T')[0] || ''}
                            onChange={(e) => setEditData({ ...editData, tanggal_kembali: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem', marginBottom: '10px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleUpdateLoan(b.id_peminjaman)}
                              disabled={loading}
                              style={{ 
                                flex: 1, 
                                padding: '8px 12px', 
                                background: '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              Simpan
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={loading}
                              style={{ 
                                flex: 1, 
                                padding: '8px 12px', 
                                background: '#ef4444', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                opacity: loading ? 0.6 : 1
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div><strong>Tanggal Kembali:</strong> {b.tanggal_kembali ? new Date(b.tanggal_kembali).toLocaleDateString('id-ID') : '-'}</div>
                          {!b.id_petugas_kembali && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button
                                onClick={() => handleStartEdit(b)}
                                style={{ 
                                  flex: 1, 
                                  padding: '8px 12px', 
                                  background: '#3b82f6', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 600
                                }}
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleCancelLoan(b.id_peminjaman)}
                                disabled={loading}
                                style={{ 
                                  flex: 1, 
                                  padding: '8px 12px', 
                                  background: '#ef4444', 
                                  color: 'white', 
                                  border: 'none', 
                                  borderRadius: '6px', 
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  opacity: loading ? 0.6 : 1
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <div style={{ marginTop: 48 }}>
        <Footer />
      </div>
    </div>
  )
}
