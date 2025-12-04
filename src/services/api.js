import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor untuk Menyertakan Token pada Setiap Permintaan ---
// Memeriksa token di localStorage atau sessionStorage dan menambahkannya ke header
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

/**
 * Mengatur header Authorization secara manual setelah login berhasil.
 * @param {string} token - Token otentikasi.
 */
export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const fetchEvents = async () => {
 try {
   const response = await api.get('/buku');
     return response.data;
 } catch (error) {
    console.error("Error fetching buku:", error);
 throw error;
 }
};

// --- BOOKS / CATEGORIES / LOANS / FINES / REVIEWS APIs ---
export const getBooks = async (params) => {
    const res = await api.get('/buku', { params })
    return res.data
}

export const getCategories = async () => {
    const res = await api.get('/kategori')
    return res.data
}

// Create book: try /buku/create; fallback to /buku
export const createBook = async (payload) => {
    try {
        // If payload is FormData (file upload), ensure multipart headers
        if (payload instanceof FormData) {
            const res = await api.post('/buku/create', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
            return res.data
        }
        const res = await api.post('/buku/create', payload)
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            if (payload instanceof FormData) {
                const res = await api.post('/buku', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
                return res.data
            }
            const res = await api.post('/buku', payload)
            return res.data
        }
        throw e
    }
}

// Update book: prefer PUT /buku/{id} else fallback to POST /buku/update/{id}
export const updateBook = async (id, payload) => {
    try {
        if (payload instanceof FormData) {
            const res = await api.post(`/buku/update/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
            return res.data
        }
        const res = await api.put(`/buku/${id}`, payload)
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            if (payload instanceof FormData) {
                const res = await api.post(`/buku/update/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
                return res.data
            }
            const res = await api.post(`/buku/update/${id}`, payload)
            return res.data
        }
        throw e
    }
}

// Delete book: prefer DELETE /buku/{id} else fallback to /buku/delete/{id}
export const deleteBook = async (id) => {
    try {
        const res = await api.delete(`/buku/${id}`)
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            const res = await api.delete(`/buku/delete/${id}`)
            return res.data
        }
        throw e
    }
}

// Get loans (peminjaman): prefer /peminjaman else fallback to /pinjam
export const getLoans = async () => {
    try {
        const res = await api.get('/peminjaman')
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            const res = await api.get('/pinjam')
            return res.data
        }
        throw e
    }
}

// Accept loan: try /peminjaman/{id}/accept else /pinjam/{id}/accept
export const acceptLoan = async (loanId) => {
    try {
        const res = await api.post(`/peminjaman/${loanId}/accept`)
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            const res = await api.post(`/pinjam/${loanId}/accept`)
            return res.data
        }
        throw e
    }
}

export const rejectLoan = async (loanId) => {
    try {
        const res = await api.post(`/peminjaman/${loanId}/reject`)
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            const res = await api.post(`/pinjam/${loanId}/reject`)
            return res.data
        }
        throw e
    }
}

export const addFineToLoan = async (loanId, amount) => {
    try {
        const res = await api.post(`/peminjaman/${loanId}/fine`, { amount })
        return res.data
    } catch (e) {
        if (e.response?.status === 404) {
            const res = await api.post(`/pinjam/${loanId}/fine`, { amount })
            return res.data
        }
        throw e
    }
}

export const getReports = async (type) => {
    const res = await api.get(`/reports/${type}`)
    return res.data
}

export const createReview = async (bookId, payload) => {
    const res = await api.post(`/buku/${bookId}/reviews`, payload)
    return res.data
}

export const payLoan = async (loanId, payload) => {
    const res = await api.post(`/pinjam/${loanId}/pay`, payload)
    return res.data
}

export const updateMemberProfile = async (payload) => {
    // Map frontend-friendly fields to backend fields
    const backendPayload = {
        ...(payload.nama ? { nama: payload.nama } : {}),
        ...(payload.email ? { email: payload.email } : {}),
        ...(payload.no_telepon ? { nomor_telepon: payload.no_telepon } : {}),
        ...(payload.nomor_telepon ? { nomor_telepon: payload.nomor_telepon } : {}),
        ...(payload.alamat ? { alamat: payload.alamat } : {}),
    }
    
    // Try different endpoints in order of priority
    const endpoints = [
        { method: 'put', url: '/anggota/me' },           // Preferred: PUT /anggota/me
        { method: 'post', url: '/anggota/me' },          // Fallback: POST /anggota/me
    ]
    
    let lastError = null
    
    for (const endpoint of endpoints) {
        try {
            let res
            if (endpoint.method === 'put') {
                res = await api.put(endpoint.url, backendPayload)
            } else {
                res = await api.post(endpoint.url, backendPayload)
            }
            console.log(`✓ Success updating profile via ${endpoint.method.toUpperCase()} ${endpoint.url}`)
            return res.data
        } catch (e) {
            lastError = e
            console.warn(`✗ Failed ${endpoint.method.toUpperCase()} ${endpoint.url}: ${e.response?.status || e.message}`)
            continue
        }
    }
    
    // If all endpoints failed, throw detailed error
    console.error('All update endpoints failed. Last error:', lastError)
    throw new Error(`Gagal update profile. Error: ${lastError?.response?.data?.message || lastError?.message}`)
}

export const deleteMemberAccount = async () => {
    // Try different endpoints
    const endpoints = [
        { method: 'delete', url: '/anggota/me' },        // Preferred: DELETE /anggota/me
        { method: 'delete', url: '/anggota' },           // Fallback: DELETE /anggota
    ]
    
    let lastError = null
    
    for (const endpoint of endpoints) {
        try {
            const res = await api.delete(endpoint.url)
            console.log(`✓ Success deleting account via DELETE ${endpoint.url}`)
            return res.data
        } catch (e) {
            lastError = e
            console.warn(`✗ Failed DELETE ${endpoint.url}: ${e.response?.status || e.message}`)
            continue
        }
    }
    
    throw lastError
}

// Create loan: prefer /peminjaman POST else fallback to /peminjaman/create
export const createLoan = async (payload) => {
    // Backend expects: id_anggota, id_buku, tanggal_pinjam, tanggal_kembali, metode_pembayaran
    // Frontend might send: book_id, id_buku, tanggal_pinjam, tanggal_kembali, payment_method, metode_pembayaran
    const backendPayload = {
        ...(payload.id_anggota ? { id_anggota: payload.id_anggota } : {}),
        ...(payload.book_id ? { id_buku: payload.book_id } : {}),
        ...(payload.id_buku ? { id_buku: payload.id_buku } : {}),
        ...(payload.tanggal_pinjam ? { tanggal_pinjam: payload.tanggal_pinjam } : {}),
        ...(payload.tanggal_kembali ? { tanggal_kembali: payload.tanggal_kembali } : {}),
        ...(payload.metode_pembayaran ? { metode_pembayaran: payload.metode_pembayaran } : {}),
        ...(payload.payment_method ? { metode_pembayaran: payload.payment_method } : {}),
    }
    
    const endpoints = [
        { method: 'post', url: '/peminjaman' },          // Try /peminjaman first
        { method: 'post', url: '/peminjaman/create' },   // Try /peminjaman/create
    ]
    
    let lastError = null
    
    for (const endpoint of endpoints) {
        try {
            const res = await api.post(endpoint.url, backendPayload)
            console.log(`✓ Loan created via POST ${endpoint.url}`)
            return res.data
        } catch (e) {
            lastError = e
            console.warn(`✗ Failed POST ${endpoint.url}: ${e.response?.status || e.message}`)
            continue
        }
    }
    
    throw lastError
}

export const login = async (email, password) => {
     try {
 // Pastikan endpoint '/login' sesuai dengan route Laravel Anda
    const response = await api.post('/login', { 
    email: email,
    password: password,
 });
 
 return response.data; 
 } catch (error) {
 // Melemparkan error agar bisa ditangkap di komponen Login
throw error; 
 }
};

export const register = async (name, email, password, confirmPassword) => {
    try {
        // Data yang dikirim disesuaikan dengan kebutuhan PetugasController::apiStore
        const response = await api.post('/register', {
            nama: name, // MAPPING: Mengirim 'name' frontend sebagai 'nama' backend
            email: email,
            password: password,
            // Simple payload — only the minimal fields required by registration
            password_confirmation: confirmPassword
        });

        return response.data; 
    } catch (error) {
        throw error; 
    }
};

export const logout = async () => {
    try {
        // Panggil endpoint /logout yang mencabut token di backend
        await api.post('/logout'); 
    } catch (error) {
        // Jika token sudah dicabut atau server offline, kita tetap paksa logout di frontend
        console.error("Logout API failed, forcing frontend cleanup:", error);
    } finally {
        // Membersihkan token dan role dari storage
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        sessionStorage.removeItem('user_role');
        // remove stored user info
        localStorage.removeItem('user_info');
        sessionStorage.removeItem('user_info');
        
        // Opsional: Hapus header Authorization dari Axios
        delete api.defaults.headers.common['Authorization'];
    }
};

// Tambahkan di api.js
export const updateStatusToPinjam = async (loanId) => {
  try {
    const response = await api.put(`/peminjaman/${loanId}/update-status-pinjam`)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

export default api;