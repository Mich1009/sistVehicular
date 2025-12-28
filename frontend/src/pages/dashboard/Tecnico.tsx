import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

export default function Tecnico() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <section className="page-header">
        <h1>Panel Técnico</h1>
        <p>Gestión de órdenes de trabajo y mantenimientos</p>
      </section>
      <section className="grid">
        <article className="card" onClick={() => navigate('/dashboard/ordenes')}>
          <h3>📋 Órdenes de Trabajo</h3>
          <p>Crear y gestionar órdenes de mantenimiento y reparación</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/vehiculos')}>
          <h3>🚗 Vehículos</h3>
          <p>Consultar historial de mantenimientos por vehículo</p>
          <button>Consultar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/repuestos')}>
          <h3>📦 Stock de Repuestos</h3>
          <p>Consultar disponibilidad de repuestos (solo lectura)</p>
          <button>Ver stock</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/reportes')}>
          <h3>📊 Reportes</h3>
          <p>Generar reportes de trabajos realizados</p>
          <button>Ver reportes</button>
        </article>
      </section>
    </DashboardLayout>
  );
}