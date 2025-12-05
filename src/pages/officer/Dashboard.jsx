import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
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
        <p className="text-muted">Ringkasan Laporan Aktivitas Perpustakaan</p>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card p-4" style={{ margin: '0 auto', maxWidth: 800 }}>
              <h5 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#0d2b40', marginBottom: 24 }}>Pinjaman per Bulan</h5>
              <div className="mt-2" style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {
                  (() => {
                    const arr = stats.loans || []
                    const counts = arr.map(l => Number(l.count) || 0)
                    const total = counts.reduce((s, v) => s + v, 0)
                    if (total === 0) return <div className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>📊 Belum ada data pinjaman</div>
                    
                    const chartData = {
                      labels: arr.map(l => l.monthShort || l.month),
                      datasets: [
                        {
                          label: 'Jumlah Peminjaman',
                          data: counts,
                          backgroundColor: [
                            'rgba(23, 162, 184, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(168, 85, 247, 0.8)'
                          ],
                          borderColor: [
                            '#17a2b8',
                            '#10b981',
                            '#3b82f6',
                            '#f59e0b',
                            '#ef4444',
                            '#a855f7'
                          ],
                          borderWidth: 2,
                          borderRadius: 8,
                          barPercentage: 0.7
                        }
                      ]
                    }

                    const options = {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                          position: 'top',
                          labels: {
                            font: { size: 14, weight: 600 },
                            color: '#0d2b40',
                            padding: 20
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            font: { size: 12 },
                            color: '#6b7280',
                            stepSize: 1,
                            callback: function(value) {
                              if (Number.isInteger(value)) {
                                return value
                              }
                            }
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          ticks: {
                            font: { size: 12 },
                            color: '#6b7280'
                          },
                          grid: {
                            display: false
                          }
                        }
                      }
                    }

                    return <Bar data={chartData} options={options} style={{ maxHeight: 250 }} />
                  })()
                }
              </div>
              <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb', fontSize: '0.95rem', color: '#6b7280' }}>
                Total Peminjaman: <strong style={{ color: '#0d2b40', fontSize: '1.1rem' }}>{(stats.loans || []).reduce((s, l) => s + (Number(l.count) || 0), 0)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a 
                className="btn" 
                href="/petugas/loans"
                style={{
                  flex: '1 1 200px',
                  maxWidth: 400,
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                  color: '#fff',
                  border: '2px solid #0d7a8f',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(23, 162, 184, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.3)';
                }}
              >
                📋 Kelola Peminjaman
              </a>
              <a 
                className="btn" 
                href="/petugas/books"
                style={{
                  flex: '1 1 200px',
                  maxWidth: 400,
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: '2px solid #047857',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                📚 Kelola Buku
              </a>
            </div>
          </div>
        </div>

      </div>
      <div className="mt-4"><Footer /></div>
    </div>
  )
}
