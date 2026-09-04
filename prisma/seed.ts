import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando script de seed para base de datos...');

  // Limpiar actividades y proyectos previos para idempotencia
  await prisma.activity.deleteMany({});
  await prisma.project.deleteMany({});

  const project = await prisma.project.create({
    data: {
      name: 'Implementación ERP Corporativo Trycore',
      description:
        'Proyecto demo de despliegue de módulos financiero, logístico y de recursos humanos con cálculo de indicadores EVM.',
      activities: {
        create: [
          {
            name: 'Diseño y Prototipado de Arquitectura',
            bac: 10000,
            plannedProgress: 50,
            actualProgress: 40,
            actualCost: 6000,
          },
          {
            name: 'Configuración y Migración de Base de Datos',
            bac: 5000,
            plannedProgress: 100,
            actualProgress: 100,
            actualCost: 4500,
          },
          {
            name: 'Desarrollo de Módulo de Facturación Electrónica',
            bac: 15000,
            plannedProgress: 30,
            actualProgress: 0,
            actualCost: 2000,
          },
        ],
      },
    },
    include: {
      activities: true,
    },
  });

  console.log(`Proyecto creado: ${project.name} (ID: ${project.id})`);
  console.log(`Actividades creadas: ${project.activities.length}`);
  project.activities.forEach((act) => {
    console.log(` - ${act.name}: BAC=$${act.bac}, AC=$${act.actualCost}, Planned=${act.plannedProgress}%, Actual=${act.actualProgress}%`);
  });

  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
