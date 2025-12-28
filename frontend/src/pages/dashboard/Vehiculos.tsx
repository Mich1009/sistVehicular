import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { api } from '../../api/api';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    placa: '',
    numeroVehiculo: '',
    marca: '',
    modelo: '',
    anio: '',
    vin: '',
    color: '',
    kilometraje: '',
    horometro: '',
    clienteId: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [vehiculosData, clientesData] = await Promise.all([
        api.vehiculos.listar(),
        api.clientes.listar(),
      ]);
      setVehiculos(vehiculosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (vehiculo?: any) => {
    if (vehiculo) {
      setEditando(vehiculo);
      setFormData(vehiculo);
    } else {
      setEditando(null);
      setFormData({
        placa: '',
        numeroVehiculo: '',
        marca: '',
        modelo: '',
        anio: '',
        vin: '',
        color: '',
        kilometraje: '',
        horometro: '',
        clienteId: '',
      });
    }
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : new Date().getFullYear(),
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        horometro: formData.horometro ? parseFloat(formData.horometro) : null,
        clienteId: formData.clienteId || null,
      };
      
      if (editando) {
        await api.vehiculos.actualizar(editando.id, dataToSend);
      } else {
        await api.vehiculos.crear(dataToSend);
      }
      cerrarModal();
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el vehículo');
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este vehículo?')) return;
    try {
      await api.vehiculos.eliminar(id);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el vehículo');
    }
  };

  const columns = [
    { header: 'Placa', accessor: 'placa' as const },
    { header: 'N° Vehículo', accessor: (row: any) => row.numeroVehiculo || '-' },
    { header: 'Marca', accessor: 'marca' as const },
    { header: 'Modelo', accessor: 'modelo' as const },
    { header: 'Año', accessor: 'anio' as const },
    { header: 'Supervisor', accessor: (row: any) => row.cliente?.nombres || row.cliente?.razonSocial || 'Sin asignar' },
    { header: 'Kilometraje', accessor: (row: any) => row.kilometraje ? `${row.kilometraje.toLocaleString()} km` : '-' },
    {
      header: 'Acciones',
      accessor: (row: any) => (
        <div className="table-actions">
          <button onClick={(e) => { e.stopPropagation(); abrirModal(row); }}>Editar</button>
          <button onClick={(e) => { e.stopPropagation(); eliminar(row.id); }} className="btn-danger">
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Gestión de Vehículos</h1>
        <button onClick={() => abrirModal()}>+ Nuevo Vehículo</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={vehiculos} columns={columns} />
      )}

      <Modal isOpen={modalOpen} onClose={cerrarModal} title={editando ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
        <form onSubmit={guardar} className="form">
          <div className="form-row">
            <label>
              Placa *
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                required
                placeholder="ABC-123"
              />
            </label>
            <label>
              Número de Vehículo
              <input
                type="text"
                value={formData.numeroVehiculo}
                onChange={(e) => setFormData({ ...formData, numeroVehiculo: e.target.value })}
                placeholder="Ej: 001, V-123, etc."
              />
            </label>
          </div>

          <label>
            Supervisor / Chofer (Opcional)
            <select
              value={formData.clienteId}
              onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
            >
              <option value="">Sin asignar</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razonSocial || `${c.nombres} ${c.apellidos || ''}`}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Marca *
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                required
              />
            </label>
            <label>
              Modelo *
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Año *
              <input
                type="text"
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                required
                placeholder={new Date().getFullYear().toString()}
              />
            </label>
            <label>
              Color
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ej: Blanco, Azul, etc."
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              VIN
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                placeholder="Número de identificación vehicular"
              />
            </label>
            <label>
              Kilometraje
              <input
                type="text"
                value={formData.kilometraje}
                onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                placeholder="Ej: 45000"
              />
            </label>
          </div>

          <label>
            Horómetro (Horas de trabajo)
            <input
              type="text"
              value={formData.horometro}
              onChange={(e) => setFormData({ ...formData, horometro: e.target.value })}
              placeholder="Ej: 1250.5 (para vehículos controlados por horas)"
            />
          </label>

          <div className="form-actions">
            <button type="button" onClick={cerrarModal} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
