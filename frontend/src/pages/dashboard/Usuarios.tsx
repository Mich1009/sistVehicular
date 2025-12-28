import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    role: 'TECNICO',
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      // Por ahora simulamos datos, luego puedes crear un endpoint en el backend
      setUsuarios([
        { id: '1', username: 'admin', email: 'admin@taller.com', nombre: 'Administrador', role: 'ADMIN' },
        { id: '2', username: 'tecnico', email: 'tecnico@taller.com', nombre: 'Juan Pérez', role: 'TECNICO' },
        { id: '3', username: 'almacen', email: 'almacen@taller.com', nombre: 'María García', role: 'ALMACEN' },
      ]);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre: '',
      role: 'TECNICO',
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/autenticacion/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al crear usuario');
      }
      cerrarModal();
      cargarUsuarios();
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al crear el usuario');
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'success' | 'info' | 'warning'> = {
      ADMIN: 'success',
      TECNICO: 'info',
      ALMACEN: 'warning',
    };
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      TECNICO: 'Técnico',
      ALMACEN: 'Almacén',
    };
    return <Badge variant={variants[role] || 'default'}>{labels[role] || role}</Badge>;
  };

  const columns = [
    { header: 'Usuario', accessor: 'username' as const },
    { header: 'Nombre', accessor: 'nombre' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Rol', accessor: (row: any) => getRoleBadge(row.role) },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <button onClick={() => abrirModal()}>+ Nuevo Usuario</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={usuarios} columns={columns} />
      )}

      <Modal isOpen={modalOpen} onClose={cerrarModal} title="Nuevo Usuario">
        <form onSubmit={guardar} className="form">
          <div className="form-row">
            <label>
              Usuario *
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="nombre.usuario"
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="usuario@taller.com"
              />
            </label>
          </div>

          <label>
            Nombre Completo *
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Contraseña *
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </label>
            <label>
              Rol *
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="TECNICO">Técnico</option>
                <option value="ALMACEN">Almacén</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
          </div>

          <div className="info-box">
            <strong>Nota:</strong>
            <p>El usuario podrá cambiar su contraseña después del primer inicio de sesión.</p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={cerrarModal} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit">Crear Usuario</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
