import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const t = params.get('token')
    if (t) setToken(t)
  }, [params])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_URL}/autenticacion/restablecer-contrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      setSuccess('Tu contraseña fue restablecida correctamente. Ahora puedes iniciar sesión.')
    } catch (e: any) {
      setError(e.message ?? 'No se pudo restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <h1>Restablecer contraseña</h1>
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
              <strong>Error al restablecer</strong>
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
              <strong>Contraseña actualizada</strong>
              <span className="alert-message">{success}</span>
            </div>
            <button className="logout-button" onClick={() => navigate('/')}>Ir a login</button>
          </div>
        )}

        <label>
          Token de recuperación
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Pega aquí el token"
          />
        </label>
        <label>
          Nueva contraseña
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="********"
            autoComplete="new-password"
          />
        </label>
        <button onClick={submit} disabled={loading || !token || newPassword.length < 8}>
          {loading ? 'Actualizando…' : 'Restablecer contraseña'}
        </button>

        <div className="auth-actions">
          <a href="/recuperar">Solicitar token</a>
          <a href="/">Volver al inicio de sesión</a>
        </div>
      </div>
    </div>
  )
}