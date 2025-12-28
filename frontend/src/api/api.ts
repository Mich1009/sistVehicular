const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const authHeader = (): Record<string, string> => {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const api = {
  // Clientes
  clientes: {
    listar: () => fetch(`${API_URL}/clientes`, { headers: authHeader() }).then(r => r.json()),
    obtener: (id: string) => fetch(`${API_URL}/clientes/${id}`, { headers: authHeader() }).then(r => r.json()),
    obtenerPorRuc: (ruc: string) => fetch(`${API_URL}/clientes/ruc/${ruc}`, { headers: authHeader() }).then(async r => {
      if (!r.ok) throw new Error(await r.text() || 'RUC no encontrado');
      return r.json();
    }),
    obtenerPorDocumento: (numero: string) => fetch(`${API_URL}/clientes/documento/${numero}`, { headers: authHeader() }).then(async r => {
      if (!r.ok) throw new Error(await r.text() || 'Documento no encontrado');
      return r.json();
    }),
    consultarExternoRuc: (ruc: string) => fetch(`${API_URL}/clientes/externo/ruc/${ruc}`, { headers: authHeader() }).then(async r => {
      if (!r.ok) throw new Error(await r.text() || 'Servicio RUC no disponible');
      return r.json();
    }),
    consultarExternoDni: (dni: string) => fetch(`${API_URL}/clientes/externo/dni/${dni}`, { headers: authHeader() }).then(async r => {
      if (!r.ok) throw new Error(await r.text() || 'Servicio DNI no disponible');
      return r.json();
    }),
    crear: (data: any) => fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(async r => { if (!r.ok) throw new Error(await r.text() || 'Error al crear'); return r.json(); }),
    actualizar: (id: string, data: any) => fetch(`${API_URL}/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(async r => { if (!r.ok) throw new Error(await r.text() || 'Error al actualizar'); return r.json(); }),
    eliminar: (id: string) => fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE', headers: authHeader() }),
    buscar: (q: string) => fetch(`${API_URL}/clientes/buscar?q=${q}`, { headers: authHeader() }).then(r => r.json()),
  },

  // Vehículos
  vehiculos: {
    listar: () => fetch(`${API_URL}/vehiculos`, { headers: authHeader() }).then(r => r.json()),
    obtener: (id: string) => fetch(`${API_URL}/vehiculos/${id}`, { headers: authHeader() }).then(r => r.json()),
    crear: (data: any) => fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    actualizar: (id: string, data: any) => fetch(`${API_URL}/vehiculos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    eliminar: (id: string) => fetch(`${API_URL}/vehiculos/${id}`, { method: 'DELETE', headers: authHeader() }),
    buscar: (q: string) => fetch(`${API_URL}/vehiculos/buscar?q=${q}`, { headers: authHeader() }).then(r => r.json()),
  },

  // Servicios
  servicios: {
    listar: () => fetch(`${API_URL}/servicios`, { headers: authHeader() }).then(r => r.json()),
    listarActivos: () => fetch(`${API_URL}/servicios/activos`, { headers: authHeader() }).then(r => r.json()),
    obtener: (id: string) => fetch(`${API_URL}/servicios/${id}`, { headers: authHeader() }).then(r => r.json()),
    crear: (data: any) => fetch(`${API_URL}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    actualizar: (id: string, data: any) => fetch(`${API_URL}/servicios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    eliminar: (id: string) => fetch(`${API_URL}/servicios/${id}`, { method: 'DELETE', headers: authHeader() }),
  },

  // Repuestos
  repuestos: {
    listar: () => fetch(`${API_URL}/repuestos`, { headers: authHeader() }).then(r => r.json()),
    listarActivos: () => fetch(`${API_URL}/repuestos/activos`, { headers: authHeader() }).then(r => r.json()),
    listarBajoStock: () => fetch(`${API_URL}/repuestos/bajo-stock`, { headers: authHeader() }).then(r => r.json()),
    obtener: (id: string) => fetch(`${API_URL}/repuestos/${id}`, { headers: authHeader() }).then(r => r.json()),
    crear: (data: any) => fetch(`${API_URL}/repuestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    actualizar: (id: string, data: any) => fetch(`${API_URL}/repuestos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    eliminar: (id: string) => fetch(`${API_URL}/repuestos/${id}`, { method: 'DELETE', headers: authHeader() }),
    movimientos: () => fetch(`${API_URL}/repuestos/movimientos`, { headers: authHeader() }).then(r => r.json()),
    registrarMovimiento: (data: any) => fetch(`${API_URL}/repuestos/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  },

  // Órdenes
  ordenes: {
    listar: () => fetch(`${API_URL}/ordenes`, { headers: authHeader() }).then(r => r.json()),
    obtener: (id: string) => fetch(`${API_URL}/ordenes/${id}`, { headers: authHeader() }).then(r => r.json()),
    crear: (data: any) => fetch(`${API_URL}/ordenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    actualizar: (id: string, data: any) => fetch(`${API_URL}/ordenes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    eliminar: (id: string) => fetch(`${API_URL}/ordenes/${id}`, { method: 'DELETE', headers: authHeader() }),
    estadisticas: () => fetch(`${API_URL}/ordenes/estadisticas`, { headers: authHeader() }).then(r => r.json()),
    agregarServicio: (id: string, data: any) => fetch(`${API_URL}/ordenes/${id}/servicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    agregarRepuesto: (id: string, data: any) => fetch(`${API_URL}/ordenes/${id}/repuestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  },

  // Mantenimientos
  mantenimientos: {
    proximos: () => fetch(`${API_URL}/mantenimientos/proximos`, { headers: authHeader() }).then(r => r.json()),
    configuracionVehiculo: (vehiculoId: string) => fetch(`${API_URL}/mantenimientos/vehiculo/${vehiculoId}`, { headers: authHeader() }).then(r => r.json()),
    configurar: (data: any) => fetch(`${API_URL}/mantenimientos/configurar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    completar: (ordenId: string, configuracion: any) => fetch(`${API_URL}/mantenimientos/completar/${ordenId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(configuracion),
    }).then(r => r.json()),
  },
};
