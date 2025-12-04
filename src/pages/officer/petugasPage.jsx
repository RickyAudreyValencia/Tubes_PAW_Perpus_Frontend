import React, { useEffect, useState, useCallback } from 'react'
import { fetchEvents, getCategories, createBook, updateBook, deleteBook } from '../../services/api'
import Footer from '../../components/Footer'

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

// Fallback kategori jika API tidak tersedia
const DEFAULT_CATEGORY_OPTIONS = [
    { id: '1', nama: "Sains" }, 
    { id: '2', nama: "Teknologi" },
    { id: '3', nama: "Fiksi" },
    { id: '4', nama: "Non-Fiksi" }
]

export default function PetugasPage() {
    const [categoryOptions, setCategoryOptions] = useState([])
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
        kategori: '',
        stok: 0,
        deskripsi: '',
        gambar: '',
    })
    const [gambarFile, setGambarFile] = useState(null)
    const [gambarPreview, setGambarPreview] = useState('')
    const [errors, setErrors] = useState({})

    // Fungsi helper untuk mereset semua state modal/form
    const resetFormState = () => {
        setErrors({})
        setForm({ judul: '', pengarang: '', penerbit: '', tahun: new Date().getFullYear(), isbn: '', kategori: '', stok: 0, deskripsi: '', gambar: '' })
        setGambarFile(null)
        setGambarPreview('')
        setIsEditMode(false)
        setCurrentBookId(null)
    }

    const mapBackendData = useCallback((data) => {
        return data.map((buku) => {
            const categoryId = buku.kategori?.id || buku.id_kategori || buku.kategori;
            const categoryOption = categoryOptions.find(c => String(c.id) === String(categoryId));
            const categoryName = categoryOption 
                                 ? categoryOption.nama 
                                 : buku.kategori?.nama 
                                 || (typeof buku.kategori === 'string' || typeof buku.kategori === 'number' ? `ID: ${buku.kategori}` : 'Unknown');

            return {
                id: buku.id || buku.id_buku,
                title: buku.judul || 'No Title',
                author: buku.penulis || buku.pengarang || 'Unknown',
                penerbit: buku.penerbit || 'Unknown',
                year: buku.tahun_terbit || buku.tahun || '-',
                isbn: buku.isbn || 'N/A',
                category: categoryName,
                stok: buku.stok ?? 1,
                img: buku.gambar || placeholder,
                deskripsi: buku.deskripsi || '',
            }
        })
    }, [categoryOptions])

    const loadBooks = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetchEvents()
            const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);
            setBooks(mapBackendData(raw))
        } catch (err) {
            console.error('Gagal memuat buku', err)
            setError(err.message || 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [mapBackendData])

    useEffect(() => { loadBooks() }, [loadBooks])
    useEffect(() => {
        let mounted = true
        getCategories().then(res => {
            const list = Array.isArray(res?.data) ? res.data : res?.data?.data || []
            console.log('Kategori dari API:', list)
            if (mounted) {
                if (list.length) {
                    const mapped = list.map(c => ({ 
                        id: c.id || c.id_kategori || c.id_category, 
                        nama: c.nama || c.name || c.category_name 
                    }))
                    console.log('Kategori setelah mapping:', mapped)
                    setCategoryOptions(mapped)
                } else {
                    // Gunakan fallback kategori jika API kosong
                    console.log('API kategori kosong, menggunakan DEFAULT_CATEGORY_OPTIONS')
                    setCategoryOptions(DEFAULT_CATEGORY_OPTIONS)
                }
            }
        }).catch((err) => {
            console.error('Error loading kategori:', err)
            // Fallback ke default kategori jika API gagal
            if (mounted) {
                console.log('API kategori gagal, menggunakan DEFAULT_CATEGORY_OPTIONS')
                setCategoryOptions(DEFAULT_CATEGORY_OPTIONS)
            }
        })
        return () => mounted = false
    }, [])

    function closeForm() { resetFormState(); setIsModalOpen(false) }
    function handleAdd() { resetFormState(); setIsModalOpen(true) }
    function openEditFormFromRow(book) {
        const bookId = book.id || book.id_buku;
        if (!bookId) { console.error('Invalid book id', book); alert('ID buku tidak valid'); return }
        const selectedCat = categoryOptions.find((c) => c.nama === book.category)
        setForm({ judul: book.title || '', pengarang: book.author || '', penerbit: book.penerbit || '', tahun: parseInt(book.year) || new Date().getFullYear(), isbn: book.isbn || '', kategori: selectedCat ? String(selectedCat.id) : '', stok: book.stok ?? 0, deskripsi: book.deskripsi || '', gambar: book.img || '' })
        setGambarFile(null)
        setGambarPreview(book.img || '')
        setCurrentBookId(bookId)
        setIsEditMode(true)
        setIsModalOpen(true)
        setErrors({})
    }

    function updateField(name, value) { setForm(prev => ({ ...prev, [name]: value })) }

    function handleGambarFileChange(e) {
        const file = e.target.files && e.target.files[0]
        try {
            if (gambarPreview && gambarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(gambarPreview)
            }
        } catch (err) {
            // ignore
        }
        if (file) {
            setGambarFile(file)
            setGambarPreview(URL.createObjectURL(file))
            // clear any manual URL when a file is selected
            setForm(prev => ({ ...prev, gambar: '' }))
        } else {
            setGambarFile(null)
            setGambarPreview('')
        }
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
        e?.preventDefault(); if (!validate()) return
        // Build payload that is compatible with several backend expectations:
        // - send id_kategori as number when possible
        // - include kategori (name) as well in case backend expects the name column
        // - include deskripsi/gambar as empty strings to satisfy non-null columns
        const selectedCategory = categoryOptions.find(c => String(c.id) === String(form.kategori))
        // Build payload (JSON or FormData when an image file is present)
        const basePayload = {
            judul: form.judul,
            penulis: form.pengarang,
            penerbit: form.penerbit,
            tahun_terbit: Number(form.tahun) || form.tahun,
            isbn: form.isbn,
            // prefer numeric id if possible
            id_kategori: selectedCategory ? Number(selectedCategory.id) : (Number(form.kategori) || form.kategori),
            // aliases / fallbacks (some backends expect different column names)
           
            // include kategori name in case backend inserts by name (some schemas use 'kategori' as name)
            kategori: selectedCategory ? selectedCategory.nama : '',
            kategori_nama: selectedCategory ? selectedCategory.nama : '',
            stok: Number(form.stok) || form.stok,
            deskripsi: form.deskripsi || '',
            // if no file is uploaded, backend may accept a URL string in `gambar`
            gambar: form.gambar || '',
        }

        let payload
        let isFormData = false
        if (gambarFile) {
            payload = new FormData()
            // append all fields - convert non-string values as needed
            Object.keys(basePayload).forEach(key => {
                const val = basePayload[key]
                if (val !== undefined && val !== null) payload.append(key, val)
            })
            // append file under key 'gambar' (backend should handle file upload)
            payload.append('gambar', gambarFile)
            isFormData = true
        } else {
            payload = basePayload
        }
        console.log('Payload yang dikirim ke backend:', JSON.stringify(payload, null, 2))
        try {
            if (isEditMode) { 
                if (!currentBookId) { alert('ID buku tidak ditemukan'); return } 
                console.log(`Mengirim update ke /buku/update/${currentBookId}`)
                const result = await updateBook(currentBookId, payload)
                console.log('Update berhasil:', result)
                alert('Data Berhasil Diubah!') 
            }
            else { 
                console.log('Mengirim POST ke /buku/create dengan payload:', payload)
                const result = await createBook(payload)
                console.log('Create berhasil:', result)
                alert('Data Berhasil Disimpan!') 
            }
            loadBooks(); closeForm()
        } catch (err) { 
            console.error('Gagal menyimpan buku - Full Error:', err)
            console.error('Response data:', err?.response?.data)
            console.error('Response status:', err?.response?.status)
            console.error('Response headers:', err?.response?.headers)
            console.error('Request config:', err?.config)
            const errorMsg = err?.response?.data?.message 
                || err?.response?.data?.error 
                || err?.response?.data?.errors
                || err?.message 
                || 'Unknown error'
            console.error('Error message yang ditampilkan:', errorMsg)
            alert('Error: ' + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg)) 
        }
    }

    function handleEdit(book) { openEditFormFromRow(book) }

    async function handleDelete(book) {
        const bookId = book?.id || book?.id_buku; if (!bookId) { alert('ID buku tidak ditemukan'); return }
        if (!confirm(`Hapus buku ${book.title || ''} (ID: ${bookId})?`)) return
        setDeletingId(bookId)
        try { 
            await deleteBook(bookId)
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
                        <button className="primary-cta" onClick={handleAdd}>+ Tambah Buku</button>
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
                                    <th style={{ padding: '12px 16px' }}>judul buku </th>
                                    <th style={{ padding: '12px 16px' }}>Penulis</th>
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
                                                <button className="btn btn-sm" onClick={() => handleEdit(b)} title="Edit">✏️</button>
                                                <button className="btn btn-sm" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.12)' }} onClick={() => handleDelete(b)} title="Hapus" disabled={deletingId === (b?.id || b?.id_buku)}>{deletingId === (b?.id || b?.id_buku) ? '...' : '🗑️'}</button>
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
                                        <label className="form-label">Judul</label>
                                        <input className={`form-control ${errors.judul ? 'is-invalid' : ''}`} placeholder="Masukkan judul buku" value={form.judul} onChange={(e) => updateField('judul', e.target.value)} />
                                        {errors.judul && <div className="invalid-feedback">{errors.judul}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Penulis</label>
                                        <input className={`form-control ${errors.pengarang ? 'is-invalid' : ''}`} placeholder="Masukkan nama pengarang" value={form.pengarang} onChange={(e) => updateField('pengarang', e.target.value)} />
                                        {errors.pengarang && <div className="invalid-feedback">{errors.pengarang}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Penerbit</label>
                                        <input className={`form-control ${errors.penerbit ? 'is-invalid' : ''}`} placeholder="Masukkan nama penerbit" value={form.penerbit} onChange={(e) => updateField('penerbit', e.target.value)} />
                                        {errors.penerbit && <div className="invalid-feedback">{errors.penerbit}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Tahun Terbit</label>
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
                                            {categoryOptions.map(cat => (<option key={cat.id} value={cat.id}>{cat.nama}</option>))}
                                        </select>
                                        {errors.kategori && <div className="invalid-feedback">{errors.kategori}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Stok *</label>
                                        <input type="number" min="0" className={`form-control ${errors.stok ? 'is-invalid' : ''}`} value={form.stok} onChange={(e) => updateField('stok', Math.max(0, parseInt(e.target.value || 0)))} />
                                        {errors.stok && <div className="invalid-feedback">{errors.stok}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Upload Sampul (opsional)</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={handleGambarFileChange} />
                                        <small className="muted">Pilih file gambar untuk di-upload sebagai sampul. Jika kosong, Anda bisa memasukkan URL di bawah.</small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-field">
                                        <label className="form-label">Gambar (URL)</label>
                                        <input className={`form-control`} placeholder="Masukkan URL gambar atau biarkan kosong" value={form.gambar} onChange={(e) => updateField('gambar', e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-md-12" style={{ marginTop: 8 }}>
                                    {(gambarPreview || form.gambar) && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <img src={gambarPreview || form.gambar || placeholder} alt="preview" style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(0,0,0,0.06)' }} />
                                            <div style={{ flex: 1 }}>
                                                <small className="muted">Preview sampul</small>
                                                {gambarPreview && <div><small className="muted">(File lokal terpilih)</small></div>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-12">
                                    <div className="input-field">
                                        <label className="form-label">Deskripsi</label>
                                        <textarea className={`form-control`} placeholder="Deskripsi singkat buku" value={form.deskripsi} onChange={(e) => updateField('deskripsi', e.target.value)} rows={3} />
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
