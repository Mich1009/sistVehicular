import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setToken(null)
    try {
      const res = await fetch(`${API_URL}/autenticacion/solicitar-recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setSuccess('Si el correo existe, se envió un enlace de recuperación. En modo pruebas, se generó un token.')
      if (data?.token) setToken(data.token)
    } catch (e: any) {
      setError(e.message ?? 'Error al solicitar recuperación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>Recuperar contraseña</h1>
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
              <strong>No se pudo enviar la solicitud</strong>
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
              <strong>Solicitud enviada</strong>
              <span className="alert-message">{success}</span>
            </div>
            {token && (
              <button className="logout-button" onClick={() => navigate(`/restablecer?token=${token}`)}>Usar token</button>
            )}
          </div>
        )}

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
        <button onClick={submit} disabled={loading}>
          {loading ? 'Enviando…' : 'Solicitar recuperación'}
        </button>

        <div className="auth-actions">
          <a href="/">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  )
}