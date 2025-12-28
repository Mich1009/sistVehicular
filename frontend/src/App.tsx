import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Admin from './pages/dashboard/Admin'
import Tecnico from './pages/dashboard/Tecnico'
import Almacen from './pages/dashboard/Almacen'
import Clientes from './pages/dashboard/Clientes'
import Vehiculos from './pages/dashboard/Vehiculos'
import Servicios from './pages/dashboard/Servicios'
import Repuestos from './pages/dashboard/Repuestos'
import Ordenes from './pages/dashboard/Ordenes'
import NuevaOrden from './pages/dashboard/NuevaOrden'
import Usuarios from './pages/dashboard/Usuarios'
import Movimientos from './pages/dashboard/Movimientos'
import Reportes from './pages/dashboard/Reportes'
import DetalleOrden from './pages/dashboard/DetalleOrden'
import ProximosMantenimientos from './pages/dashboard/ProximosMantenimientos'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Register from './pages/auth/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/recuperar" element={<ForgotPassword />} />
      <Route path="/restablecer" element={<ResetPassword />} />
      <Route path="/registrar" element={<Register />} />
      <Route path="/dashboard/admin" element={<Admin />} />
      <Route path="/dashboard/tecnico" element={<Tecnico />} />
      <Route path="/dashboard/almacen" element={<Almacen />} />
      <Route path="/dashboard/usuarios" element={<Usuarios />} />
      <Route path="/dashboard/clientes" element={<Clientes />} />
      <Route path="/dashboard/vehiculos" element={<Vehiculos />} />
      <Route path="/dashboard/servicios" element={<Servicios />} />
      <Route path="/dashboard/repuestos" element={<Repuestos />} />
      <Route path="/dashboard/ordenes" element={<Ordenes />} />
      <Route path="/dashboard/ordenes/nueva" element={<NuevaOrden />} />
      <Route path="/dashboard/ordenes/:id" element={<DetalleOrden />} />
      <Route path="/dashboard/movimientos" element={<Movimientos />} />
      <Route path="/dashboard/reportes" element={<Reportes />} />
      <Route path="/dashboard/proximos-mantenimientos" element={<ProximosMantenimientos />} />
    </Routes>
  )
}

export default App
