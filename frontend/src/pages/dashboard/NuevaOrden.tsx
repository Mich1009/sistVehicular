import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { api } from '../../api/api';

export default function NuevaOrden() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<any>(null);

  const [formData, setFormData] = useState({
    tipo: 'CORRECTIVO',
    clienteNombre: '',
    vehiculoId: '',
    kilometrajeActual: '',
    horometroActual: '',
    proximoKilometraje: '',
    proximoHorometro: '',
    diagnostico: '',
    observaciones: '',
    fechaPromesa: '',
  });

  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<any[]>([]);
  const [repuestosSeleccionados, setRepuestosSeleccionados] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  

  const cargarDatos = async () => {
    try {
      const [vehiculosData, serviciosData, repuestosData] = await Promise.all([
        api.vehiculos.listar(),
        api.servicios.listarActivos(),
        api.repuestos.listarActivos(),
      ]);
      setVehiculos(vehiculosData);
      setServicios(serviciosData);
      setRepuestos(repuestosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const seleccionarVehiculo = (vehiculoId: string) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo);
      setFormData({
        ...formData,
        vehiculoId,
        clienteNombre: vehiculo.cliente?.razonSocial || `${vehiculo.cliente?.nombres} ${vehiculo.cliente?.apellidos || ''}` || '',
        kilometrajeActual: vehiculo.kilometraje ? vehiculo.kilometraje.toString() : '',
        horometroActual: vehiculo.horometro ? vehiculo.horometro.toString() : '',
        proximoKilometraje: vehiculo.kilometraje ? (vehiculo.kilometraje + 5000).toString() : '5000',
        proximoHorometro: vehiculo.horometro ? (vehiculo.horometro + 250).toString() : '250',
      });
    }
  };

  const agregarServicio = (servicioId: string) => {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (!servicio) return;
    if (serviciosSeleccionados.find((s) => s.servicioId === servicioId)) {
      alert('El servicio ya fue agregado');
      return;
    }
    setServiciosSeleccionados([...serviciosSeleccionados, { servicioId, cantidad: 1 }]);
  };

  const agregarRepuesto = (repuestoId: string) => {
    const repuesto = repuestos.find((r) => r.id === repuestoId);
    if (!repuesto) return;
    if (repuestosSeleccionados.find((r) => r.repuestoId === repuestoId)) {
      alert('El repuesto ya fue agregado');
      return;
    }
    setRepuestosSeleccionados([...repuestosSeleccionados, { repuestoId, cantidad: 1 }]);
  };

  const actualizarCantidadServicio = (servicioId: string, cantidad: number) => {
    setServiciosSeleccionados(
      serviciosSeleccionados.map((s) =>
        s.servicioId === servicioId ? { ...s, cantidad } : s
      )
    );
  };

  const actualizarCantidadRepuesto = (repuestoId: string, cantidad: number) => {
    setRepuestosSeleccionados(
      repuestosSeleccionados.map((r) =>
        r.repuestoId === repuestoId ? { ...r, cantidad } : r
      )
    );
  };

  const eliminarServicio = (servicioId: string) => {
    setServiciosSeleccionados(serviciosSeleccionados.filter((s) => s.servicioId !== servicioId));
  };

  const eliminarRepuesto = (repuestoId: string) => {
    setRepuestosSeleccionados(repuestosSeleccionados.filter((r) => r.repuestoId !== repuestoId));
  };



  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehiculoId || !formData.clienteNombre) {
      alert('Debe seleccionar un vehículo y especificar el supervisor/chofer');
      return;
    }
    try {
      const ordenData = {
        tipo: formData.tipo,
        vehiculoId: formData.vehiculoId,
        clienteId: vehiculoSeleccionado?.clienteId || null,
        kilometrajeActual: formData.kilometrajeActual ? parseInt(formData.kilometrajeActual) : null,
        horometroActual: formData.horometroActual ? parseFloat(formData.horometroActual) : null,
        diagnostico: formData.diagnostico,
        observaciones: `Supervisor/Chofer: ${formData.clienteNombre}\n${formData.observaciones}`,
        fechaPromesa: formData.fechaPromesa || null,
        servicios: serviciosSeleccionados,
        repuestos: repuestosSeleccionados,
      };

      const orden = await api.ordenes.crear(ordenData);
      
      // Si es preventivo, registrar próximo mantenimiento
      if (formData.tipo === 'PREVENTIVO') {
        const kmActual = formData.kilometrajeActual ? parseInt(formData.kilometrajeActual) : 0;
        const kmProximo = formData.proximoKilometraje ? parseInt(formData.proximoKilometraje) : 0;
        const horasActual = formData.horometroActual ? parseFloat(formData.horometroActual) : 0;
        const horasProximo = formData.proximoHorometro ? parseFloat(formData.proximoHorometro) : 0;
        
        await api.mantenimientos.completar(orden.id, {
          tipoControl: 'MIXTO',
          intervaloKilometraje: kmProximo - kmActual,
          intervaloHoras: horasProximo - horasActual,
          intervaloDias: 90,
          vehiculoId: formData.vehiculoId,
        });
      }

      navigate('/dashboard/ordenes');
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Error al crear la orden de trabajo');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Nueva Orden de Trabajo</h1>
      </div>

      <form onSubmit={guardar} className="form orden-form">
        <section className="form-section">
          <h3>Información General</h3>
          <div className="form-row">
            <label>
              Tipo de Mantenimiento *
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                required
              >
                <option value="CORRECTIVO">Correctivo</option>
                <option value="PREVENTIVO">Preventivo</option>
              </select>
            </label>
            <label>
              Fecha Promesa
              <input
                type="date"
                value={formData.fechaPromesa}
                onChange={(e) => setFormData({ ...formData, fechaPromesa: e.target.value })}
              />
            </label>
          </div>

          <label>
            Vehículo *
            <select
              value={formData.vehiculoId}
              onChange={(e) => seleccionarVehiculo(e.target.value)}
              required
            >
              <option value="">Seleccione un vehículo</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.marca} {v.modelo} ({v.anio})
                </option>
              ))}
            </select>
          </label>

          <label>
            Supervisor / Chofer Responsable *
            <input
              type="text"
              value={formData.clienteNombre}
              onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
              required
              placeholder="Nombre del supervisor o chofer responsable"
            />
          </label>

          <div className="form-row">
            <label>
              Kilometraje Actual
              <input
                type="text"
                value={formData.kilometrajeActual}
                onChange={(e) => setFormData({ ...formData, kilometrajeActual: e.target.value })}
                placeholder="Ej: 45000"
              />
              <small>Registrado: {vehiculoSeleccionado?.kilometraje || 'N/A'} km</small>
            </label>
            <label>
              Horómetro Actual (Horas)
              <input
                type="text"
                value={formData.horometroActual}
                onChange={(e) => setFormData({ ...formData, horometroActual: e.target.value })}
                placeholder="Ej: 1250.5"
              />
              <small>Registrado: {vehiculoSeleccionado?.horometro || 'N/A'} hrs</small>
            </label>
          </div>

          {formData.tipo === 'PREVENTIVO' && (
            <div className="form-section">
              <h3>Próximo Mantenimiento</h3>
              <div className="form-row">
                <label>
                  Próximo Kilometraje
                  <input
                    type="text"
                    value={formData.proximoKilometraje}
                    onChange={(e) => setFormData({ ...formData, proximoKilometraje: e.target.value })}
                    placeholder="Ej: 50000"
                  />
                </label>
                <label>
                  Próximo Horómetro
                  <input
                    type="text"
                    value={formData.proximoHorometro}
                    onChange={(e) => setFormData({ ...formData, proximoHorometro: e.target.value })}
                    placeholder="Ej: 1500.0"
                  />
                </label>
              </div>
            </div>
          )}

          <label>
            Diagnóstico
            <textarea
              value={formData.diagnostico}
              onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
              rows={3}
            />
          </label>

          <label>
            Observaciones
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={2}
            />
          </label>
        </section>

        <section className="form-section">
          <h3>Servicios</h3>
          <div className="form-row">
            <select onChange={(e) => { agregarServicio(e.target.value); e.target.value = ''; }}>
              <option value="">+ Agregar servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {serviciosSeleccionados.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {serviciosSeleccionados.map((s) => {
                  const servicio = servicios.find((srv) => srv.id === s.servicioId);
                  if (!servicio) return null;
                  return (
                    <tr key={s.servicioId}>
                      <td>{servicio.nombre}</td>
                      <td>
                        <input
                          type="number"
                          value={s.cantidad}
                          onChange={(e) => actualizarCantidadServicio(s.servicioId, parseInt(e.target.value) || 1)}
                          min="1"
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => eliminarServicio(s.servicioId)} className="btn-danger-sm">
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="form-section">
          <h3>Repuestos</h3>
          <div className="form-row">
            <select onChange={(e) => { agregarRepuesto(e.target.value); e.target.value = ''; }}>
              <option value="">+ Agregar repuesto</option>
              {repuestos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} (Stock: {r.stockActual})
                </option>
              ))}
            </select>
          </div>

          {repuestosSeleccionados.length > 0 && (
            <table className="items-table">
              <thead>
                <tr>
                  <th>Repuesto</th>
                  <th>Cantidad</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {repuestosSeleccionados.map((r) => {
                  const repuesto = repuestos.find((rep) => rep.id === r.repuestoId);
                  if (!repuesto) return null;
                  return (
                    <tr key={r.repuestoId}>
                      <td>{repuesto.nombre}</td>
                      <td>
                        <input
                          type="number"
                          value={r.cantidad}
                          onChange={(e) => actualizarCantidadRepuesto(r.repuestoId, parseInt(e.target.value) || 1)}
                          min="1"
                          max={repuesto.stockActual}
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => eliminarRepuesto(r.repuestoId)} className="btn-danger-sm">
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard/ordenes')} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit">Crear Orden</button>
        </div>
      </form>
    </DashboardLayout>
  );
}
