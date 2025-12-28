import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

export default function Ordenes() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODAS');

  const cambiarEstado = async (ordenId: string, nuevoEstado: string) => {
    try {
      const updateData: any = { estado: nuevoEstado };
      if (nuevoEstado === 'COMPLETADA') {
        updateData.fechaFinalizacion = new Date().toISOString();
      }
      await api.ordenes.actualizar(ordenId, updateData);
      cargarOrdenes(); // Recargar la lista
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    setLoading(true);
    try {
      const data = await api.ordenes.listar();
      setOrdenes(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PENDIENTE: 'warning',
      EN_PROCESO: 'info',
      PAUSADA: 'danger',
      COMPLETADA: 'success',
      CANCELADA: 'danger',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado.replace('_', ' ')}</Badge>;
  };

  const ordenesFiltradas = ordenes.filter((o) => filtro === 'TODAS' || o.estado === filtro);

  const columns = [
    { header: 'Número', accessor: 'numero' as const },
    { header: 'Tipo', accessor: 'tipo' as const },
    { header: 'Estado', accessor: (row: any) => (
      <select 
        value={row.estado} 
        onChange={(e) => cambiarEstado(row.id, e.target.value)}
        style={{ background: 'transparent', border: 'none', color: 'inherit' }}
      >
        <option value="PENDIENTE">Pendiente</option>
        <option value="EN_PROCESO">En Proceso</option>
        <option value="PAUSADA">Pausada</option>
        <option value="COMPLETADA">Completada</option>
        <option value="CANCELADA">Cancelada</option>
      </select>
    ) },
    { header: 'Vehículo', accessor: (row: any) => `${row.vehiculo.placa} - ${row.vehiculo.marca} ${row.vehiculo.modelo}` },
    { header: 'Supervisor', accessor: (row: any) => row.cliente.razonSocial || `${row.cliente.nombres} ${row.cliente.apellidos || ''}` },
    { header: 'Fecha Ingreso', accessor: (row: any) => new Date(row.fechaIngreso).toLocaleDateString() },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Órdenes de Trabajo</h1>
        <button onClick={() => navigate('/dashboard/ordenes/nueva')}>+ Nueva Orden</button>
      </div>

      <div className="filters">
        <button
          className={filtro === 'TODAS' ? 'active' : ''}
          onClick={() => setFiltro('TODAS')}
        >
          Todas ({ordenes.length})
        </button>
        <button
          className={filtro === 'PENDIENTE' ? 'active' : ''}
          onClick={() => setFiltro('PENDIENTE')}
        >
          Pendientes ({ordenes.filter((o) => o.estado === 'PENDIENTE').length})
        </button>
        <button
          className={filtro === 'EN_PROCESO' ? 'active' : ''}
          onClick={() => setFiltro('EN_PROCESO')}
        >
          En Proceso ({ordenes.filter((o) => o.estado === 'EN_PROCESO').length})
        </button>
        <button
          className={filtro === 'COMPLETADA' ? 'active' : ''}
          onClick={() => setFiltro('COMPLETADA')}
        >
          Completadas ({ordenes.filter((o) => o.estado === 'COMPLETADA').length})
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table
          data={ordenesFiltradas}
          columns={columns}
          onRowClick={(orden) => navigate(`/dashboard/ordenes/${orden.id}`)}
        />
      )}
    </DashboardLayout>
  );
}
