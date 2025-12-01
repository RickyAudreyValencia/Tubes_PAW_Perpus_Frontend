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
            // Perhatikan: apiStore tidak memerlukan 'confirmed', tapi untuk jaga-jaga kita bisa kirim
            // password_confirmation: confirmPassword, 
            
            // FIELD WAJIB YANG HILANG: Jabatan, diset default 'Staff Biasa'
            // Sesuaikan nilai default ini jika ada nilai lain yang lebih cocok.
            jabatan: 'Staff Biasa', 
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
        
        // Opsional: Hapus header Authorization dari Axios
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;