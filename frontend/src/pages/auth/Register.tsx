import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_URL}/autenticacion/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, nombre: nombre || undefined }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      setSuccess('Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.')
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>Crear cuenta</h1>
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
              <strong>Error al registrar</strong>
              <span className="alert-message">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status" aria-live="polite">
            <span className="alert-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="alert-content">
              <strong>Cuenta creada</strong>
              <span className="alert-message">{success}</span>
            </div>
            <button className="logout-button" onClick={() => navigate('/')}>Ir a login</button>
          </div>
        )}

        <label>
          Usuario
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="tu usuario"
            autoComplete="username"
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@dominio.com"
            autoComplete="email"
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            autoComplete="new-password"
          />
        </label>
        <label>
          Nombre (opcional)
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        {/* Mensaje informativo de rol eliminado según solicitud */}
        <button onClick={submit} disabled={loading || !username || !email || password.length < 8}>
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>

        <div className="auth-actions">
          <a href="/">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    </div>
  )
}