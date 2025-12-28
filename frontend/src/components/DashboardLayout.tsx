import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

type User = {
  id: string
  email: string
  nombre?: string
  role: 'ADMIN' | 'TECNICO' | 'ALMACEN'
}

export default function DashboardLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const { theme, resetToSystemTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (raw && token) {
        setUser(JSON.parse(raw))
      } else {
        navigate('/')
      }
    } catch {
      navigate('/')
    }
  }, [])

  const roleLabel = useMemo(() => {
    if (!user) return 'Invitado'
    return user.role === 'ADMIN' ? 'Administrador' : user.role === 'TECNICO' ? 'Técnico' : 'Almacén'
  }, [user])

  const menuItems = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'ADMIN') {
      return [
        { to: '/dashboard/admin', icon: '🏠', label: 'Inicio' },
        { to: '/dashboard/usuarios', icon: '👤', label: 'Usuarios' },
        { to: '/dashboard/clientes', icon: '👥', label: 'Clientes' },
        { to: '/dashboard/vehiculos', icon: '🚗', label: 'Vehículos' },
        { to: '/dashboard/servicios', icon: '🔧', label: 'Servicios' },
        { to: '/dashboard/repuestos', icon: '📦', label: 'Repuestos' },
        { to: '/dashboard/ordenes', icon: '📋', label: 'Órdenes' },
        { to: '/dashboard/proximos-mantenimientos', icon: '⏰', label: 'Próximos Mant.' },
        { to: '/dashboard/reportes', icon: '📊', label: 'Reportes' },
      ];
    }
    
    if (user.role === 'TECNICO') {
      return [
        { to: '/dashboard/tecnico', icon: '🏠', label: 'Inicio' },
        { to: '/dashboard/ordenes', icon: '📋', label: 'Órdenes' },
        { to: '/dashboard/vehiculos', icon: '🚗', label: 'Vehículos' },
        { to: '/dashboard/proximos-mantenimientos', icon: '⏰', label: 'Próximos Mant.' },
        { to: '/dashboard/repuestos', icon: '📦', label: 'Stock' },
        { to: '/dashboard/reportes', icon: '📊', label: 'Reportes' },
      ];
    }
    
    if (user.role === 'ALMACEN') {
      return [
        { to: '/dashboard/almacen', icon: '🏠', label: 'Inicio' },
        { to: '/dashboard/repuestos', icon: '📦', label: 'Repuestos' },
        { to: '/dashboard/movimientos', icon: '📊', label: 'Movimientos' },
      ];
    }
    
    return [];
  }, [user]);

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/')
  }

  const setThemeManual = (newTheme: 'light' | 'dark') => {
    localStorage.setItem('user-theme-preference', 'manual');
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    // Forzar actualización del contexto
    window.location.reload();
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setShowThemeMenu(false);
    if (showThemeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showThemeMenu]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="logo" aria-hidden="true">🚗</span>
          <div className="brand-text">
            <strong>SIMV</strong>
            <span>Sistema Vehicular</span>
          </div>
        </div>
        <div className="header-actions">
          <div className="theme-selector" style={{ position: 'relative' }}>
            <button 
              className="theme-toggle" 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              aria-label="Opciones de tema"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
            
            {showThemeMenu && (
              <div className="theme-menu" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setThemeManual('light'); setShowThemeMenu(false); }}>
                  ☀️ Claro
                </button>
                <button onClick={() => { setThemeManual('dark'); setShowThemeMenu(false); }}>
                  🌙 Oscuro
                </button>
                <button onClick={() => { resetToSystemTheme(); setShowThemeMenu(false); }}>
                  💻 Sistema
                </button>
              </div>
            )}
          </div>
          <div className="user-pill">
            <span className="user-role">{roleLabel}</span>
            <span className="user-email">{user?.email ?? 'Sin sesión'}</span>
          </div>
          <button className="logout-button" onClick={logout} aria-label="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 16l4-4-4-4M9 12h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </header>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <nav>
            <ul>
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={({isActive})=> isActive? 'active':''}>
                    {item.icon} {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  )
}