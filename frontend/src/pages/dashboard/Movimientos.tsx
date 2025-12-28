import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { api } from '../../api/api';

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const data = await api.repuestos.movimientos();
      setMovimientos(data);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
      ENTRADA: 'success',
      SALIDA: 'danger',
      AJUSTE: 'warning',
      DEVOLUCION: 'info',
    };
    return <Badge variant={variants[tipo] || 'default'}>{tipo}</Badge>;
  };

  const columns = [
    { header: 'Fecha', accessor: (row: any) => new Date(row.createdAt).toLocaleString() },
    { header: 'Tipo', accessor: (row: any) => getTipoBadge(row.tipo) },
    { header: 'Repuesto', accessor: (row: any) => row.repuesto?.nombre || '-' },
    { header: 'Código', accessor: (row: any) => row.repuesto?.codigo || '-' },
    { header: 'Cantidad', accessor: (row: any) => {
      const color = row.tipo === 'ENTRADA' || row.tipo === 'DEVOLUCION' ? '#4ade80' : '#f87171';
      const signo = row.tipo === 'ENTRADA' || row.tipo === 'DEVOLUCION' ? '+' : '-';
      return <span style={{ color, fontWeight: 'bold' }}>{signo}{row.cantidad}</span>;
    }},
    { header: 'Motivo', accessor: (row: any) => row.motivo || '-' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Historial de Movimientos</h1>
        <p>Registro de entradas, salidas y ajustes de inventario</p>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={movimientos} columns={columns} />
      )}
    </DashboardLayout>
  );
}
