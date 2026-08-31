# 🏡 Sistema de Gestión de Inmuebles

Aplicación fullstack para la administración de agentes inmobiliarios y control de catálogo de propiedades en venta/reserva. Desarrollada con un backend robusto en NestJS y un frontend interactivo en React + Vite + TypeScript.

---

## 👥 Credenciales de Prueba (Seed)

La base de datos contiene pre-cargados 3 agentes inmobiliarios y 15 propiedades distribuidas en diversos estados (`DISPONIBLE`, `RESERVADO`, `VENDIDO`). Todos los agentes comparten la misma contraseña:

- **Contraseña común:** `abC.12345`
- **Agente 1:** `vendedor1@example.com` (Juan Pérez)
- **Agente 2:** `vendedor2@example.com` (María Gómez)
- **Agente 3:** `vendedor3@example.com` (Carlos Rodríguez)

---

## 🖥️ Backend (NestJS + Prisma + PostgreSQL)

El servidor de la API REST corre por defecto en el puerto **`3000`**.

### Requisitos Previos

- Node.js (versión 18 o superior recomendada)
- PostgreSQL ejecutándose localmente o en la nube

### Configuración del Entorno

1. Entra a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crea el archivo `.env` tomando como base el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configura las siguientes variables en el archivo `.env`:
   - `DATABASE_URL`: URL de conexión a tu base de datos PostgreSQL.
     - _Ejemplo local:_ `postgresql://postgres:contraseña@localhost:5432/gestion_inmuebles?schema=public`
   - `JWT_SECRET`: Secreto criptográfico para la firma de tokens JWT (puedes generar una cadena aleatoria).
   - `NODE_ENV`: Establecer a `development` o `production`.

### Instalación y Ejecución

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Ejecuta las migraciones de Prisma para construir el esquema de base de datos:
   ```bash
   npx prisma migrate dev
   ```
3. Ejecuta el Seed para poblar la base de datos con tipos de inmuebles, usuarios y propiedades:
   ```bash
   npx prisma db seed
   ```
4. Levanta el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

---

## 💻 Frontend (React + Vite + TypeScript)

El cliente de desarrollo corre por defecto en el puerto **`5173`**.

### Configuración del Entorno

1. Entra a la carpeta del frontend:
   ```bash
   cd ../frontend
   ```
2. Crea el archivo `.env` tomando como base el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Configura la URL del backend en la variable de entorno:
   - `VITE_API_URL`: Dirección de la API del servidor (por defecto `http://localhost:3000`).

### Instalación y Ejecución

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```
3. Para compilar la aplicación para producción:
   ```bash
   npm run build
   ```

---

## 🐳 Docker Compose (Opcional)

Si tienes Docker instalado en tu máquina, puedes levantar la base de datos PostgreSQL automáticamente usando el archivo `docker-compose.yml` provisto en la raíz del proyecto:

1. Levanta el contenedor de la base de datos:
   ```bash
   docker-compose up -d
   ```
2. Esto creará la base de datos en `localhost:5432` lista para recibir las migraciones de Prisma del backend.
