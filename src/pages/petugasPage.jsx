import React, { useEffect, useState, useCallback } from 'react'
import { fetchEvents } from '../services/api'
import api from '../services/api'
import Footer from '../components/Footer'

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

// ASUMSI: Daftar kategori dan ID-nya di database Anda
const CATEGORY_OPTIONS = [
    { id: '1', nama: "Sains" }, 
    { id: '2', nama: "Teknologi" },
    { id: '3', nama: "Fiksi" },
    { id: '4', nama: "Non-Fiksi" }
];

export default function PetugasPage() {
    const [books, setBooks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false) // Digunakan untuk Add dan Edit Modal
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentBookId, setCurrentBookId] = useState(null) // State yang menampung ID buku yang sedang diedit
    const [deletingId, setDeletingId] = useState(null) // ID buku yang sedang dihapus

    const [form, setForm] = useState({
        judul: '',
        pengarang: '',
        penerbit: '',
        tahun: new Date().getFullYear(),
        isbn: '',
        kategori: '', // Akan menyimpan ID kategori (id_kategori)
        stok: 0,
    })
    const [errors, setErrors] = useState({})

    // Fungsi helper untuk mereset semua state modal/form
    const resetFormState = () => {
        setErrors({})
        setForm({ judul: '', pengarang: '', penerbit: '', tahun: new Date().getFullYear(), isbn: '', kategori: '', stok: 0 })
        setIsEditMode(false)
        setCurrentBookId(null)
    }

    const mapBackendData = useCallback((data) => {
        // FIX: Gunakan buku.id, atau ganti ke buku.id_buku jika nama kolom primary key non-standar di Laravel Anda
        return data.map((buku) => ({
            id: buku.id || buku.id_buku, // <-- Coba fallback ID non-standar jika buku.id null
            title: buku.judul || 'No Title',
            author: buku.penulis || buku.pengarang || 'Unknown',
            penerbit: buku.penerbit || 'Unknown',
            year: buku.tahun_terbit || buku.tahun || '-',
            isbn: buku.isbn || 'N/A',
            // Pastikan kategori diambil dengan benar
            category: buku.kategori?.nama || (buku.kategori || 'Unknown'),
            stok: buku.stok ?? 1,
            img: buku.gambar || placeholder,
        }))
    }, [])

    const loadBooks = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetchEvents()
            // Pastikan ini mengambil data array dari respons paginated atau non-paginated
            const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setBooks(mapBackendData(raw))
        } catch (err) {
            console.error('Gagal memuat buku', err)
            setError(err.message || 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [mapBackendData])

    useEffect(() => {
        loadBooks()
    }, [loadBooks])

    // Mengganti closeAdd/closeInline menjadi satu fungsi closeForm
    function closeForm() {
        resetFormState(); 
        setIsModalOpen(false)
    }

    function handleAdd() {
        resetFormState(); // Reset state
        setIsModalOpen(true)
    }

    // Fungsi untuk mengisi nilai dari baris tabel ke modal
    function openEditFormFromRow(book) {
        // Pengecekan ID yang lebih kuat (memastikan ID adalah string atau number yang valid)
        const bookId = book.id || book.id_buku;
        if (!bookId) { 
            console.error("Data buku yang diklik tidak memiliki ID yang valid:", book);
            alert("ID buku tidak valid.");
            return;
        }

        // Mencari ID kategori dari nama kategori yang ditampilkan di tabel
        const selectedCat = CATEGORY_OPTIONS.find((c) => c.nama === book.category)
        setForm({
            judul: book.title || '',
            pengarang: book.author || '',
            penerbit: book.penerbit || '',
            tahun: parseInt(book.year) || new Date().getFullYear(),
            isbn: book.isbn || '',
            kategori: selectedCat ? String(selectedCat.id) : '',
            stok: book.stok ?? 0,
        })
        setCurrentBookId(bookId) // ID buku disimpan di state ini
        setIsEditMode(true)
        setIsModalOpen(true) // Menggunakan modal
        setErrors({})
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
        
        const payload = {
            judul: form.judul,
            penulis: form.pengarang,
            penerbit: form.penerbit,
            tahun_terbit: form.tahun,
            isbn: form.isbn,
            id_kategori: form.kategori, // Mengirim ID kategori
            stok: form.stok,
        };

        try {
            if (isEditMode) {
                // FIX KRITIS: Menggunakan currentBookId
                if (!currentBookId) {
                    alert('Gagal: ID buku tidak ditemukan untuk diperbarui.');
                    return;
                }
                await api.post(`/buku/update/${currentBookId}`, payload);
                alert('Data Berhasil Diubah!');
            } else {
                // CREATE (Menggunakan POST ke rute create)
                await api.post('/buku/create', payload);
                alert('Data Berhasil Disimpan!');
            }
            
            loadBooks(); // Reload data setelah berhasil
            closeForm(); // Menutup form dan mereset state

        } catch (err) {
            console.error('Gagal menyimpan buku', err)
            const validationMessage = err?.response?.data?.message || err?.message || 'Unknown';
            alert('Gagal menyimpan buku: ' + validationMessage)
        }
    }

    // Fungsi untuk memicu form edit modal
    function handleEdit(book) {
        // Menggunakan modal untuk edit
        openEditFormFromRow(book);
    }

    // Fungsi untuk menghapus buku berdasarkan ID
    async function handleDelete(book) {
        const bookId = book?.id || book?.id_buku
        if (!bookId) {
            alert('Gagal: ID buku tidak ditemukan untuk dihapus.')
            return
        }
        if (!confirm(`Hapus buku ${book.title || ''} (ID: ${bookId})?`)) return
        setDeletingId(bookId)
        try {
            // Coba DELETE resource terlebih dahulu (RESTful)
            try {
               
                await api.delete(`/buku/delete/${bookId}`)
            } catch (err) {
                // Fallback: some backends expect a POST to destroy route
                 await api.delete(`/buku/${bookId}`)
            }
            // Update UI tanpa reload penuh
            setBooks(prev => prev.filter(b => (b.id || b.id_buku) !== bookId))
            alert('Data berhasil dihapus')
        } catch (err) {
            console.error('Gagal menghapus buku', err)
            alert('Gagal menghapus buku: ' + (err?.response?.data?.message || err?.message || 'Unknown'))
        } finally {
            setDeletingId(null)
        }
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
                {/* Blok isInlineOpen dihilangkan */}

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
                                                <button className="btn btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.12)' }} onClick={() => handleDelete(b)} title="Hapus" disabled={deletingId === (b?.id || b?.id_buku)}>
                                                    {deletingId === (b?.id || b?.id_buku) ? '...' : '🗑️'}
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

            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeForm}> 
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeForm} title="Tutup">✕</button> 
                        <div className="modal-header">
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0 }}>{isEditMode ? 'Edit Data Buku' : 'Tambah Data Buku'}</h3>
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
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nama}</option>
                                            ))}
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
                                <button type="submit" className="primary-cta">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</button>
                                <button type="button" className="btn btn-ghost" onClick={closeForm}>Batal</button> 
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