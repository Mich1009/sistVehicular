import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { api } from '../../api/api';

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    razonSocial: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await api.clientes.listar();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar supervisores:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (cliente?: any) => {
    if (cliente) {
      setEditando(cliente);
      setFormData(cliente);
    } else {
      setEditando(null);
      setFormData({
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        razonSocial: '',
        telefono: '',
        email: '',
        direccion: '',
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
      const p = {
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento.trim(),
        nombres: formData.nombres.trim() || undefined,
        apellidos: formData.apellidos.trim() || undefined,
        razonSocial: formData.razonSocial.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
      };
      if (p.tipoDocumento === 'RUC' && !p.nombres) {
        p.nombres = p.razonSocial;
      }
      if (editando) {
        await api.clientes.actualizar(editando.id, p);
      } else {
        await api.clientes.crear(p);
      }
      cerrarModal();
      cargarClientes();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el cliente');
    }
  };

  const autoCompletarPorDocumento = async () => {
    if (editando) return;
    const num = formData.numeroDocumento;
    if (formData.tipoDocumento === 'RUC' && /^\d{11}$/.test(num)) {
      try {
        const c = await api.clientes.obtenerPorDocumento(num);
        setFormData({
          tipoDocumento: 'RUC',
          numeroDocumento: c.numeroDocumento,
          nombres: c.nombres || '',
          apellidos: c.apellidos || '',
          razonSocial: c.razonSocial || '',
          telefono: c.telefono || '',
          email: c.email || '',
          direccion: c.direccion || '',
        });
      } catch {
        try {
          const c = await api.clientes.consultarExternoRuc(num);
          setFormData({
            tipoDocumento: 'RUC',
            numeroDocumento: c.numeroDocumento,
            nombres: c.nombres || '',
            apellidos: c.apellidos || '',
            razonSocial: c.razonSocial || '',
            telefono: c.telefono || '',
            email: c.email || '',
            direccion: c.direccion || '',
          });
        } catch {}
      }
    }
    if (formData.tipoDocumento === 'DNI' && /^\d{8}$/.test(num)) {
      try {
        const c = await api.clientes.obtenerPorDocumento(num);
        setFormData({
          tipoDocumento: 'DNI',
          numeroDocumento: c.numeroDocumento,
          nombres: c.nombres || '',
          apellidos: c.apellidos || '',
          razonSocial: c.razonSocial || '',
          telefono: c.telefono || '',
          email: c.email || '',
          direccion: c.direccion || '',
        });
      } catch {
        try {
          const c = await api.clientes.consultarExternoDni(num);
          setFormData({
            tipoDocumento: 'DNI',
            numeroDocumento: c.numeroDocumento,
            nombres: c.nombres || '',
            apellidos: c.apellidos || '',
            razonSocial: c.razonSocial || '',
            telefono: c.telefono || '',
            email: c.email || '',
            direccion: c.direccion || '',
          });
        } catch {}
      }
    }
  };

  useEffect(() => {
  }, [formData.tipoDocumento, formData.numeroDocumento, editando]);

  const eliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    try {
      await api.clientes.eliminar(id);
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const columns = [
    { header: 'Documento', accessor: (row: any) => `${row.tipoDocumento} ${row.numeroDocumento}` },
    { header: 'Nombre', accessor: (row: any) => row.razonSocial || `${row.nombres} ${row.apellidos || ''}` },
    { header: 'Teléfono', accessor: 'telefono' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Vehículos', accessor: (row: any) => row.vehiculos?.length || 0 },
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
        <h1>Clientes</h1>
        <button onClick={() => abrirModal()}>+ Nuevo Cliente</button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={clientes} columns={columns} />
      )}

      <Modal isOpen={modalOpen} onClose={cerrarModal} title={editando ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={guardar} className="form">
          <div className="form-row">
            <label>
              Tipo de Documento
              <select
                value={formData.tipoDocumento}
                onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                required
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
              </select>
            </label>
            <label>
              Número de Documento
              <input
                type="text"
                value={formData.numeroDocumento}
                onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                onKeyDown={(e) => { if ((e as any).key === 'Enter') { e.preventDefault(); autoCompletarPorDocumento(); } }}
                required
              />
            </label>
          </div>

          {formData.tipoDocumento === 'RUC' ? (
            <label>
              Área / Departamento
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                placeholder="Ej: Departamento de Transporte"
              />
            </label>
          ) : (
            <div className="form-row">
              <label>
                Nombres
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  required
                />
              </label>
              <label>
                Apellidos
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                />
              </label>
            </div>
          )}

          <div className="form-row">
            <label>
              Teléfono
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>
          </div>

          <label>
            Dirección
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
