# Sistema de Gestión de Taller Automotor (SIMV)

Sistema completo para la gestión de talleres de reparación y mantenimiento vehicular, con control de mantenimientos correctivos y preventivos, inventario, clientes y reportes.

## 🚀 Características Principales

### Gestión de Clientes
- Registro de clientes (personas y empresas)
- Búsqueda rápida por documento, nombre o razón social
- Historial de vehículos y órdenes por cliente

### Gestión de Vehículos
- Registro completo de vehículos (placa, marca, modelo, año, VIN, etc.)
- Asociación con clientes
- Historial de mantenimientos por vehículo
- Control de kilometraje

### Catálogo de Servicios
- Servicios predefinidos con precios
- Tiempo estimado de ejecución
- Activación/desactivación de servicios

### Inventario de Repuestos
- Control de stock en tiempo real
- Alertas de stock mínimo
- Precios de compra y venta
- Ubicación en almacén
- Registro de movimientos (entradas, salidas, ajustes, devoluciones)

### Órdenes de Trabajo
- Creación de órdenes de mantenimiento preventivo y correctivo
- Asignación de técnicos
- Selección de servicios y repuestos
- Cálculo automático de totales
- Estados: Pendiente, En Proceso, Pausada, Completada, Cancelada
- Fecha promesa de entrega
- Diagnóstico y observaciones

### Control de Usuarios
- Roles: Administrador, Técnico, Almacén
- Autenticación segura con bcrypt
- Recuperación de contraseña

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Tipado estático
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL** - Base de datos
- **bcrypt** - Encriptación de contraseñas

### Frontend
- **React 19** - Librería UI
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **Vite** - Build tool

## 📦 Instalación

### Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Configurar Base de Datos

Crear una base de datos PostgreSQL:
```sql
CREATE DATABASE sist_vehiculo;
```

### 2. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
DATABASE_URL="postgresql://usuario:password@localhost:5432/sist_vehiculo"
PORT=3000

# Sincronizar base de datos
npx prisma db push

# Cargar datos de prueba
npx tsx prisma/seed.ts

# Iniciar servidor
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Crear archivo .env con:
VITE_API_URL=http://localhost:3000

# Iniciar aplicación
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🚀 Inicio del Sistema

Necesitas abrir **dos terminales** para ejecutar el backend y frontend:

### Terminal 1 - Backend

```bash
cd backend
npm install  # Solo la primera vez
npm run start:dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

### URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 👤 Usuarios de Prueba

Después de ejecutar el seed, puedes acceder con:

- **Administrador**
  - Email: `admin@taller.com`
  - Contraseña: `admin123`

- **Técnico**
  - Email: `tecnico@taller.com`
  - Contraseña: `tecnico123`

- **Almacén**
  - Email: `almacen@taller.com`
  - Contraseña: `almacen123`

## 📋 Uso del Sistema

### Panel de Administrador
- Acceso completo a todas las funcionalidades
- Gestión de clientes, vehículos, servicios y repuestos
- Creación y seguimiento de órdenes de trabajo
- Visualización de estadísticas

### Panel de Técnico
- Visualización de órdenes asignadas
- Actualización de estado de órdenes
- Consulta de historial de vehículos
- Acceso al catálogo de servicios

### Panel de Almacén
- Gestión de inventario de repuestos
- Registro de movimientos (entradas/salidas)
- Alertas de stock bajo
- Consulta de repuestos utilizados en órdenes

## 🔄 Flujo de Trabajo Típico

1. **Registrar Cliente**: Crear o buscar cliente en el sistema
2. **Registrar Vehículo**: Asociar vehículo al cliente
3. **Crear Orden de Trabajo**: 
   - Seleccionar cliente y vehículo
   - Definir tipo (preventivo/correctivo)
   - Agregar servicios necesarios
   - Agregar repuestos (descuenta automáticamente del stock)
   - Asignar técnico
4. **Ejecutar Trabajo**: Técnico actualiza estado de la orden
5. **Completar Orden**: Marcar como completada con fecha de finalización
6. **Historial**: El sistema registra automáticamente en el historial del vehículo

## 📊 Estructura de la Base de Datos

- **User**: Usuarios del sistema
- **Cliente**: Clientes del taller
- **Vehiculo**: Vehículos registrados
- **Servicio**: Catálogo de servicios
- **Repuesto**: Inventario de repuestos
- **OrdenTrabajo**: Órdenes de trabajo
- **OrdenServicio**: Servicios en una orden
- **OrdenRepuesto**: Repuestos en una orden
- **MovimientoInventario**: Movimientos de stock
- **HistorialMantenimiento**: Historial por vehículo

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de datos con class-validator
- CORS configurado para desarrollo
- Tokens de recuperación de contraseña con expiración

## 🚧 Próximas Mejoras

- [ ] Implementar JWT para autenticación stateless
- [ ] Sistema de permisos granular
- [ ] Reportes en PDF
- [ ] Dashboard con gráficos estadísticos
- [ ] Notificaciones de mantenimientos preventivos
- [ ] Sistema de cotizaciones
- [ ] Facturación electrónica
- [ ] Calendario de citas
- [ ] Aplicación móvil

## 📝 API Endpoints

### Autenticación
- `POST /autenticacion/registro` - Registrar usuario
- `POST /autenticacion/inicio-sesion` - Iniciar sesión
- `POST /autenticacion/solicitar-recuperacion` - Solicitar recuperación
- `POST /autenticacion/restablecer` - Restablecer contraseña

### Clientes
- `GET /clientes` - Listar clientes
- `GET /clientes/:id` - Obtener cliente
- `POST /clientes` - Crear cliente
- `PUT /clientes/:id` - Actualizar cliente
- `DELETE /clientes/:id` - Eliminar cliente
- `GET /clientes/buscar?q=` - Buscar clientes

### Vehículos
- `GET /vehiculos` - Listar vehículos
- `GET /vehiculos/:id` - Obtener vehículo
- `POST /vehiculos` - Crear vehículo
- `PUT /vehiculos/:id` - Actualizar vehículo
- `DELETE /vehiculos/:id` - Eliminar vehículo

### Servicios
- `GET /servicios` - Listar servicios
- `GET /servicios/activos` - Listar servicios activos
- `POST /servicios` - Crear servicio
- `PUT /servicios/:id` - Actualizar servicio
- `DELETE /servicios/:id` - Eliminar servicio

### Repuestos
- `GET /repuestos` - Listar repuestos
- `GET /repuestos/activos` - Listar repuestos activos
- `GET /repuestos/bajo-stock` - Listar repuestos con stock bajo
- `POST /repuestos` - Crear repuesto
- `PUT /repuestos/:id` - Actualizar repuesto
- `POST /repuestos/movimientos` - Registrar movimiento
- `GET /repuestos/movimientos` - Listar movimientos

### Órdenes
- `GET /ordenes` - Listar órdenes
- `GET /ordenes/:id` - Obtener orden
- `POST /ordenes` - Crear orden
- `PUT /ordenes/:id` - Actualizar orden
- `POST /ordenes/:id/servicios` - Agregar servicio
- `POST /ordenes/:id/repuestos` - Agregar repuesto
- `DELETE /ordenes/:id/servicios/:servicioId` - Eliminar servicio
- `DELETE /ordenes/:id/repuestos/:repuestoId` - Eliminar repuesto
- `GET /ordenes/estadisticas` - Obtener estadísticas

## 📄 Licencia

Este proyecto es de uso privado para talleres automotores.

## 👨‍💻 Soporte

Para soporte o consultas, contactar al administrador del sistema.
