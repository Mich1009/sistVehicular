import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import { api } from '../../api/api';

export default function ProximosMantenimientos() {
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Datos de prueba por ahora
    setMantenimientos([
      {
        vehiculo: { 
          placa: 'ABC-123', 
          marca: 'Toyota', 
          modelo: 'Corolla', 
          anio: 2020, 
          kilometraje: 45000, 
          horometro: 1200, 
          cliente: { nombres: 'Juan', apellidos: 'Pérez' } 
        },
        estado: 'PROXIMO',
        proximoKm: 50000,
        kmRestantes: 5000,
        ultimoMantenimiento: new Date().toISOString()
      },
      {
        vehiculo: { 
          placa: 'XYZ-789', 
          marca: 'Nissan', 
          modelo: 'Sentra', 
          anio: 2019, 
          kilometraje: 62000, 
          cliente: { nombres: 'María', apellidos: 'García' } 
        },
        estado: 'VENCIDO',
        proximoKm: 60000,
        kmRestantes: -2000,
        ultimoMantenimiento: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }, []);

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      OK: 'success',
      PROXIMO: 'warning',
      VENCIDO: 'danger',
      SIN_CONFIGURAR: 'info',
    };
    const labels: Record<string, string> = {
      OK: 'Al día',
      PROXIMO: 'Próximo',
      VENCIDO: 'Vencido',
      SIN_CONFIGURAR: 'Sin configurar',
    };
    return <Badge variant={variants[estado] || 'default'}>{labels[estado] || estado}</Badge>;
  };

  const formatearProximoMantenimiento = (item: any) => {
    const partes = [];
    
    if (item.proximoKm) {
      const restante = item.kmRestantes;
      partes.push(`${item.proximoKm.toLocaleString()} km ${restante !== null ? `(${restante > 0 ? '+' : ''}${restante})` : ''}`);
    }
    
    if (item.proximasHoras) {
      const restante = item.horasRestantes;
      partes.push(`${item.proximasHoras} hrs ${restante !== null ? `(${restante > 0 ? '+' : ''}${restante.toFixed(1)})` : ''}`);
    }
    
    if (item.proximaFecha) {
      const restante = item.diasRestantes;
      partes.push(`${new Date(item.proximaFecha).toLocaleDateString()} ${restante !== null ? `(${restante > 0 ? '+' : ''}${restante} días)` : ''}`);
    }
    
    return partes.length > 0 ? partes.join(' | ') : 'Sin configurar';
  };

  const columns = [
    { header: 'Estado', accessor: (row: any) => getEstadoBadge(row.estado) },
    { header: 'Placa', accessor: (row: any) => row.vehiculo.placa },
    { header: 'Vehículo', accessor: (row: any) => `${row.vehiculo.marca} ${row.vehiculo.modelo} (${row.vehiculo.anio})` },
    { header: 'Supervisor', accessor: (row: any) => row.vehiculo.cliente?.razonSocial || `${row.vehiculo.cliente?.nombres} ${row.vehiculo.cliente?.apellidos || ''}` },
    { header: 'Km Actual', accessor: (row: any) => row.vehiculo.kilometraje ? `${row.vehiculo.kilometraje.toLocaleString()} km` : 'N/A' },
    { header: 'Próximo Mantenimiento', accessor: (row: any) => formatearProximoMantenimiento(row) },
    { header: 'Último Mant.', accessor: (row: any) => row.ultimoMantenimiento ? new Date(row.ultimoMantenimiento).toLocaleDateString() : 'Nunca' },
  ];

  const vencidos = mantenimientos.filter(m => m.estado === 'VENCIDO');
  const proximos = mantenimientos.filter(m => m.estado === 'PROXIMO');
  const sinConfigurar = mantenimientos.filter(m => m.estado === 'SIN_CONFIGURAR');

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Próximos Mantenimientos</h1>
        <p>Control de mantenimientos preventivos programados</p>
      </div>

      <div className="grid">
        <div className="card">
          <h3 style={{ color: '#f87171' }}>⚠️ Vencidos</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#f87171' }}>{vencidos.length}</p>
          <p>Requieren atención inmediata</p>
        </div>
        <div className="card">
          <h3 style={{ color: '#fbbf24' }}>🔔 Próximos</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#fbbf24' }}>{proximos.length}</p>
          <p>En los próximos días</p>
        </div>
        <div className="card">
          <h3 style={{ color: '#60a5fa' }}>⚙️ Sin Configurar</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#60a5fa' }}>{sinConfigurar.length}</p>
          <p>Necesitan configuración</p>
        </div>
        <div className="card">
          <h3 style={{ color: '#4ade80' }}>✅ Al Día</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#4ade80' }}>{mantenimientos.filter(m => m.estado === 'OK').length}</p>
          <p>Mantenimiento al día</p>
        </div>
      </div>

      {vencidos.length > 0 && (
        <div className="info-box" style={{ background: '#fef2f2', borderColor: '#fca5a5', marginBottom: '1rem' }}>
          <strong style={{ color: '#dc2626' }}>⚠️ Atención:</strong>
          <p style={{ color: '#7f1d1d', margin: '0.5rem 0 0' }}>Hay {vencidos.length} vehículo(s) con mantenimiento vencido que requieren atención inmediata.</p>
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={mantenimientos} columns={columns} />
      )}
    </DashboardLayout>
  );
}