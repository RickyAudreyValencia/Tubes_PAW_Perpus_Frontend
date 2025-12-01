import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { fetchEvents } from '../services/api'; // Mengubah path import
// Catatan: Nama fungsi fetchEvents seharusnya fetchBooks, tapi saya akan mengikuti nama yang Anda berikan.

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

// Hapus SAMPLE_BOOKS karena data akan diambil dari backend
// const SAMPLE_BOOKS = [...] 

const CATEGORIES = ['All','Fiction','Non-Fiction','Technology','History','Biography','Children']
const CATEGORY_MAP = { // Peta Kategori untuk penamaan di frontend
    'History': 'History', 
    'Children': 'Children', 
    'Biography': 'Biography', 
    'Fiction': 'Fiction', 
    'Technology': 'Technology',
    // Tambahkan kategori lain sesuai data backend jika namanya berbeda
}

export default function Library() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [availability, setAvailability] = useState('All')
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(1)
  const perPage = 6
  const filterRef = useRef(null)

  // State baru untuk menyimpan semua data buku dari backend
  const [allBooks, setAllBooks] = useState([]) 
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fungsi untuk memetakan data dari format backend ke format frontend (SAMPLE_BOOKS)
  const mapBackendData = useCallback((data) => {
    // Asumsi data backend: judul, penulis, tahun, status, deskripsi, gambar, kategori.nama
    return data.map(buku => ({
      id: buku.id,
      title: buku.judul || 'No Title',
      author: buku.penulis || 'Unknown Author',
      year: buku.tahun || 0,
      pages: buku.halaman || 0, // Menggunakan properti 'halaman' jika ada
      isbn: buku.isbn || 'N/A', 
      // Asumsi kategori datang dari relasi 'kategori' dan memiliki properti 'nama'
      category: buku.kategori?.nama || 'Non-Fiction', 
      status: buku.status || 'Available', 
      rating: buku.rating || 0, // Menggunakan properti 'rating' jika ada
      reads: buku.dibaca || 0, // Menggunakan properti 'dibaca' jika ada
      img: buku.gambar || placeholder, // Menggunakan properti 'gambar'
      summary: buku.deskripsi || 'No description available.',
    }));
  }, [])
  
  // Fungsi untuk mengambil data dari API
  const fetchAllBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Panggil fungsi API. Asumsi fetchEvents mengembalikan SEMUA buku
      const responseData = await fetchEvents()
      
      // Karena backend menggunakan pagination, data yang sebenarnya ada di responseData.data
      // Jika API Anda dimodifikasi untuk mengembalikan SEMUA data, 
      // mungkin Anda hanya perlu responseData
      const rawBooks = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : [])

      const mappedBooks = mapBackendData(rawBooks)
      setAllBooks(mappedBooks)
      setIsLoading(false)
    } catch (err) {
      console.error('Gagal memuat buku:', err)
      setError(`Gagal memuat data buku: ${err.message}.`)
      setIsLoading(false)
      setAllBooks([])
    }
  }, [mapBackendData]) // Dependensi mapBackendData

  useEffect(() => {
    fetchAllBooks()
  }, [fetchAllBooks])

  const filtersActive = availability !== 'All' || minRating > 0
  
  // Logika filtering/sorting/pagination LOKAL tetap sama, tapi menggunakan 'allBooks'
  const filtered = useMemo(()=>{
    // List awal adalah SEMUA buku yang diambil dari backend
    let list = allBooks.slice() 
    
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
    }
    if (category !== 'All') {
        // Filter berdasarkan kategori yang sudah di-map ke frontend
        list = list.filter(b => CATEGORY_MAP[b.category] === category) 
    }
    if (sortBy === 'Popular') list.sort((a,b)=> (b.reads || 0) - (a.reads || 0))
    if (sortBy === 'Newest') list.sort((a,b)=> (b.year || 0) - (a.year || 0))
    if (availability && availability !== 'All') list = list.filter(b=> b.status === availability)
    if (minRating > 0) list = list.filter(b => (b.rating || 0) >= minRating)
    
    return list
  },[allBooks, query, category, sortBy, availability, minRating]) // allBooks sebagai dependensi utama

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const start = (page-1)*perPage
  const pageItems = filtered.slice(start, start+perPage)

  function goto(p){ setPage(p) }

  useEffect(()=>{
    function onDocClick(e){
      if (filtersOpen && filterRef.current && !filterRef.current.contains(e.target)) setFiltersOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return ()=> document.removeEventListener('mousedown', onDocClick)
  },[filtersOpen])

  if (isLoading) {
      return <div className="container mt-4 text-center">Memuat Data Buku...🔄</div>
  }
  
  if (error) {
      return <div className="container mt-4 text-center text-danger">**Kesalahan:** {error}</div>
  }
  
  // Tampilan Utama
  return (
    <div className="container mt-4 library-collection">
      <div className="collection-header">
        <small className="muted">Book Collection</small>
        <h2>Discover and explore our extensive digital library</h2>
      </div>

      <div className="search-panel card p-3 mb-4">
        <div className="row" style={{alignItems:'center'}}>
          <div className="col-md-8">
            <div className="search-row">
              <input className="search-input" placeholder="Search books, authors, topics..." value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1)}} />
              <button className="btn btn-search">Search</button>
            </div>
            <div className="filter-chips mt-3">
              {CATEGORIES.map(cat => (
                <button key={cat} className={`chip ${category===cat? 'active':''}`} onClick={()=>{ setCategory(cat); setPage(1)}}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="col-md-4 text-end">
            <div className="controls">
              <div className="filter-wrap" style={{ position: 'relative' }} ref={filterRef}>
                <button className={`btn btn-ghost ${filtersActive? 'active':''}`} type="button" onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen} aria-controls="filter-panel">Filter ▾</button>
                <div id="filter-panel" className={`filter-panel ${filtersOpen ? 'open':''}`} role="dialog" aria-hidden={!filtersOpen}>
                  <h4 style={{margin:'0 0 8px 0'}}>Filter books</h4>
                  <div className="field">
                    <label className="muted small">Availability</label>
                    <select className="form-control" value={availability} onChange={(e)=>{ setAvailability(e.target.value); setPage(1) }}>
                      <option value="All">All</option>
                      <option value="Available">Available</option>
                      <option value="Borrowed">Borrowed</option>
                    </select>
                  </div>
                  <div className="field" style={{marginTop:8}}>
                    <label className="muted small">Minimum rating</label>
                    <select className="form-control" value={minRating} onChange={(e)=>{ setMinRating(Number(e.target.value)); setPage(1) }}>
                      <option value={0}>Any</option>
                      <option value={4}>≥ 4.0</option>
                      <option value={4.5}>≥ 4.5</option>
                      <option value={4.8}>≥ 4.8</option>
                    </select>
                  </div>
                  <div style={{display:'flex', gap:8, marginTop:12}}>
                    <button className="btn btn-ghost" type="button" onClick={()=>{ setAvailability('All'); setMinRating(0); setPage(1); setFiltersOpen(false); }}>Reset</button>
                    <button className="btn primary-cta" type="button" onClick={()=>{ setPage(1); setFiltersOpen(false); }}>Apply</button>
                  </div>
                </div>
              </div>
              <button className="btn-trending">Trending</button>
              <div className="sort-by">Sort by: 
                <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
                  <option>Popular</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

          <div className="d-flex justify-between mb-3">
            <div>Showing {pageItems.length} of {total} books</div>
            <div>Sort: {sortBy}</div>
          </div>
          
      {filtered.length === 0 && !isLoading && (
          <div className="text-center mt-5">Tidak ada buku yang cocok dengan kriteria pencarian/filter.</div>
      )}

      <div className="book-grid">
        {pageItems.map(b=> (
          <div key={b.id} className="book-card">
            <div className="card-top">
              <img className="card-bg-img" src={b.img} alt={b.title} onError={(e)=>{ e.target.src = placeholder }} />
              <div className="bookmark">🔖</div>
              <div className={`status ${b.status==='Available' ? 'available':'borrowed'}`}>{b.status}</div>
          
            </div>
            <div className="card-body p-3">
              <div className="chip small">{b.category}</div>
              <h4 className="book-title">{b.title}</h4>
              <div className="meta small text-muted">{b.author} • {b.year}</div>
              <p className="desc">{b.summary || 'No description available.'}</p>
              <div className="meta-row">
                <div>⭐ {b.rating}</div>
                <div>{b.pages}p</div>
                <div>{b.reads.toLocaleString()}</div>
              </div>
              <div className="card-footer">
                {b.status==='Available' ? <button className="btn primary-cta btn-block">Borrow Now</button> : <button className="btn btn-ghost btn-block" disabled>Currently Borrowed</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-row">
        <button className="btn btn-ghost" onClick={()=>goto(Math.max(1,page-1))} disabled={page===1}>Previous</button>
        {Array.from({length:pages}).map((_,i)=> (
          <button key={i} className={`chip ${page===i+1? 'active':''}`} onClick={()=>goto(i+1)}>{i+1}</button>
        ))}
        <button className="btn btn-ghost" onClick={()=>goto(Math.min(pages,page+1))} disabled={page===pages}>Next</button>
      </div>
    </div>
  )
}