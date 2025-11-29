import React, { useEffect, useState, useCallback } from 'react'
import { fetchEvents } from '../services/api'
import api from '../services/api'
import Footer from '../components/Footer'

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

export default function PetugasPage() {
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({
    judul: '',
    pengarang: '',
    penerbit: '',
    tahun: new Date().getFullYear(),
    isbn: '',
    kategori: '',
    stok: 0,
  })
  const [errors, setErrors] = useState({})

  const mapBackendData = useCallback((data) => {
    return data.map((buku) => ({
      id: buku.id,
      title: buku.judul || 'No Title',
      author: buku.penulis || buku.pengarang || 'Unknown',
      penerbit: buku.penerbit || 'Unknown',
      year: buku.tahun || '-',
      isbn: buku.isbn || 'N/A',
      category: buku.kategori?.nama || (buku.kategori || 'Unknown'),
      stok: buku.stok ?? 0,
      img: buku.gambar || placeholder,
    }))
  }, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchEvents()
        // fetchEvents returns axios response in Library.jsx style; we accept both
        const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        if (mounted) setBooks(mapBackendData(raw))
      } catch (err) {
        console.error('Gagal memuat buku', err)
        if (mounted) setError(err.message || 'Unknown error')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [mapBackendData])

  function handleAdd() {
    setErrors({})
    setForm({ judul: '', pengarang: '', penerbit: '', tahun: new Date().getFullYear(), isbn: '', kategori: '', stok: 0 })
    setIsAddOpen(true)
  }
  function closeAdd() {
    setIsAddOpen(false)
  }
  function updateField(name, value) {
    setForm(prev => ({ ...prev, [name]: value }))
  }
  function validate() {
    const err = {}
    if (!form.judul) err.judul = 'Judul wajib diisi'
    if (!form.pengarang) err.pengarang = 'Pengarang wajib diisi'
    if (!form.penerbit) err.penerbit = 'Penerbit wajib diisi'
    if (!form.tahun || form.tahun <= 0) err.tahun = 'Tahun tidak valid'
    if (!form.isbn) err.isbn = 'ISBN wajib diisi'
    if (!form.kategori) err.kategori = 'Kategori wajib diisi'
    if (form.stok < 0) err.stok = 'Stok minimal 0'
    setErrors(err)
    return Object.keys(err).length === 0
  }
  async function saveBook(e) {
    e?.preventDefault()
    if (!validate()) return
    try {
      await api.post('/buku', {
        judul: form.judul,
        penulis: form.pengarang,
        pengarang: form.pengarang,
        penerbit: form.penerbit,
        tahun: form.tahun,
        isbn: form.isbn,
        kategori: form.kategori,
        stok: form.stok,
      })
      // reload
      const res = await fetchEvents()
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      setBooks(mapBackendData(raw))
      setIsAddOpen(false)
      alert('Buku berhasil ditambahkan')
    } catch (err) {
      console.error('Gagal menambahkan buku', err)
      alert('Gagal menambahkan buku: ' + (err?.message || 'Unknown'))
    }
  }
  function handleEdit(book) {
    alert(`Edit buku ${book.title} (ID: ${book.id})`)
  }
  function handleDelete(book) {
    if (!confirm(`Hapus buku ${book.title}?`)) return
    // Implement API call delete if needed
    alert('Deleted (demo): ' + book.title)
  }

  return (
    <div className="container mt-4">
      <div className="card p-3">
          <div className="d-flex justify-between align-center" style={{ marginBottom: 12 }}>
          <div>
            <small className="muted">Data Buku</small>
            <h2 style={{ margin: 0 }}>Kelola koleksi buku perpustakaan</h2>
          </div>
          <div>
            <button className="primary-cta" onClick={handleAdd}>
              + Tambah Buku
            </button>
          </div>
        </div>

        {isLoading && <div className="text-center p-4">Memuat data buku...</div>}
        {error && <div className="text-center text-danger">Kesalahan: {error}</div>}

        {!isLoading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '12px 16px', width: 40 }}>No</th>
                  <th style={{ padding: '12px 16px' }}>Judul Buku</th>
                  <th style={{ padding: '12px 16px' }}>Pengarang</th>
                  <th style={{ padding: '12px 16px' }}>Penerbit</th>
                  <th style={{ padding: '12px 16px' }}>Tahun</th>
                  <th style={{ padding: '12px 16px' }}>ISBN</th>
                  <th style={{ padding: '12px 16px' }}>Kategori</th>
                  <th style={{ padding: '12px 16px', width: 80 }}>Stok</th>
                  <th style={{ padding: '12px 16px', width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b, i) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '14px 16px' }}>{i + 1}</td>
                    <td style={{ padding: '14px 16px' }}>{b.title}</td>
                    <td style={{ padding: '14px 16px' }}>{b.author}</td>
                    <td style={{ padding: '14px 16px' }}>{b.penerbit}</td>
                    <td style={{ padding: '14px 16px' }}>{b.year}</td>
                    <td style={{ padding: '14px 16px' }}>{b.isbn}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="chip small" style={{ display: 'inline-block' }}>{b.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{b.stok}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" onClick={() => handleEdit(b)} title="Edit">
                          ✏️
                        </button>
                        <button className="btn btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.12)' }} onClick={() => handleDelete(b)} title="Hapus">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeAdd}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAdd} title="Tutup">✕</button>
            <div className="modal-header">
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>Tambah Data Buku</h3>
                <small className="muted">Kelola koleksi buku perpustakaan</small>
              </div>
            </div>
            <form onSubmit={saveBook}>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Judul Buku *</label>
                    <input className={`form-control ${errors.judul ? 'is-invalid' : ''}`} placeholder="Masukkan judul buku" value={form.judul} onChange={(e) => updateField('judul', e.target.value)} />
                    {errors.judul && <div className="invalid-feedback">{errors.judul}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Pengarang *</label>
                    <input className={`form-control ${errors.pengarang ? 'is-invalid' : ''}`} placeholder="Masukkan nama pengarang" value={form.pengarang} onChange={(e) => updateField('pengarang', e.target.value)} />
                    {errors.pengarang && <div className="invalid-feedback">{errors.pengarang}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Penerbit *</label>
                    <input className={`form-control ${errors.penerbit ? 'is-invalid' : ''}`} placeholder="Masukkan nama penerbit" value={form.penerbit} onChange={(e) => updateField('penerbit', e.target.value)} />
                    {errors.penerbit && <div className="invalid-feedback">{errors.penerbit}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Tahun Terbit *</label>
                    <input type="number" className={`form-control ${errors.tahun ? 'is-invalid' : ''}`} value={form.tahun} onChange={(e) => updateField('tahun', parseInt(e.target.value || 0))} />
                    {errors.tahun && <div className="invalid-feedback">{errors.tahun}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">ISBN *</label>
                    <input className={`form-control ${errors.isbn ? 'is-invalid' : ''}`} placeholder="978-xxx-xxxx-xx-x" value={form.isbn} onChange={(e) => updateField('isbn', e.target.value)} />
                    {errors.isbn && <div className="invalid-feedback">{errors.isbn}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Kategori *</label>
                    <select className={`form-control ${errors.kategori ? 'is-invalid' : ''}`} value={form.kategori} onChange={(e) => updateField('kategori', e.target.value)}>
                      <option value="">Pilih kategori</option>
                      <option value="Sains">Sains</option>
                      <option value="Teknologi">Teknologi</option>
                      <option value="Fiksi">Fiksi</option>
                      <option value="Non-Fiksi">Non-Fiksi</option>
                    </select>
                    {errors.kategori && <div className="invalid-feedback">{errors.kategori}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-field">
                    <label className="form-label">Stok *</label>
                    <input type="number" className={`form-control ${errors.stok ? 'is-invalid' : ''}`} value={form.stok} onChange={(e) => updateField('stok', parseInt(e.target.value || 0))} />
                    {errors.stok && <div className="invalid-feedback">{errors.stok}</div>}
                  </div>
                </div>
              </div>
              <div className="mt-3" style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="primary-cta">Simpan</button>
                <button type="button" className="btn btn-ghost" onClick={closeAdd}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Footer />
      </div>
    </div>
  )
}
