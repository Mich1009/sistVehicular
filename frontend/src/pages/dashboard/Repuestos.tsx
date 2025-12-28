import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import Badge from '../../components/Badge';
import { api } from '../../api/api';

export default function Repuestos() {
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [repuestoMovimiento, setRepuestoMovimiento] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Obtener rol del usuario
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(user.role || '');
    } catch {}
  }, []);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    marca: '',
    stockActual: 0,
    stockMinimo: 5,
    precioCompra: 0,
    precioVenta: 0,
    ubicacion: '',
    activo: true,
  });
  const [movimientoData, setMovimientoData] = useState({
    tipo: 'ENTRADA',
    cantidad: 0,
    motivo: '',
  });

  useEffect(() => {
    cargarRepuestos();
  }, []);

  const cargarRepuestos = async () => {
    setLoading(true);
    try {
      const data = await api.repuestos.listar();
      setRepuestos(data);
    } catch (error) {
      console.error('Error al cargar repuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (repuesto?: any) => {
    if (repuesto) {
      setEditando(repuesto);
      setFormData(repuesto);
    } else {
      setEditando(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        marca: '',
        stockActual: 0,
        stockMinimo: 5,
        precioCompra: 0,
        precioVenta: 0,
        ubicacion: '',
        activo: true,
      });
    }
    setModalOpen(true);
  };

  const abrirModalMovimiento = (repuesto: any) => {
    setRepuestoMovimiento(repuesto);
    setMovimientoData({ tipo: 'ENTRADA', cantidad: 0, motivo: '' });
    setModalMovimiento(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
  };

  const cerrarModalMovimiento = () => {
    setModalMovimiento(false);
    setRepuestoMovimiento(null);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.repuestos.actualizar(editando.id, formData);
      } else {
        await api.repuestos.crear(formData);
      }
      cerrarModal();
      cargarRepuestos();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el repuesto');
    }
  };

  const registrarMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repuestoMovimiento) return;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.repuestos.registrarMovimiento({
        ...movimientoData,
        repuestoId: repuestoMovimiento.id,
        usuarioId: user.id || 'SISTEMA',
      });
      cerrarModalMovimiento();
      cargarRepuestos();
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      alert('Error al registrar el movimiento');
    }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este repuesto?')) return;
    try {
      await api.repuestos.eliminar(id);
      cargarRepuestos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el repuesto');
    }
  };

  const columns = [
    { header: 'Código', accessor: 'codigo' as const },
    { header: 'Nombre', accessor: 'nombre' as const },
    { header: 'Marca', accessor: 'marca' as const },
    { header: 'Stock', accessor: (row: any) => {
      const bajoStock = row.stockActual <= row.stockMinimo;
      return <Badge variant={bajoStock ? 'danger' : 'success'}>{row.stockActual}</Badge>;
    }},
    { header: 'Stock Mín.', accessor: 'stockMinimo' as const },
    { header: 'Ubicación', accessor: 'ubicacion' as const },
    ...(userRole !== 'TECNICO' ? [{
      header: 'Acciones',
      accessor: (row: any) => (
        <div className="table-actions">
          <button onClick={(e) => { e.stopPropagation(); abrirModalMovimiento(row); }} className="btn-info">
            Movimiento
          </button>
          <button onClick={(e) => { e.stopPropagation(); abrirModal(row); }}>Editar</button>
          <button onClick={(e) => { e.stopPropagation(); eliminar(row.id); }} className="btn-danger">
            Eliminar
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Inventario de Repuestos</h1>
        {userRole !== 'TECNICO' && (
          <button onClick={() => abrirModal()}>+ Nuevo Repuesto</button>
        )}
      </div>

      {userRole === 'TECNICO' && (
        <div className="info-box" style={{ marginBottom: '1rem' }}>
          <strong>ℹ️ Modo de solo lectura</strong>
          <p>Como técnico, puedes consultar el stock disponible pero no realizar modificaciones.</p>
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table data={repuestos} columns={columns} />
      )}

      <Modal isOpen={modalOpen} onClose={cerrarModal} title={editando ? 'Editar Repuesto' : 'Nuevo Repuesto'}>
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
              rows={2}
            />
          </label>

          <div className="form-row">
            <label>
              Marca
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
            </label>
            <label>
              Ubicación
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: A-01"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Stock Actual *
              <input
                type="number"
                value={formData.stockActual}
                onChange={(e) => setFormData({ ...formData, stockActual: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </label>
            <label>
              Stock Mínimo *
              <input
                type="number"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </label>
          </div>



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

      <Modal isOpen={modalMovimiento} onClose={cerrarModalMovimiento} title="Registrar Movimiento">
        <form onSubmit={registrarMovimiento} className="form">
          {repuestoMovimiento && (
            <div className="info-box">
              <strong>{repuestoMovimiento.nombre}</strong>
              <p>Stock actual: {repuestoMovimiento.stockActual}</p>
            </div>
          )}

          <label>
            Tipo de Movimiento *
            <select
              value={movimientoData.tipo}
              onChange={(e) => setMovimientoData({ ...movimientoData, tipo: e.target.value })}
              required
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
              <option value="DEVOLUCION">Devolución</option>
            </select>
          </label>

          <label>
            Cantidad *
            <input
              type="number"
              value={movimientoData.cantidad}
              onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: parseInt(e.target.value) || 0 })}
              required
              min="1"
            />
          </label>

          <label>
            Motivo
            <textarea
              value={movimientoData.motivo}
              onChange={(e) => setMovimientoData({ ...movimientoData, motivo: e.target.value })}
              rows={2}
              placeholder="Descripción del movimiento"
            />
          </label>

          <div className="form-actions">
            <button type="button" onClick={cerrarModalMovimiento} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit">Registrar</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
