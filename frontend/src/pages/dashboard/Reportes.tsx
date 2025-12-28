import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { api } from '../../api/api';

export default function Reportes() {
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [modalPeriodo, setModalPeriodo] = useState(false);
  const [modalRepuestos, setModalRepuestos] = useState(false);
  const [modalPreventivos, setModalPreventivos] = useState(false);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const data = await api.vehiculos.listar();
      setVehiculos(data);
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const generarReporteVehiculo = async () => {
    if (!vehiculoSeleccionado) {
      alert('Seleccione un vehículo');
      return;
    }

    setGenerando(true);
    try {
      const vehiculo = await api.vehiculos.obtener(vehiculoSeleccionado);
      generarPDFVehiculo(vehiculo);
      setModalVehiculo(false);
      setVehiculoSeleccionado('');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const generarReportePeriodo = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Seleccione el rango de fechas');
      return;
    }

    setGenerando(true);
    try {
      const ordenes = await api.ordenes.listar();
      const ordenesFiltradas = ordenes.filter((o: any) => {
        const fecha = new Date(o.fechaIngreso);
        return fecha >= new Date(fechaInicio) && fecha <= new Date(fechaFin);
      });
      generarPDFPeriodo(ordenesFiltradas, fechaInicio, fechaFin);
      setModalPeriodo(false);
      setFechaInicio('');
      setFechaFin('');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const generarPDFVehiculo = (vehiculo: any) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Mantenimientos - ${vehiculo.placa}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .info-section { margin: 20px 0; }
          .info-section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
          .info-item { padding: 8px; background: #f5f5f5; border-radius: 4px; }
          .info-item strong { color: #555; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #333; color: white; }
          tr:hover { background-color: #f5f5f5; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-preventivo { background: #4ade80; color: #000; }
          .badge-correctivo { background: #f87171; color: #fff; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE MANTENIMIENTOS</h1>
          <p>Sistema de Gestión Vehicular</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="info-section">
          <h2>Información del Vehículo</h2>
          <div class="info-grid">
            <div class="info-item"><strong>Placa:</strong> ${vehiculo.placa}</div>
            <div class="info-item"><strong>Marca:</strong> ${vehiculo.marca}</div>
            <div class="info-item"><strong>Modelo:</strong> ${vehiculo.modelo}</div>
            <div class="info-item"><strong>Año:</strong> ${vehiculo.anio}</div>
            <div class="info-item"><strong>Color:</strong> ${vehiculo.color || 'N/A'}</div>
            <div class="info-item"><strong>Kilometraje:</strong> ${vehiculo.kilometraje ? vehiculo.kilometraje.toLocaleString() + ' km' : 'N/A'}</div>
            <div class="info-item"><strong>Supervisor:</strong> ${vehiculo.cliente?.razonSocial || vehiculo.cliente?.nombres + ' ' + (vehiculo.cliente?.apellidos || '')}</div>
            <div class="info-item"><strong>VIN:</strong> ${vehiculo.vin || 'N/A'}</div>
          </div>
        </div>

        <div class="info-section">
          <h2>Historial de Mantenimientos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Kilometraje</th>
              </tr>
            </thead>
            <tbody>
              ${vehiculo.historial && vehiculo.historial.length > 0 ? vehiculo.historial.map((h: any) => `
                <tr>
                  <td>${new Date(h.fecha).toLocaleDateString()}</td>
                  <td><span class="badge badge-${h.tipo.toLowerCase()}">${h.tipo}</span></td>
                  <td>${h.descripcion}</td>
                  <td>${h.kilometraje ? h.kilometraje.toLocaleString() + ' km' : 'N/A'}</td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align: center;">No hay historial de mantenimientos</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="info-section">
          <h2>Órdenes de Trabajo</h2>
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Servicios</th>
              </tr>
            </thead>
            <tbody>
              ${vehiculo.ordenes && vehiculo.ordenes.length > 0 ? vehiculo.ordenes.map((o: any) => `
                <tr>
                  <td>${o.numero}</td>
                  <td>${new Date(o.fechaIngreso).toLocaleDateString()}</td>
                  <td><span class="badge badge-${o.tipo.toLowerCase()}">${o.tipo}</span></td>
                  <td>${o.estado}</td>
                  <td>${o.servicios?.length || 0} servicio(s)</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center;">No hay órdenes de trabajo</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Este documento fue generado automáticamente por el Sistema de Gestión Vehicular</p>
          <p>Total de mantenimientos: ${vehiculo.historial?.length || 0} | Total de órdenes: ${vehiculo.ordenes?.length || 0}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 250);
    }
  };

  const generarReporteRepuestos = async () => {
    setGenerando(true);
    try {
      const movimientos = await api.repuestos.movimientos();
      const repuestos = await api.repuestos.listar();
      
      // Calcular consumo por repuesto
      const consumoPorRepuesto: any = {};
      movimientos.forEach((m: any) => {
        if (m.tipo === 'SALIDA') {
          if (!consumoPorRepuesto[m.repuestoId]) {
            consumoPorRepuesto[m.repuestoId] = {
              repuesto: m.repuesto,
              cantidad: 0,
            };
          }
          consumoPorRepuesto[m.repuestoId].cantidad += m.cantidad;
        }
      });

      const consumoArray = Object.values(consumoPorRepuesto).sort((a: any, b: any) => b.cantidad - a.cantidad);
      generarPDFRepuestos(consumoArray, repuestos);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const generarReportePreventivos = async () => {
    setGenerando(true);
    try {
      const vehiculos = await api.vehiculos.listar();
      const ordenes = await api.ordenes.listar();
      
      // Filtrar vehículos que necesitan mantenimiento preventivo
      const vehiculosPreventivos = vehiculos.map((v: any) => {
        const ultimaOrden = ordenes
          .filter((o: any) => o.vehiculoId === v.id && o.tipo === 'PREVENTIVO')
          .sort((a: any, b: any) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())[0];
        
        return {
          ...v,
          ultimoMantenimiento: ultimaOrden?.fechaIngreso,
          kilometrajeUltimoMantenimiento: ultimaOrden?.kilometrajeActual,
        };
      });

      generarPDFPreventivos(vehiculosPreventivos);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteEstadisticas = async () => {
    setGenerando(true);
    try {
      const [ordenes, vehiculos, repuestos, clientes] = await Promise.all([
        api.ordenes.listar(),
        api.vehiculos.listar(),
        api.repuestos.listar(),
        api.clientes.listar(),
      ]);

      const stats = await api.ordenes.estadisticas();
      generarPDFEstadisticas(stats, ordenes, vehiculos, repuestos, clientes);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const generarPDFRepuestos = (consumo: any[], repuestos: any[]) => {
    const repuestosBajoStock = repuestos.filter(r => r.stockActual <= r.stockMinimo);
    
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Consumo de Repuestos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .info-section { margin: 20px 0; }
          .info-section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
          .stat-card h3 { margin: 0; font-size: 32px; color: #333; }
          .stat-card p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #333; color: white; }
          tr:hover { background-color: #f5f5f5; }
          .alert { background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE CONSUMO DE REPUESTOS</h1>
          <p>Sistema de Gestión Vehicular</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>${repuestos.length}</h3>
            <p>Total Repuestos</p>
          </div>
          <div class="stat-card">
            <h3>${repuestosBajoStock.length}</h3>
            <p>Bajo Stock</p>
          </div>
          <div class="stat-card">
            <h3>${consumo.reduce((sum, c) => sum + c.cantidad, 0)}</h3>
            <p>Total Consumido</p>
          </div>
        </div>

        ${repuestosBajoStock.length > 0 ? `
          <div class="alert">
            <strong>⚠️ Alerta:</strong> Hay ${repuestosBajoStock.length} repuesto(s) con stock bajo que requieren reposición.
          </div>
        ` : ''}

        <div class="info-section">
          <h2>Repuestos Más Consumidos</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Cantidad Consumida</th>
                <th>Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              ${consumo.length > 0 ? consumo.slice(0, 20).map((c: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${c.repuesto?.codigo || 'N/A'}</td>
                  <td>${c.repuesto?.nombre || 'N/A'}</td>
                  <td>${c.repuesto?.marca || 'N/A'}</td>
                  <td><strong>${c.cantidad}</strong></td>
                  <td>${c.repuesto?.stockActual || 0}</td>
                </tr>
              `).join('') : '<tr><td colspan="6" style="text-align: center;">No hay datos de consumo</td></tr>'}
            </tbody>
          </table>
        </div>

        ${repuestosBajoStock.length > 0 ? `
          <div class="info-section">
            <h2>Repuestos con Stock Bajo</h2>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Ubicación</th>
                </tr>
              </thead>
              <tbody>
                ${repuestosBajoStock.map((r: any) => `
                  <tr style="background: #fef3c7;">
                    <td>${r.codigo}</td>
                    <td>${r.nombre}</td>
                    <td><strong>${r.stockActual}</strong></td>
                    <td>${r.stockMinimo}</td>
                    <td>${r.ubicacion || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <div class="footer">
          <p>Este documento fue generado automáticamente por el Sistema de Gestión Vehicular</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => ventana.print(), 250);
    }
  };

  const generarPDFPreventivos = (vehiculos: any[]) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Mantenimientos Preventivos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .info-section { margin: 20px 0; }
          .info-section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #333; color: white; }
          tr:hover { background-color: #f5f5f5; }
          .alert { background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE MANTENIMIENTOS PREVENTIVOS</h1>
          <p>Sistema de Gestión Vehicular</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="alert">
          <strong>ℹ️ Información:</strong> Este reporte muestra todos los vehículos y su último mantenimiento preventivo registrado.
        </div>

        <div class="info-section">
          <h2>Estado de Vehículos</h2>
          <table>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca/Modelo</th>
                <th>Año</th>
                <th>Kilometraje Actual</th>
                <th>Último Mantenimiento</th>
                <th>Km Último Mant.</th>
              </tr>
            </thead>
            <tbody>
              ${vehiculos.map((v: any) => `
                <tr>
                  <td><strong>${v.placa}</strong></td>
                  <td>${v.marca} ${v.modelo}</td>
                  <td>${v.anio}</td>
                  <td>${v.kilometraje ? v.kilometraje.toLocaleString() + ' km' : 'N/A'}</td>
                  <td>${v.ultimoMantenimiento ? new Date(v.ultimoMantenimiento).toLocaleDateString() : 'Sin registro'}</td>
                  <td>${v.kilometrajeUltimoMantenimiento ? v.kilometrajeUltimoMantenimiento.toLocaleString() + ' km' : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Este documento fue generado automáticamente por el Sistema de Gestión Vehicular</p>
          <p>Total de vehículos: ${vehiculos.length}</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => ventana.print(), 250);
    }
  };

  const generarPDFEstadisticas = (stats: any, ordenes: any[], vehiculos: any[], repuestos: any[], clientes: any[]) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Estadísticas Generales del Taller</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; border: 2px solid #ddd; }
          .stat-card h3 { margin: 0; font-size: 36px; color: #333; }
          .stat-card p { margin: 5px 0 0 0; color: #666; font-size: 14px; font-weight: bold; }
          .info-section { margin: 30px 0; }
          .info-section h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .chart-bar { background: #4ade80; height: 30px; border-radius: 4px; margin: 5px 0; display: flex; align-items: center; padding: 0 10px; color: #000; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ESTADÍSTICAS GENERALES DEL TALLER</h1>
          <p>Sistema de Gestión Vehicular</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>${ordenes.length}</h3>
            <p>TOTAL ÓRDENES</p>
          </div>
          <div class="stat-card">
            <h3>${vehiculos.length}</h3>
            <p>VEHÍCULOS</p>
          </div>
          <div class="stat-card">
            <h3>${repuestos.length}</h3>
            <p>REPUESTOS</p>
          </div>
          <div class="stat-card">
            <h3>${clientes.length}</h3>
            <p>SUPERVISORES</p>
          </div>
        </div>

        <div class="info-section">
          <h2>Estado de Órdenes</h2>
          <div style="margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Pendientes:</strong></p>
            <div class="chart-bar" style="width: ${(stats.pendientes / stats.total * 100)}%; background: #fbbf24;">
              ${stats.pendientes} (${((stats.pendientes / stats.total) * 100).toFixed(1)}%)
            </div>
            
            <p style="margin: 15px 0 5px 0;"><strong>En Proceso:</strong></p>
            <div class="chart-bar" style="width: ${(stats.enProceso / stats.total * 100)}%; background: #60a5fa;">
              ${stats.enProceso} (${((stats.enProceso / stats.total) * 100).toFixed(1)}%)
            </div>
            
            <p style="margin: 15px 0 5px 0;"><strong>Completadas:</strong></p>
            <div class="chart-bar" style="width: ${(stats.completadas / stats.total * 100)}%; background: #4ade80;">
              ${stats.completadas} (${((stats.completadas / stats.total) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Tipos de Mantenimiento</h2>
          <div style="margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Preventivos:</strong></p>
            <div class="chart-bar" style="width: ${(ordenes.filter((o: any) => o.tipo === 'PREVENTIVO').length / ordenes.length * 100)}%;">
              ${ordenes.filter((o: any) => o.tipo === 'PREVENTIVO').length} (${((ordenes.filter((o: any) => o.tipo === 'PREVENTIVO').length / ordenes.length) * 100).toFixed(1)}%)
            </div>
            
            <p style="margin: 15px 0 5px 0;"><strong>Correctivos:</strong></p>
            <div class="chart-bar" style="width: ${(ordenes.filter((o: any) => o.tipo === 'CORRECTIVO').length / ordenes.length * 100)}%; background: #f87171;">
              ${ordenes.filter((o: any) => o.tipo === 'CORRECTIVO').length} (${((ordenes.filter((o: any) => o.tipo === 'CORRECTIVO').length / ordenes.length) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Este documento fue generado automáticamente por el Sistema de Gestión Vehicular</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => ventana.print(), 250);
    }
  };

  const generarPDFPeriodo = (ordenes: any[], inicio: string, fin: string) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Órdenes por Período</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .info-section { margin: 20px 0; }
          .info-section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
          .stat-card h3 { margin: 0; font-size: 32px; color: #333; }
          .stat-card p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #333; color: white; }
          tr:hover { background-color: #f5f5f5; }
          .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge-preventivo { background: #4ade80; color: #000; }
          .badge-correctivo { background: #f87171; color: #fff; }
          .badge-pendiente { background: #fbbf24; color: #000; }
          .badge-en_proceso { background: #60a5fa; color: #fff; }
          .badge-completada { background: #4ade80; color: #000; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE ÓRDENES POR PERÍODO</h1>
          <p>Sistema de Gestión Vehicular</p>
          <p>Período: ${new Date(inicio).toLocaleDateString()} - ${new Date(fin).toLocaleDateString()}</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>${ordenes.length}</h3>
            <p>Total Órdenes</p>
          </div>
          <div class="stat-card">
            <h3>${ordenes.filter(o => o.tipo === 'PREVENTIVO').length}</h3>
            <p>Preventivos</p>
          </div>
          <div class="stat-card">
            <h3>${ordenes.filter(o => o.tipo === 'CORRECTIVO').length}</h3>
            <p>Correctivos</p>
          </div>
          <div class="stat-card">
            <h3>${ordenes.filter(o => o.estado === 'COMPLETADA').length}</h3>
            <p>Completadas</p>
          </div>
        </div>

        <div class="info-section">
          <h2>Detalle de Órdenes</h2>
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Supervisor</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${ordenes.length > 0 ? ordenes.map((o: any) => `
                <tr>
                  <td>${o.numero}</td>
                  <td>${new Date(o.fechaIngreso).toLocaleDateString()}</td>
                  <td>${o.vehiculo?.placa} - ${o.vehiculo?.marca} ${o.vehiculo?.modelo}</td>
                  <td>${o.cliente?.razonSocial || o.cliente?.nombres + ' ' + (o.cliente?.apellidos || '')}</td>
                  <td><span class="badge badge-${o.tipo.toLowerCase()}">${o.tipo}</span></td>
                  <td><span class="badge badge-${o.estado.toLowerCase()}">${o.estado}</span></td>
                </tr>
              `).join('') : '<tr><td colspan="6" style="text-align: center;">No hay órdenes en este período</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Este documento fue generado automáticamente por el Sistema de Gestión Vehicular</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 250);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Reportes y Estadísticas</h1>
        <p>Generación de reportes del sistema</p>
      </div>

      <section className="grid">
        <article className="card" onClick={() => setModalPeriodo(true)}>
          <h3>📊 Órdenes por Período</h3>
          <p>Reporte de órdenes de trabajo por rango de fechas</p>
          <button>Generar</button>
        </article>
        <article className="card" onClick={() => setModalVehiculo(true)}>
          <h3>🚗 Mantenimientos por Vehículo</h3>
          <p>Historial completo de mantenimientos por vehículo</p>
          <button>Generar</button>
        </article>
        <article className="card" onClick={() => generarReporteRepuestos()}>
          <h3>📦 Consumo de Repuestos</h3>
          <p>Reporte de repuestos más utilizados</p>
          <button>Generar</button>
        </article>
        <article className="card" onClick={() => generarReporteEstadisticas()}>
          <h3>📈 Estadísticas Generales</h3>
          <p>Dashboard con métricas del taller</p>
          <button>Generar</button>
        </article>
        <article className="card" onClick={() => generarReportePreventivos()}>
          <h3>⚠️ Mantenimientos Preventivos</h3>
          <p>Vehículos próximos a mantenimiento preventivo</p>
          <button>Generar</button>
        </article>
      </section>

      <Modal isOpen={modalVehiculo} onClose={() => setModalVehiculo(false)} title="Reporte de Mantenimientos por Vehículo">
        <div className="form">
          <label>
            Seleccione un Vehículo *
            <select
              value={vehiculoSeleccionado}
              onChange={(e) => setVehiculoSeleccionado(e.target.value)}
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

          <div className="form-actions">
            <button type="button" onClick={() => setModalVehiculo(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={generarReporteVehiculo} disabled={generando}>
              {generando ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalPeriodo} onClose={() => setModalPeriodo(false)} title="Reporte de Órdenes por Período">
        <div className="form">
          <div className="form-row">
            <label>
              Fecha Inicio *
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </label>
            <label>
              Fecha Fin *
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setModalPeriodo(false)} className="btn-secondary">
              Cancelar
            </button>
            <button onClick={generarReportePeriodo} disabled={generando}>
              {generando ? 'Generando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
