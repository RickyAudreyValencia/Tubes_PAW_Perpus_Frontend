import React, { useEffect, useState } from 'react'
import api, { getLoans, getBooks, acceptLoan, rejectLoan, addFineToLoan, updateStatusToPinjam } from '../../services/api'
import Footer from '../../components/Footer'

// Helper function untuk format tanggal
const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch (e) {
    return dateString
  }
}

export default function ManageLoans() {
  const [loans, setLoans] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchLoans() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await getLoans()
        const raw = Array.isArray(res) ? res : res.data || []
        console.log('Loans data:', raw) // Debug: lihat struktur data

        // Resolve book titles when API returns only book id or nested object with different keys
        // 1) Collect all book IDs that need resolution
        const bookIdSet = new Set()
        const parsedLoans = raw.map(l => {
          const titleCandidate = l.judul || l.buku?.judul || l.book?.judul || l.buku?.title || l.book?.title || l.buku?.nama || l.book?.name || l.judul_buku || l.nama_buku
          if (titleCandidate) return { ...l, resolvedTitle: titleCandidate }

          const bookId = l.id_buku || l.book_id || l.buku?.id || l.book?.id || l.buku_id || l.bukuId
          if (bookId) bookIdSet.add(bookId)
          return { ...l }
        })

        // 2) If there are book IDs, fetch them in a single batch request
        let bookMap = {}
        if (bookIdSet.size > 0) {
          try {
            const ids = Array.from(bookIdSet).join(',')
            const booksRes = await getBooks({ ids })
            const booksArr = Array.isArray(booksRes) ? booksRes : booksRes.data || booksRes
            booksArr.forEach(b => {
              const idKey = b.id || b._id || b.id_buku || b.book_id
              const title = b.judul || b.title || b.nama || b.nama_buku || b.judul_buku || b.name
              if (idKey) bookMap[String(idKey)] = title || undefined
            })
          } catch (err) {
            console.warn('Batch fetch books failed:', err)
          }
        }

        // 3) Attach resolvedTitle from bookMap when available
        const loansWithResolvedTitles = parsedLoans.map(l => {
          if (l.resolvedTitle) return l
          const bookId = l.id_buku || l.book_id || l.buku?.id || l.book?.id || l.buku_id || l.bukuId
          const resolved = bookId ? bookMap[String(bookId)] : undefined
          return { ...l, resolvedTitle: resolved }
        })

        setLoans(loansWithResolvedTitles)
      } catch (err) {
        console.error('Failed to fetch loans:', err)
        setError('Gagal memuat data peminjaman')
        setLoans([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchLoans()
  }, [])

  async function handleAccept(loan) {
    // Gunakan id_peminjaman
    const loanId = loan.id_peminjaman || loan.id
    
    console.log('Accepting loan with id_peminjaman:', loanId)
    
    if (!loanId) {
      alert('Tidak dapat menemukan ID peminjaman. Data: ' + JSON.stringify(loan))
      return
    }
    
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status peminjaman ID ${loanId} menjadi "pinjam"?`)) {
      return
    }
    
    try {
      await updateStatusToPinjam(loanId)
      alert(`Status peminjaman (ID: ${loanId}) berhasil diubah menjadi "pinjam"`)
      
      // Update local state
      setLoans(prevLoans => 
        prevLoans.map(l => 
          (l.id_peminjaman || l.id) === loanId 
            ? { ...l, status: 'pinjam' } 
            : l
        )
      )
      
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Gagal mengubah status: ' + (err.message || 'Terjadi kesalahan'))
    }
  }

  async function handleReject(loan) {
    const loanId = loan.id_peminjaman || loan.id
    
    if (!loanId) {
      alert('Tidak dapat menemukan ID peminjaman')
      return
    }
    
    if (!window.confirm('Apakah Anda yakin ingin menolak peminjaman ini?')) {
      return
    }
    
    try {
      await rejectLoan(loanId)
      alert('Peminjaman berhasil ditolak')
      
      // Update local state - remove rejected loan
      setLoans(prevLoans => prevLoans.filter(l => (l.id_peminjaman || l.id) !== loanId))
    } catch (err) {
      console.error('Error rejecting loan:', err)
      alert('Gagal menolak peminjaman: ' + (err.message || 'Terjadi kesalahan'))
    }
  }

  async function handleAddFine(loan) {
    const loanId = loan.id_peminjaman || loan.id
    
    if (!loanId) {
      alert('Tidak dapat menemukan ID peminjaman')
      return
    }
    
    const amount = prompt('Nominal denda (IDR)')
    if (!amount) return
    
    try {
      await addFineToLoan(loanId, amount)
      alert('Denda berhasil ditambahkan')
      
      // Refresh loans
      const res = await getLoans()
      const raw = Array.isArray(res) ? res : res.data || []
      setLoans(raw)
    } catch (err) {
      console.error('Error adding fine:', err)
      alert('Gagal menambahkan denda: ' + (err.message || 'Terjadi kesalahan'))
    }
  }

  return (
    <div className="container mt-4">
      <div className="card p-3">
        <h3 style={{ textAlign: 'center', marginBottom: 18 }}>Kelola Peminjaman</h3>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-danger">{error}</div>}
        {!isLoading && !error && loans.length === 0 && <div>Tidak ada peminjaman saat ini.</div>}
        {!isLoading && !error && loans.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 900, borderCollapse: 'separate' }}>
              <colgroup>
                <col style={{ width: 50 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 260 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 120 }} />
                <col style={{ width: 200 }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '1.5px solid rgba(0,0,0,0.12)' }}>
                  <th style={{ textAlign: 'left', paddingLeft: 12, borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>No</th>
                  <th style={{ textAlign: 'center', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>Member</th>
                  <th style={{ textAlign: 'center', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>Book</th>
                  <th style={{ textAlign: 'center', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>Start</th>
                  <th style={{ textAlign: 'center', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>End</th>
                  <th style={{ textAlign: 'center', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>Status</th>
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l, i) => (
                  <tr key={l.id} style={{ borderBottom: '1.5px solid rgba(0,0,0,0.10)' }}>
                    <td style={{ paddingLeft: 12, verticalAlign: 'middle', borderRight: '1.5px solid rgba(0,0,0,0.06)' }}>{i+1}</td>
                    <td style={{ verticalAlign: 'middle', borderRight: '1.5px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>{l.member_name || l.anggota?.nama || l.user?.nama || l.user?.name || l.anggota?.name || '—'}</td>
                      <td
                        style={{
                          verticalAlign: 'middle',
                          borderRight: '1.5px solid rgba(0,0,0,0.06)',
                          textAlign: 'center'
                        }}
                      >
                        {(() => {
                          const book =
                            l.itemBuku?.buku ||
                            l.item_buku?.buku ||
                            l.itemBuku ||
                            l.item_buku ||
                            l.buku ||
                            null;

                          const title =
                            book?.judul ||
                            book?.title ||
                            l.resolvedTitle ||
                            l.judul ||
                            '—';

                          return (
                            <div
                              style={{
                                maxWidth: 240,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block'
                              }}
                              title={title}
                            >
                              {title}
                            </div>
                          );
                        })()}
                      </td>
                    <td style={{ verticalAlign: 'middle', borderRight: '1.5px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>{formatDate(l.tanggal_pinjam || l.tgl_pinjam || l.start_date || l.createdAt)}</td>
                    <td style={{ verticalAlign: 'middle', borderRight: '1.5px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>{formatDate(l.tgl_jatuh_tempo || l.tanggal_kembali || l.tgl_kembali || l.end_date || l.due_date)}</td>
                    <td style={{ verticalAlign: 'middle', borderRight: '1.5px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>{l.status || '—'}</td>
                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn btn-sm" onClick={() => handleAccept(l)} style={{ backgroundColor: '#10b981', color: '#fff', border: '1.5px solid #059669', padding: '6px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Accept</button>
                        <button className="btn btn-sm" onClick={() => handleReject(l)} style={{ backgroundColor: '#ef4444', color: '#fff', border: '1.5px solid #dc2626', padding: '6px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-4"><Footer /></div>
    </div>
  )
}
