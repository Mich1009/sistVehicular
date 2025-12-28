import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../api/api';

export default function Almacen() {
  const navigate = useNavigate();
  const [repuestosBajoStock, setRepuestosBajoStock] = useState<any[]>([]);

  useEffect(() => {
    cargarRepuestosBajoStock();
  }, []);

  const cargarRepuestosBajoStock = async () => {
    try {
      const data = await api.repuestos.listarBajoStock();
      setRepuestosBajoStock(data);
    } catch (error) {
      console.error('Error al cargar repuestos bajo stock:', error);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <h1>Panel de Almacén</h1>
        <p>Control de inventario y movimientos de repuestos</p>
      </section>
      <section className="grid">
        <article className="card" onClick={() => navigate('/dashboard/repuestos')}>
          <h3>📦 Inventario de Repuestos</h3>
          <p>Gestión completa de repuestos y control de stock</p>
          <button>Gestionar</button>
        </article>
        <article className="card" onClick={() => navigate('/dashboard/movimientos')}>
          <h3>📊 Movimientos</h3>
          <p>Registro de entradas, salidas y ajustes de inventario</p>
          <button>Ver movimientos</button>
        </article>
        <article className="card alert-card">
          <h3>⚠️ Alertas de Stock</h3>
          <p>{repuestosBajoStock.length} repuesto(s) con stock bajo o crítico</p>
          <button onClick={() => navigate('/dashboard/repuestos')}>Ver alertas</button>
        </article>
      </section>
    </DashboardLayout>
  );
}