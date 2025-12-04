import React, { useRef, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js'
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)
import Footer from '../../components/Footer'

export default function Reports() {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Loans', data: [30, 55, 40, 60, 68, 52], backgroundColor: 'rgba(0,163,196,0.8)' }
    ]
  }
  const options = { responsive: true, plugins:{legend:{display:false}} }
  // Placeholder stats / export options for officer
  return (
    <div className="container mt-4">
      <div className="card p-3">
        <h3>Reports</h3>
        <p className="text-muted">Export & view reports for loans, fines, and book usage.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline-secondary">Export CSV</button>
          <button className="primary-cta">View Charts</button>
        </div>
        <div className="mt-3">
          <div style={{ maxWidth: 800 }}>
            <Bar data={chartData} options={options} />
          </div>
        </div>
      </div>
      <div className="mt-4"><Footer /></div>
    </div>
  )
}
