import React, { useState, useEffect } from 'react';
// ASUMSI: Anda memiliki fungsi API untuk CRUD Petugas
// import api from '../services/api'; 

// Data Petugas Mock untuk simulasi
const MOCK_PETUGAS = [
    { id: 1, nama: 'Petugas Admin', email: 'admin@perpus.com', jabatan: 'Administrator' },
    { id: 2, nama: 'Petugas Ricky', email: 'ricky@perpus.com', jabatan: 'Staff Peminjaman' },
    { id: 3, nama: 'Petugas Budi', email: 'budi@perpus.com', jabatan: 'Staff Katalog' },
];

const INITIAL_FORM = {
    nama: '',
    email: '',
    jabatan: 'Staff Peminjaman',
    password: '',
    confirmPassword: '',
};

export default function ManajemenPetugasPage() {
    // Single-admin mode: frontend shows a single pre-configured officer account only
    const admin = { id: 1, nama: 'Admin', email: 'admin@gmail.com', jabatan: 'Administrator' }
    const [form, setForm] = useState(INITIAL_FORM);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPetugasId, setCurrentPetugasId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [errors, setErrors] = useState({});

    // Handler untuk membuka form (Tambah atau Edit)
    const openForm = (petugas = null) => {
        if (petugas) {
            setIsEditing(true);
            setCurrentPetugasId(petugas.id);
            setForm({ 
                nama: petugas.nama, 
                email: petugas.email, 
                jabutan: petugas.jabatan,
                password: '', // Password diabaikan saat edit data diri
                confirmPassword: '',
            });
        } else {
            setIsEditing(false);
            setForm(INITIAL_FORM);
        }
        setErrors({});
        setIsFormOpen(true);
    };

    // Handler untuk menyimpan/memperbarui data
    const handleSubmit = (e) => {
        e.preventDefault();
        // Lakukan validasi...
        // ASUMSI: Role Admin tidak perlu mengisi password saat Edit
        
        if (isEditing) {
            // Logika UPDATE
            setPetugasList(petugasList.map(p => p.id === currentPetugasId ? { ...p, ...form, id: p.id } : p));
            alert(`Petugas ${form.nama} berhasil diperbarui.`);
        } else {
            // Logika CREATE
            const newPetugas = { ...form, id: Date.now() };
            setPetugasList([...petugasList, newPetugas]);
            alert(`Petugas ${form.nama} berhasil ditambahkan.`);
        }
        setIsFormOpen(false);
    };

    // Handler untuk menghapus petugas
    const handleDelete = (id, nama) => {
        if (window.confirm(`Yakin ingin menghapus akun Petugas ${nama}?`)) {
            // Logika DELETE
            setPetugasList(petugasList.filter(p => p.id !== id));
            alert('Akun Petugas berhasil dihapus.');
        }
    };

    // Handler untuk perubahan input
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mt-4">
            <div className="card p-4">
                <h2 className="mb-4">Manajemen Akun Petugas (Deprecated)</h2>
                <p className="text-muted">Aplikasi menggunakan satu akun petugas terkonfigurasi. Untuk sementara UI pengelolaan multi-akun dinonaktifkan.</p>

                {/* CRUD dikunci sesuai requirement: hanya satu akun admin */}

                {/* TABEL DAFTAR PETUGAS */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-striped" style={{ minWidth: 600 }}>
                        <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.03)' }}>
                                <th style={{ padding: '12px 16px' }}>Nama</th>
                                <th style={{ padding: '12px 16px' }}>Email</th>
                                <th style={{ padding: '12px 16px' }}>Jabatan</th>
                                <th style={{ padding: '12px 16px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr key={admin.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <td style={{ padding: '14px 16px' }}>{admin.nama}</td>
                                <td style={{ padding: '14px 16px' }}>{admin.email}</td>
                                <td style={{ padding: '14px 16px' }}>{admin.jabatan}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div className="text-muted small">Managed on backend</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
            
            {/* MODAL TAMBAH/EDIT PETUGAS */}
            {isFormOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setIsFormOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <h4 className="mb-4">{isEditing ? 'Edit Petugas' : 'Tambah Petugas Baru'}</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Nama</label>
                                <input type="text" name="nama" className="form-control" value={form.nama} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Jabatan</label>
                                <select name="jabatan" className="form-control" value={form.jabatan} onChange={handleChange} required>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Staff Peminjaman">Staff Peminjaman</option>
                                    <option value="Staff Katalog">Staff Katalog</option>
                                </select>
                            </div>

                            {!isEditing && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Kata Sandi</label>
                                        <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Konfirmasi Kata Sandi</label>
                                        <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} required />
                                    </div>
                                </>
                            )}

                            <div className="mt-4 d-flex justify-content-end" style={{ gap: 10 }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsFormOpen(false)}>Batal</button>
                                <button type="submit" className="primary-cta">{isEditing ? 'Simpan Perubahan' : 'Tambah'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Styling dasar untuk modal (diambil dari NavBar.jsx) */}
            <style jsx="true">{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    position: relative;
                }
                .primary-cta {
                    background-color: var(--library-accent, #007bff);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .btn-ghost {
                    background-color: #f0f0f0;
                    color: #333;
                    border: 1px solid #ccc;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}