import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { api } from '../../api/api';

export default function DetalleOrden() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [configuracion, setConfiguracion] = useState({
    intervaloKilometraje: 5000,
    intervaloHoras: 250,
    intervaloDias: 90,
    tipoControl: 'KILOMETRAJE',
  });

  useEffect(() => {
    if (id) {
      cargarOrden();
    }
  }, [id]);

  const cargarOrden = async () => {
    setLoading(true);
    try {
      const data = await api.ordenes.obtener(id!);
      setOrden(data);
    } catch (error) {
      console.error('Error al cargar orden:', error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async () => {
    if (!nuevoEstado) return;
    
    try {
      const updateData: any = { estado: nuevoEstado };
      
      // Si se completa la orden, agregar fecha de finalización
      if (nuevoEstado === 'COMPLETADA') {
        updateData.fechaFinalizacion = new Date().toISOString();
        
        // Si es mantenimiento preventivo, crear configuración de próximo mantenimiento
        if (orden.tipo === 'PREVENTIVO') {
          await crearProximoMantenimiento();
        }
      }
      
      await api.ordenes.actualizar(id!, updateData);
      setModalEstado(false);
      cargarOrden();
      alert('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado');
    }
  };

  const crearProximoMantenimiento = async () => {
    try {
      await api.mantenimientos.completar(orden.id, configuracion);
    } catch (error) {
      console.error('Error al crear próximo mantenimiento:', error);
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

  if (loading) return <DashboardLayout><p>Cargando...</p></DashboardLayout>;
  if (!orden) return <DashboardLayout><p>Orden no encontrada</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Orden {orden.numero}</h1>
          <p>{orden.vehiculo.placa} - {orden.vehiculo.marca} {orden.vehiculo.modelo}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setModalEstado(true)} className="btn-info">
            Cambiar Estado
          </button>
          {orden.tipo === 'PREVENTIVO' && orden.estado !== 'COMPLETADA' && (
            <button onClick={() => setModalConfig(true)}>
              Configurar Próximo
            </button>
          )}
          <button onClick={() => navigate('/dashboard/ordenes')} className="btn-secondary">
            Volver
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3>Información General</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div><strong>Estado:</strong> {getEstadoBadge(orden.estado)}</div>
            <div><strong>Tipo:</strong> {orden.tipo}</div>
            <div><strong>Fecha Ingreso:</strong> {new Date(orden.fechaIngreso).toLocaleDateString()}</div>
            {orden.fechaPromesa && (
              <div><strong>Fecha Promesa:</strong> {new Date(orden.fechaPromesa).toLocaleDateString()}</div>
            )}
            {orden.fechaFinalizacion && (
              <div><strong>Fecha Finalización:</strong> {new Date(orden.fechaFinalizacion).toLocaleDateString()}</div>
            )}
            <div><strong>Supervisor:</strong> {orden.cliente.razonSocial || `${orden.cliente.nombres} ${orden.cliente.apellidos || ''}`}</div>
            {orden.kilometrajeActual && (
              <div><strong>Kilometraje:</strong> {orden.kilometrajeActual.toLocaleString()} km</div>
            )}
            {orden.horometroActual && (
              <div><strong>Horómetro:</strong> {orden.horometroActual} hrs</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Diagnóstico y Observaciones</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <strong>Diagnóstico:</strong>
              <p style={{ margin: '0.5rem 0', padding: '0.5rem', background: '#2a2a2a', borderRadius: '4px' }}>
                {orden.diagnostico || 'Sin diagnóstico'}
              </p>
            </div>
            <div>
              <strong>Observaciones:</strong>
              <p style={{ margin: '0.5rem 0', padding: '0.5rem', background: '#2a2a2a', borderRadius: '4px' }}>
                {orden.observaciones || 'Sin observaciones'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {orden.servicios && orden.servicios.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Servicios</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {orden.servicios.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.servicio.nombre}</td>
                  <td>{s.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orden.repuestos && orden.repuestos.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Repuestos</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Repuesto</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {orden.repuestos.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.repuesto.nombre}</td>
                  <td>{r.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalEstado} onClose={() => setModalEstado(false)} title="Cambiar Estado de Orden">
        <div className="form">
          <label>
            Nuevo Estado *
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              required
            >
              <option value="">Seleccione un estado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="PAUSADA">Pausada</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="button" onClick={() => setModalEstado(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={cambiarEstado}>Cambiar Estado</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalConfig} onClose={() => setModalConfig(false)} title="Configurar Próximo Mantenimiento">
        <div className="form">
          <label>
            Tipo de Control *
            <select
              value={configuracion.tipoControl}
              onChange={(e) => setConfiguracion({ ...configuracion, tipoControl: e.target.value })}
            >
              <option value="KILOMETRAJE">Por Kilometraje</option>
              <option value="HORAS">Por Horas de Trabajo</option>
              <option value="DIAS">Por Días</option>
              <option value="MIXTO">Mixto (el que llegue primero)</option>
            </select>
          </label>

          {(configuracion.tipoControl === 'KILOMETRAJE' || configuracion.tipoControl === 'MIXTO') && (
            <label>
              Intervalo de Kilometraje
              <input
                type="number"
                value={configuracion.intervaloKilometraje}
                onChange={(e) => setConfiguracion({ ...configuracion, intervaloKilometraje: parseInt(e.target.value) || 0 })}
                min="1000"
                step="1000"
              />
              <small>Cada cuántos kilómetros hacer mantenimiento</small>
            </label>
          )}

          {(configuracion.tipoControl === 'HORAS' || configuracion.tipoControl === 'MIXTO') && (
            <label>
              Intervalo de Horas
              <input
                type="number"
                value={configuracion.intervaloHoras}
                onChange={(e) => setConfiguracion({ ...configuracion, intervaloHoras: parseFloat(e.target.value) || 0 })}
                min="50"
                step="50"
              />
              <small>Cada cuántas horas de trabajo hacer mantenimiento</small>
            </label>
          )}

          {(configuracion.tipoControl === 'DIAS' || configuracion.tipoControl === 'MIXTO') && (
            <label>
              Intervalo de Días
              <input
                type="number"
                value={configuracion.intervaloDias}
                onChange={(e) => setConfiguracion({ ...configuracion, intervaloDias: parseInt(e.target.value) || 0 })}
                min="30"
                step="30"
              />
              <small>Cada cuántos días hacer mantenimiento</small>
            </label>
          )}

          <div className="info-box">
            <strong>Próximo mantenimiento programado para:</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {(configuracion.tipoControl === 'KILOMETRAJE' || configuracion.tipoControl === 'MIXTO') && (
                <li>{((orden.kilometrajeActual || 0) + configuracion.intervaloKilometraje).toLocaleString()} km</li>
              )}
              {(configuracion.tipoControl === 'HORAS' || configuracion.tipoControl === 'MIXTO') && (
                <li>{((orden.horometroActual || 0) + configuracion.intervaloHoras)} horas</li>
              )}
              {(configuracion.tipoControl === 'DIAS' || configuracion.tipoControl === 'MIXTO') && (
                <li>{new Date(Date.now() + configuracion.intervaloDias * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
              )}
            </ul>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalConfig(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={() => setModalConfig(false)}>Guardar Configuración</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}