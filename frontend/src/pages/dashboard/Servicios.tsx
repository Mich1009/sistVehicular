import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { api } from '../../api/api';

export default function Servicios() {
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    tiempoEstimado: 0,
    activo: true,
  });

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const data = await api.servicios.listar();
      setServicios(data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (servicio?: any) => {
    if (servicio) {
      setEditando(servicio);
      setFormData(servicio);
    } else {
      setEditando(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: 0,
        tiempoEstimado: 0,
        activo: true,
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
      if (editando) {
        await api.servicios.actualizar(editando.id, formData);
      } else {
        await api.servicios.crear(formData);
      }
      cerrarModal();
      cargarServicios();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el servicio');
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este servicio?')) return;
    try {
      await api.servicios.eliminar(id);
      cargarServicios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const columns = [
    { header: 'Código', accessor: 'codigo' as const },
    { header: 'Nombre', accessor: 'nombre' as const },
    { header: 'Tiempo Est.', accessor: (row: any) => row.tiempoEstimado ? `${row.tiempoEstimado} min` : '-' },
    { header: 'Estado', accessor: (row: any) => <Badge variant={row.activo ? 'success' : 'danger'}>{row.activo ? 'Activo' : 'Inactivo'}</Badge> },
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
        <h1>Catálogo de Servicios</h1>
        <button onClick={() => abrirModal()}>+ Nuevo Servicio</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={servicios} columns={columns} />
      )}

      <Modal isOpen={modalOpen} onClose={cerrarModal} title={editando ? 'Editar Servicio' : 'Nuevo Servicio'}>
        <form onSubmit={guardar} className="form">
          <div className="form-row">
            <label>
              Código *
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
              />
            </label>
            <label>
              Nombre *
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </label>
          </div>

          <label>
            Descripción
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
            />
          </label>

          <label>
            Tiempo Estimado (min)
            <input
              type="number"
              value={formData.tiempoEstimado}
              onChange={(e) => setFormData({ ...formData, tiempoEstimado: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
            />
            Activo
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
