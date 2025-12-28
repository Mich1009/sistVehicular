import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

type User = {
  id: string
  email: string
  nombre?: string
  role: 'ADMIN' | 'TECNICO' | 'ALMACEN'
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Login() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Oculta automáticamente el error después de unos segundos
  useEffect(() => {
    if (!error) return
    const id = setTimeout(() => setError(null), 4500)
    return () => clearTimeout(id)
  }, [error])

  const login = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/autenticacion/inicio-sesion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: email, password }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json() as (User & { token?: string })
      const user: User = { id: data.id, email: data.email, nombre: data.nombre, role: data.role }
      // persistencia simple de sesión
      try {
        localStorage.setItem('user', JSON.stringify(user))
        if (data.token) localStorage.setItem('token', data.token)
      } catch {}
      // Redirección por rol
      if (user.role === 'ADMIN') navigate('/dashboard/admin')
      else if (user.role === 'TECNICO') navigate('/dashboard/tecnico')
      else navigate('/dashboard/almacen')
    } catch (e: any) {
      setError(e.message ?? 'Error de inicio de sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}>
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </button>
      </div>
      <h1>Acceso al Sistema Vehicular</h1>
      <div className="login-card">
        {error && (
          <div className="alert alert-error" role="alert" aria-live="assertive">
            <span className="alert-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1.25" fill="currentColor" />
              </svg>
            </span>
            <div className="alert-content">
              <strong>Error al iniciar sesión</strong>
              <span className="alert-message">{error}</span>
            </div>
            <button type="button" className="alert-close" onClick={() => setError(null)} aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <label>
          Usuario o correo
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario o correo"
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña
          <div className="input-with-toggle">
            <input
              className="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                // ojo tachado
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 5C7 5 3.5 8.5 2 12c1.5 3.5 5 7 10 7 2.2 0 4.2-.7 6-2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              ) : (
                // ojo
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C7 5 3.5 8.5 2 12c1.5 3.5 5 7 10 7s8.5-3.5 10-7c-1.5-3.5-5-7-10-7z" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              )}
            </button>
          </div>
        </label>
        <button onClick={login} disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <div className="auth-actions">
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
          <Link to="/registrar">Crear una cuenta</Link>
        </div>
      </div>

      <div className="credentials-info">
        <h3>👤 Usuarios de Prueba</h3>
        <div className="credentials-grid">
          <div className="credential-item">
            <strong>Administrador</strong>
            <span>admin@sistema.com</span>
            <span>Admin1234</span>
          </div>
          <div className="credential-item">
            <strong>Técnico</strong>
            <span>tecnico@sistema.com</span>
            <span>Tecnico1234</span>
          </div>
          <div className="credential-item">
            <strong>Almacén</strong>
            <span>almacen@sistema.com</span>
            <span>Almacen1234</span>
          </div>
        </div>
      </div>
    </div>
  )
}