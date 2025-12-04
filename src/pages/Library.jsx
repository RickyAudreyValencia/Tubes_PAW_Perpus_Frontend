import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { fetchEvents, createLoan, createReview } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

const CATEGORIES = ['All','Fiction','Non-Fiction','Technology','History','Biography','Children']

const CATEGORY_MAP = { 
    History: 'History',
    Children: 'Children',
    Biography: 'Biography',
    Fiction: 'Fiction',
    Technology: 'Technology',
}

export default function Library() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [availability, setAvailability] = useState('All')
  const [minRating, setMinRating] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedBook, setSelectedBook] = useState(null)
  const [borrowStart, setBorrowStart] = useState('')
  const [borrowEnd, setBorrowEnd] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const perPage = 6
  const filterRef = useRef(null)

  const [allBooks, setAllBooks] = useState([]) 
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const mapBackendData = useCallback((data) => {
    return data.map(buku => {
      // Support multiple ID field names from backend
      const bookId = buku.id || buku.id_buku || buku.ID || null
      
      if (!bookId) {
        console.warn('Book without ID found:', buku)
      }

      // Determine availability status more robustly.
      // Prefer explicit numeric availability fields if provided, otherwise
      // infer from common textual status values. Default to AVAILABLE
      // to avoid incorrectly marking items as borrowed when backend
      // doesn't send a status field.
      const jumlahTersedia = buku.jumlah_tersedia ?? buku.stok ?? buku.available_count ?? null
      let isAvailable = true

      if (typeof jumlahTersedia === 'number') {
        isAvailable = jumlahTersedia > 0
      } else if (typeof buku.status === 'string') {
        const s = buku.status.toLowerCase()
        // treat as borrowed if status contains these keywords
        const borrowedKeywords = ['borrow', 'borrowed', 'dipinjam', 'unavailable', 'taken']
        isAvailable = !borrowedKeywords.some(k => s.includes(k))
      } else {
        // no useful info from backend: default to available
        isAvailable = true
      }
      // expose numeric available count when provided by backend
      const availableCount = (typeof jumlahTersedia === 'number') ? jumlahTersedia : null

      return {
        id: bookId,
        id_buku: bookId, // Also store as id_buku for backend API
        title: buku.judul || 'No Title',
        author: buku.penulis || 'Unknown Author',
        year: buku.tahun || 0,
        pages: buku.halaman || 0,
        isbn: buku.isbn || 'N/A',
        category: buku.kategori?.nama || 'Non-Fiction',
        status: isAvailable ? 'Available' : 'Borrowed',
        available: availableCount, // number or null when unknown
        rating: buku.rating || 0,
        reads: buku.dibaca || 0,
        img: buku.gambar_sampul || placeholder,
        summary: buku.deskripsi || 'No description available.',
      }
    });
  }, [])
  
  const fetchAllBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const responseData = await fetchEvents()
      const rawBooks = Array.isArray(responseData.data) ? responseData.data : responseData
      const mappedBooks = mapBackendData(rawBooks)
      setAllBooks(mappedBooks)
      setIsLoading(false)
    } catch (err) {
      console.error('Gagal memuat buku:', err)
      setError(`Gagal memuat data buku: ${err.message}.`)
      setIsLoading(false)
      setAllBooks([])
    }
  }, [mapBackendData])

  useEffect(() => {
    fetchAllBooks()
  }, [fetchAllBooks])

  const filtersActive = availability !== 'All' || minRating > 0

  const filtered = useMemo(() => {
    let list = [...allBooks]
    
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
      )
    }

    if (category !== 'All') {
      list = list.filter(b => CATEGORY_MAP[b.category] === category)
    }

    if (sortBy === 'Popular') list.sort((a,b)=> (b.reads || 0) - (a.reads || 0))
    if (sortBy === 'Newest') list.sort((a,b)=> (b.year || 0) - (a.year || 0))

    if (availability !== 'All') {
      list = list.filter(b => b.status === availability)
    }

    if (minRating > 0) {
      list = list.filter(b => b.rating >= minRating)
    }

    return list
  }, [allBooks, query, category, sortBy, availability, minRating])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const start = (page-1)*perPage
  const pageItems = filtered.slice(start, start+perPage)

  const goto = (p) => setPage(p)

  useEffect(() => {
    function onDocClick(e){
      if (filtersOpen && filterRef.current && !filterRef.current.contains(e.target)) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return ()=> document.removeEventListener('mousedown', onDocClick)
  }, [filtersOpen])


  if (isLoading) return <div className="container mt-4 text-center">Memuat Data Buku...🔄</div>
  if (error)     return <div className="container mt-4 text-center text-danger">Kesalahan: {error}</div>


  return (
    <div className="container mt-4 library-collection">
      <div className="collection-header">
        <small className="muted">Book Collection</small>
        <h2>Discover and explore our extensive digital library</h2>
      </div>

      {/* SEARCH PANEL */}
      <div className="search-panel card p-3 mb-4">
        <div className="row" style={{alignItems:'center'}}>
          
          {/* QUERY INPUT */}
          <div className="col-md-8">
            <div className="search-row">
              <input 
                className="search-input" 
                placeholder="Search books, authors, topics..." 
                value={query} 
                onChange={(e)=>{ setQuery(e.target.value); setPage(1)}}
              />
              <button className="btn btn-search">Search</button>
            </div>

            <div className="filter-chips mt-3">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`chip ${category===cat? 'active':''}`} 
                  onClick={()=>{ setCategory(cat); setPage(1)}}
                >{cat}</button>
              ))}
            </div>
          </div>

          {/* FILTERS */}
          <div className="col-md-4 text-end">
            <div className="controls">

              <div className="filter-wrap" ref={filterRef}>
                <button 
                  className={`btn btn-ghost ${filtersActive?'active':''}`} 
                  onClick={()=>setFiltersOpen(v=>!v)}
                >
                  Filter ▾
                </button>

                <div className={`filter-panel ${filtersOpen ? 'open':''}`}>
                  <h4>Filter books</h4>

                  <label className="muted small">Availability</label>
                  <select 
                    className="form-control" 
                    value={availability} 
                    onChange={(e)=>{ setAvailability(e.target.value); setPage(1)}}
                  >
                    <option value="All">All</option>
                    <option value="Available">Available</option>
                    <option value="Borrowed">Borrowed</option>
                  </select>

                  <label className="muted small mt-2">Minimum Rating</label>
                  <select 
                    className="form-control" 
                    value={minRating} 
                    onChange={(e)=>{ setMinRating(Number(e.target.value)); setPage(1)}}
                  >
                    <option value={0}>Any</option>
                    <option value={4}>≥ 4.0</option>
                    <option value={4.5}>≥ 4.5</option>
                    <option value={4.8}>≥ 4.8</option>
                  </select>

                  <div style={{display:'flex', gap:8, marginTop:12}}>
                    <button className="btn btn-ghost" onClick={()=>{
                      setAvailability('All')
                      setMinRating(0)
                      setPage(1)
                      setFiltersOpen(false)
                    }}>Reset</button>

                    <button className="btn primary-cta" onClick={()=>{
                      setFiltersOpen(false)
                      setPage(1)
                    }}>Apply</button>
                  </div>
                </div>
              </div>

              <div className="sort-by">Sort by:
                <select value={sortBy} onChange={(e)=> setSortBy(e.target.value)}>
                  <option>Popular</option>
                  <option>Newest</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="book-grid">
        {pageItems.map(b=> (
          <div key={b.id} className="book-card">

            <div className="card-top">
              <img
  className="card-bg-img"
  src={b.img.startsWith('http') ? b.img : encodeURI(`http://localhost:8000/${b.img}`)}
  onError={(e) => e.target.src = placeholder}
/>


              <div className="bookmark">🔖</div>
              <div className={`status ${b.status==='Available'?'available':'borrowed'}`}>
                {b.status}
                {typeof b.available === 'number' ? ` • ${b.available}` : ''}
              </div>
            </div>

            <div className="card-body p-3">
              <div className="chip small">{b.category}</div>
              <h4>{b.title}</h4>
              <div className="meta small">{b.author} • {b.year}</div>
              <p className="desc">{b.summary}</p>

              <div className="meta-row">
                <span>⭐ {b.rating}</span>
                <span>{b.pages}p</span>
                <span>{b.reads.toLocaleString()}</span>
              </div>

              <div className="card-footer">
                {((typeof b.available === 'number') ? (b.available > 0) : (b.status === 'Available')) ? (
                  <>
                    <button 
                      className="btn primary-cta btn-block"
                      onClick={()=>{
                        setSelectedBook(b)
                        setBorrowStart(new Date().toISOString().slice(0,10))
                        setBorrowEnd(new Date(Date.now()+7*24*3600*1000).toISOString().slice(0,10))
                      }}
                    >
                      Borrow Now
                    </button>

                    <button 
                      className="btn btn-ghost btn-block mt-2"
                      onClick={async ()=>{
                        const comment = prompt('Write a review (optional):')
                        if (comment?.trim()) {
                          try {
                            await createReview(b.id, { comment, rating: 5 })
                            alert('Review submitted!')
                          } catch {
                            alert('Failed to submit review')
                          }
                        }
                      }}
                    >
                      Write Review
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="btn btn-ghost btn-block" 
                      disabled
                      style={{opacity: 0.6, cursor: 'not-allowed'}}
                    >
                      Currently Borrowed
                    </button>
                    <button 
                      className="btn btn-ghost btn-block mt-2"
                      onClick={async ()=>{
                        const comment = prompt('Write a review (optional):')
                        if (comment?.trim()) {
                          try {
                            await createReview(b.id, { comment, rating: 5 })
                            alert('Review submitted!')
                          } catch {
                            alert('Failed to submit review')
                          }
                        }
                      }}
                    >
                      Write Review
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* MODAL PINJAM */}
      {selectedBook && (
        <div className="modal-overlay" onClick={()=> setSelectedBook(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>

            <button className="modal-close" onClick={()=> setSelectedBook(null)}>✕</button>
            <h3 style={{marginBottom: '20px', color: '#333'}}>Borrow: {selectedBook.title}</h3>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px'}}>
                📅 Loan Start Date
              </label>
              <input 
                type="date" 
                className="form-control" 
                value={borrowStart} 
                onChange={(e)=>setBorrowStart(e.target.value)}
                style={{padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px'}}>
                📅 Return Date
              </label>
              <input 
                type="date" 
                className="form-control" 
                value={borrowEnd} 
                onChange={(e)=>setBorrowEnd(e.target.value)}
                style={{padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
              />
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px'}}>
                💳 Payment Method
              </label>
              <select 
                className="form-control" 
                value={paymentMethod} 
                onChange={(e)=>setPaymentMethod(e.target.value)}
                style={{padding: '10px', borderRadius: '4px', border: '1px solid #ddd'}}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Credit Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div style={{
              backgroundColor: '#f0f8f9',
              padding: '15px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#666'
            }}>
              <p style={{margin: '5px 0'}}>
                <strong>Loan Duration:</strong> {
                  borrowStart && borrowEnd 
                    ? Math.ceil((new Date(borrowEnd) - new Date(borrowStart)) / (1000 * 60 * 60 * 24)) + ' days'
                    : 'Select dates'
                }
              </p>
              <p style={{margin: '5px 0'}}>
                <strong>Status:</strong> <span style={{color: '#00acc1', fontWeight: '600'}}>
                  {typeof selectedBook.available === 'number' ? (
                    `${selectedBook.available} available`
                  ) : (
                    selectedBook.status
                  )}
                </span>
              </p>
            </div>

            <div style={{display:'flex', gap:12, marginTop:20}}>
              <button 
                className="primary-cta"
                onClick={async ()=>{
                  try {
                    // Get user ID from context
                    const userId = user?.id_anggota || user?.id
                    if (!userId) {
                      alert('User ID not found. Please login again.')
                      return
                    }

                    // Validate book ID
                    if (!selectedBook?.id && !selectedBook?.id_buku) {
                      console.error('Selected book:', selectedBook)
                      alert('Book ID not found. Please try again.')
                      return
                    }

                    // Validate dates
                    if (!borrowStart || !borrowEnd) {
                      alert('Please select both start and return dates')
                      return
                    }

                    // Prevent borrowing when stock is known to be zero
                    if (typeof selectedBook.available === 'number' && selectedBook.available <= 0) {
                      alert('This book is currently out of stock.')
                      return
                    }

                    const bookId = selectedBook.id || selectedBook.id_buku
                    const loanPayload = {
                      id_anggota: userId,
                      id_buku: bookId,
                      tanggal_pinjam: borrowStart,
                      tanggal_kembali: borrowEnd,
                      metode_pembayaran: paymentMethod,
                    }
                    
                    console.log('Creating loan with payload:', loanPayload)
                    console.log('Selected book:', selectedBook)
                    
                    await createLoan(loanPayload)

                    // OPTIMISTIC: decrement local stock if we know the count
                    setAllBooks(prev => prev.map(item => {
                      if (item.id === bookId) {
                        if (typeof item.available === 'number') {
                          const newAvailable = Math.max(0, item.available - 1)
                          const newStatus = (newAvailable <= 0) ? 'Borrowed' : item.status
                          return { ...item, available: newAvailable, status: newStatus }
                        }
                      }
                      return item
                    }))

                    alert('Loan requested successfully!')
                    setSelectedBook(null)
                    // still refresh from server to be certain
                    fetchAllBooks()
                  } catch (err) {
                    console.error('Loan creation error:', err)
                    const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error'
                    alert('Failed to request loan: ' + errorMsg)
                  }
                }}
                style={{flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600'}}
              >
                ✓ Confirm & Request Loan
              </button>

              <button 
                className="btn btn-ghost" 
                onClick={()=>setSelectedBook(null)}
                style={{flex: 1, padding: '12px', fontSize: '14px'}}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="pagination-row">
        <button className="btn btn-ghost" onClick={()=>goto(page-1)} disabled={page===1}>Previous</button>
        {Array.from({length:pages}).map((_,i)=> (
          <button 
            key={i} 
            className={`chip ${page===i+1?'active':''}`} 
            onClick={()=>goto(i+1)}
          >
            {i+1}
          </button>
        ))}
        <button className="btn btn-ghost" onClick={()=>goto(page+1)} disabled={page===pages}>Next</button>
      </div>

    </div>
  )
}
