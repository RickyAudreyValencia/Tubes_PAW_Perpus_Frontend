import React, { useEffect, useState } from 'react'
import api, { getLoans } from '../../services/api'
import Footer from '../../components/Footer'

export default function OfficerDashboard() {
  const [stats, setStats] = useState({ loans: [], topBooks: [] })

  useEffect(() => {
    // Fetch reports if backend provides statistics
    let mounted = true
    Promise.all([
      api.get('/reports/loans-per-month').catch(()=>({data: {}})),
      api.get('/buku/top').catch(()=>({data: {}})),
    ]).then(async ([loans, topBooks]) => {
      if (!mounted) return
      let loansData = loans.data?.data || []
      // If reports endpoint returned empty, fallback to aggregating from raw loans
      console.log('reports loans raw:', loans)
      if ((!loansData || loansData.length === 0)) {
        try {
          const raw = await getLoans()
          const arr = Array.isArray(raw) ? raw : raw.data || raw.data?.data || raw
          // aggregate counts by month (YYYY-MM)
          const map = {}
          arr.forEach(item => {
            const dateStr = item.tanggal_pinjam || item.tgl_pinjam || item.start_date || item.createdAt || item.tanggal || item.date
            if (!dateStr) return
            const d = new Date(dateStr)
            if (Number.isNaN(d.getTime())) return
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
            map[key] = (map[key] || 0) + 1
          })
          // ensure last 6 months present (fill zeros)
          const now = new Date()
          const months = []
          for (let i = 5; i >= 0; i--) {
            const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`
            const monthShort = dt.toLocaleString('id-ID', { month: 'short' })
            months.push({ key, monthShort, count: map[key] || 0 })
          }
          loansData = months.map(m => ({ month: m.key, monthShort: m.monthShort, count: m.count }))
          console.log('aggregated loans per month (fallback):', loansData)
        } catch (e) {
          console.warn('Failed to aggregate loans for chart fallback', e)
          loansData = []
        }
      }

      setStats({ loans: loansData, topBooks: topBooks.data?.data || [] })
    }).catch(() => {})
    return () => mounted = false
  }, [])

  return (
    <div className="container mt-4">
      <div className="card p-4">
        <h2>Dashboard Petugas</h2>
        <p className="text-muted">Ringkasan aktivitas perpustakaan (pinjaman, stok buku, dan laporan).</p>

        <div className="row mt-4">
          <div className="col-md-6 mb-3">
            <div className="card p-3">
              <h5>Pinjaman per Bulan</h5>
              <div className="mt-2" style={{ minHeight: 160 }}>
                {/* Simple bars as placeholder if no chart lib available */}
                {
                  // compute totals and max for better scaling
                  (() => {
                    const arr = stats.loans || []
                    const counts = arr.map(l => Number(l.count) || 0)
                    const total = counts.reduce((s, v) => s + v, 0)
                    if (total === 0) return <div className="text-muted">No data yet</div>
                    const max = Math.max(...counts, 1)
                    return (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'end', height: 140 }}>
                        {arr.map((l, i) => {
                          const cnt = Number(l.count) || 0
                          const heightPct = Math.round((cnt / max) * 100)
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <div style={{ fontSize: 12, color: 'var(--library-accent)', fontWeight: 600 }}>{cnt}</div>
                              <div style={{ display: 'flex', alignItems: 'flex-end', height: 100, width: '100%', padding: '0 6px' }}>
                                <div style={{ height: `${heightPct}%`, background: 'linear-gradient(180deg, var(--library-accent), var(--library-warm))', width: '100%', borderRadius: 6 }} title={`${l.month} - ${cnt} loans`} />
                              </div>
                              <div style={{ fontSize: 10, textAlign: 'center' }}>{l.monthShort || l.month}</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()
                }
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card p-3">
              <h5>Buku Teratas</h5>
              <ol>
                {(stats.topBooks?.length && stats.topBooks.length > 0) ? (
                  stats.topBooks.map((tb, idx) => (<li key={idx}>{tb.judul || tb.title || tb.name} ({tb.count || tb.times || '-'})</li>))
                ) : (
                  <>
                    <li>Belajar React (120)</li>
                    <li>Perahu Kertas (86)</li>
                    <li>JavaScript Modern (68)</li>
                  </>
                )}
              </ol>
            </div>
          </div>

        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div style={{ display: 'flex', gap: 10 }}>
              <a className="btn btn-outline-secondary" href="/petugas/loans">Kelola Peminjaman</a>
              <a className="btn primary-cta" href="/petugas/books">Kelola Buku</a>
            </div>
          </div>
        </div>

      </div>
      <div className="mt-4"><Footer /></div>
    </div>
  )
}
