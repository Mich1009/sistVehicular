import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

export default function Admin() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <section className="page-header">
        <h1>Panel de Administración</h1>
        <p>Control central del sistema de gestión vehicular</p>
      </section>
      <section className="grid">
        <article className="card" onClick={() => navigate('/dashboard/usuarios')}>
          <h3>👤 Usuarios</h3>
          <p>Gestión de usuarios y permisos del sistema</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/clientes')}>
          <h3>👥 Supervisores</h3>
          <p>Gestión de supervisores y choferes responsables</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/vehiculos')}>
          <h3>🚗 Vehículos</h3>
          <p>Registro y control de vehículos del taller</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/servicios')}>
          <h3>🔧 Servicios</h3>
          <p>Catálogo de servicios y mantenimientos</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/repuestos')}>
          <h3>📦 Repuestos</h3>
          <p>Inventario y control de stock</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/ordenes')}>
          <h3>📋 Órdenes de Trabajo</h3>
          <p>Gestión de mantenimientos y reparaciones</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/reportes')}>
          <h3>📊 Reportes</h3>
          <p>Estadísticas y análisis del taller</p>
          <button>Ver reportes</button>
        </article>
      </section>
    </DashboardLayout>
  );
}