import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  console.log('🧹 Limpiando datos...');
  await prisma.inmueble.deleteMany();
  await prisma.tipoInmueble.deleteMany();
  await prisma.user.deleteMany();

  console.log('🏢 Creando tipos de inmueble...');
  const tCasa = await prisma.tipoInmueble.create({
    data: {
      codigo: 'CASA',
      nombre: 'Casa',
      activo: true,
    },
  });

  const tApto = await prisma.tipoInmueble.create({
    data: {
      codigo: 'APARTAMENTO',
      nombre: 'Apartamento',
      activo: true,
    },
  });

  const tTerreno = await prisma.tipoInmueble.create({
    data: {
      codigo: 'TERRENO',
      nombre: 'Terreno',
      activo: true,
    },
  });

  const tLocal = await prisma.tipoInmueble.create({
    data: {
      codigo: 'LOCAL_COMERCIAL',
      nombre: 'Local Comercial',
      activo: true,
    },
  });

  console.log('👥 Creando usuarios...');
  const passwordHash = await bcrypt.hash('abC.12345', 10);

  const uJuan = await prisma.user.create({
    data: {
      nombre: 'Juan Pérez',
      email: 'vendedor1@example.com',
      password: passwordHash,
      activo: true,
    },
  });

  const uMaria = await prisma.user.create({
    data: {
      nombre: 'María Gómez',
      email: 'vendedor2@example.com',
      password: passwordHash,
      activo: true,
    },
  });

  const uCarlos = await prisma.user.create({
    data: {
      nombre: 'Carlos Rodríguez',
      email: 'vendedor3@example.com',
      password: passwordHash,
      activo: true,
    },
  });

  console.log('🏠 Creando propiedades...');
  const propertiesData = [
    // Propiedades de Juan
    {
      direccion: 'Av. Libertador 1234, Piso 5',
      precio: 120000,
      habitaciones: 3,
      metrosCuadrados: 85,
      tipoInmuebleId: tApto.id,
      vendedorId: uJuan.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Calle Los Pinos 456',
      precio: 250000,
      habitaciones: 4,
      metrosCuadrados: 180,
      tipoInmuebleId: tCasa.id,
      vendedorId: uJuan.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Sector Industrial Lote 89',
      precio: 450000,
      habitaciones: 0,
      metrosCuadrados: 500,
      tipoInmuebleId: tLocal.id,
      vendedorId: uJuan.id,
      estado: 'RESERVADO',
    },
    {
      direccion: 'Barrio Norte Calle 12',
      precio: 95000,
      habitaciones: 2,
      metrosCuadrados: 60,
      tipoInmuebleId: tApto.id,
      vendedorId: uJuan.id,
      estado: 'VENDIDO',
    },
    {
      direccion: 'Condominio El Rosal Casa 14',
      precio: 320000,
      habitaciones: 5,
      metrosCuadrados: 220,
      tipoInmuebleId: tCasa.id,
      vendedorId: uJuan.id,
      estado: 'DISPONIBLE',
    },

    // Propiedades de Maria
    {
      direccion: 'Av. San Martín 888',
      precio: 135000,
      habitaciones: 2,
      metrosCuadrados: 75,
      tipoInmuebleId: tApto.id,
      vendedorId: uMaria.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Terreno campestre Km 14',
      precio: 80000,
      habitaciones: 0,
      metrosCuadrados: 1000,
      tipoInmuebleId: tTerreno.id,
      vendedorId: uMaria.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Centro Comercial Plaza Local 12',
      precio: 180000,
      habitaciones: 1,
      metrosCuadrados: 45,
      tipoInmuebleId: tLocal.id,
      vendedorId: uMaria.id,
      estado: 'RESERVADO',
    },
    {
      direccion: 'Paseo del Mar 777',
      precio: 290000,
      habitaciones: 3,
      metrosCuadrados: 140,
      tipoInmuebleId: tCasa.id,
      vendedorId: uMaria.id,
      estado: 'VENDIDO',
    },
    {
      direccion: 'Calle Sol 98',
      precio: 110000,
      habitaciones: 2,
      metrosCuadrados: 70,
      tipoInmuebleId: tApto.id,
      vendedorId: uMaria.id,
      estado: 'DISPONIBLE',
    },

    // Propiedades de Carlos
    {
      direccion: 'Av. Las Américas 4321',
      precio: 160000,
      habitaciones: 3,
      metrosCuadrados: 95,
      tipoInmuebleId: tApto.id,
      vendedorId: uCarlos.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Calle Falsa 123',
      precio: 75000,
      habitaciones: 2,
      metrosCuadrados: 55,
      tipoInmuebleId: tApto.id,
      vendedorId: uCarlos.id,
      estado: 'DISPONIBLE',
    },
    {
      direccion: 'Lote Urb. La Pradera',
      precio: 60000,
      habitaciones: 0,
      metrosCuadrados: 300,
      tipoInmuebleId: tTerreno.id,
      vendedorId: uCarlos.id,
      estado: 'RESERVADO',
    },
    {
      direccion: 'Boulevard del Sol Local 5',
      precio: 210000,
      habitaciones: 2,
      metrosCuadrados: 90,
      tipoInmuebleId: tLocal.id,
      vendedorId: uCarlos.id,
      estado: 'VENDIDO',
    },
    {
      direccion: 'Calle Los Naranjos 23',
      precio: 230000,
      habitaciones: 4,
      metrosCuadrados: 160,
      tipoInmuebleId: tCasa.id,
      vendedorId: uCarlos.id,
      estado: 'DISPONIBLE',
    },
  ];

  for (const prop of propertiesData) {
    await prisma.inmueble.create({
      data: prop,
    });
  }

  console.log('✅ Base de datos poblada exitosamente! Credenciales:');
  console.log('Email: [EMAIL_ADDRESS]');
  console.log('Password: abC.12345');
}

main()
  .catch((e) => {
    console.error('❌ Error al poblar la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
