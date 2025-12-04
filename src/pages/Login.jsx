import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin, setAuthToken } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();
  const { setCredentials } = useAuth();

  function validate() {
    const e = {};
    if (!email) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email tidak valid";

    if (!password) e.password = "Password wajib diisi";
    else if (password.length < 6)
      e.password = "Password minimal 6 karakter";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await apiLogin(email, password);

      const token = response.token || response.access_token;
      let role = response.role || response.user?.role || "anggota";
      const user = response.user || response.data?.user || response;

      if (!token) throw new Error("Token tidak ditemukan dari server");

      // Normalize role: backend mungkin return 'staff' tapi kita expect 'petugas'
      if (role === 'staff' || role === 'officer') {
        role = 'petugas'
      } else if (role !== 'petugas' && role !== 'anggota') {
        role = 'anggota' // fallback to member if unknown role
      }

      // simpan token
      if (remember) {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_info", JSON.stringify(user));
      } else {
        sessionStorage.setItem("auth_token", token);
        sessionStorage.setItem("user_role", role);
        sessionStorage.setItem("user_info", JSON.stringify(user));
      }

      setAuthToken(token);
      setCredentials({ token, role, user, remember });

      // arahkan sesuai role
      navigate(role === "petugas" ? "/petugas/dashboard" : "/anggota/dashboard");
    } catch (err) {
      console.error("Login gagal:", err);
      const e = err.response?.data || err;
      setApiError(e.message || "Terjadi kesalahan saat login");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          <h3 className="login-title">Welcome Back</h3>

          <form onSubmit={handleSubmit} noValidate>

            {apiError && (
              <div className="invalid-feedback api-error">{apiError}</div>
            )}

            <div className="input-field">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "is-invalid" : ""}
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="input-field">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "is-invalid" : ""}
                disabled={isSubmitting}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <label style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <button
              className="login-cta"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div style={{ marginTop: 12 }}>
              Belum punya akun? <Link to="/register">Daftar</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
