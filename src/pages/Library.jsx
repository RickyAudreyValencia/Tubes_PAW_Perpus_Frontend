import React, { useMemo, useState, useRef, useEffect } from 'react'

const placeholder = 'https://via.placeholder.com/360x220?text=No+Image'

const SAMPLE_BOOKS = [
  { id: 1, title: 'Islamic Civilization History', author: 'Dr. Badri Yatim', year: 2000, pages: 312, isbn: '978-1111111111', category: 'History', status: 'Borrowed', rating: 4.5, reads: 980, img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80' },
  { id: 2, title: 'The Smart Rabbit', author: 'Kusumo Priyanto', year: 2015, pages: 48, isbn: '978-2222222222', category: 'Children', status: 'Available', rating: 4.8, reads: 3400, img: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', summary: 'A classic Indonesian tale about the cleverness of a rabbit.' },
  { id: 3, title: 'Steve Jobs', author: 'Walter Isaacson', year: 2011, pages: 656, isbn: '978-3333333333', category: 'Biography', status: 'Available', rating: 4.8, reads: 4700, img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', summary: 'The official biography of the founder of Apple Inc.' },
  { id: 4, title: 'Perahu Kertas', author: 'Dewi Lestari', year: 2005, pages: 312, isbn: '978-1234567890', category: 'Fiction', status: 'Available', rating: 4.2, reads: 1200, img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', summary: 'A touching modern Indonesian novel about love and ambition.' },
  { id: 5, title: 'Belajar React', author: 'Andi Susanto', year: 2021, pages: 256, isbn: '978-0987654321', category: 'Technology', status: 'Available', rating: 4.1, reads: 800, img: 'https://images.unsplash.com/photo-1526378727007-2d4b7f9d9a1b?auto=format&fit=crop&w=800&q=80', summary: 'A hands-on guide to building React apps for beginners.' },
  { id: 6, title: 'JavaScript Modern', author: 'Budi Santoso', year: 2019, pages: 480, isbn: '978-1122334455', category: 'Technology', status: 'Available', rating: 4.6, reads: 2200, img: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', summary: 'Modern patterns and practices for JavaScript developers.' },
  { id: 7, title: 'Desain Web', author: 'Siti Rahma', year: 2018, pages: 200, isbn: '978-6677889900', category: 'Technology', status: 'Available', rating: 4.0, reads: 600, img: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80', summary: 'Practical principles for designing usable web interfaces.' },
  { id: 8, title: 'Child Tales', author: 'Anna Nur', year: 2017, pages: 120, isbn: '978-4444444444', category: 'Children', status: 'Available', rating: 4.3, reads: 1500, img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', summary: 'A collection of short moral tales for children.' },
  { id: 9, title: 'World History', author: 'M. Hidayat', year: 2010, pages: 420, isbn: '978-5555555555', category: 'History', status: 'Available', rating: 4.4, reads: 2100, img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80', summary: 'A survey of major events that shaped the modern world.' },
]

const CATEGORIES = ['All','Fiction','Non-Fiction','Technology','History','Biography','Children']

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

  const filtersActive = availability !== 'All' || minRating > 0
  const filtered = useMemo(()=>{
    let list = SAMPLE_BOOKS.slice()
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q))
    }
    if (category !== 'All') list = list.filter(b => b.category === category)
    if (sortBy === 'Popular') list.sort((a,b)=> b.reads - a.reads)
    if (sortBy === 'Newest') list.sort((a,b)=> b.year - a.year)
    if (availability && availability !== 'All') list = list.filter(b=> b.status === availability)
    if (minRating > 0) list = list.filter(b => (b.rating || 0) >= minRating)
    return list
  },[query,category,sortBy,availability,minRating])

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
            <div>Showing <strong>{filtered.length}</strong> of <strong>{SAMPLE_BOOKS.length}</strong> books</div>
            <div>Sort: <strong>{sortBy}</strong></div>
          </div>

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