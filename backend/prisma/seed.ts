import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de la base de datos...');

    // ========================================
    // 1. Roles
    // ========================================
    console.log('📝 Creando roles...');

    const roles = [
        { codigo: 'admin' },
        { codigo: 'medico' },
        { codigo: 'paciente' },
    ];

    for (const rol of roles) {
        await prisma.rol.upsert({
            where: { codigo: rol.codigo },
            update: {},
            create: rol,
        });
    }
    console.log('✅ Roles creados');

    // ========================================
    // 2. Especialidades
    // ========================================
    console.log('📝 Creando especialidades...');

    const especialidades = [
        { codigo: 'medicina_general' },
        { codigo: 'cardiologia' },
        { codigo: 'dermatologia' },
        { codigo: 'pediatria' },
        { codigo: 'ginecologia' },
        { codigo: 'traumatologia' },
        { codigo: 'oftalmologia' },
        { codigo: 'psiquiatria' },
        { codigo: 'neurologia' },
        { codigo: 'endocrinologia' },
    ];

    for (const especialidad of especialidades) {
        await prisma.especialidad.upsert({
            where: { codigo: especialidad.codigo },
            update: {},
            create: especialidad,
        });
    }
    console.log('✅ Especialidades creadas');

    // ========================================
    // 3. Estados de Cita
    // ========================================
    console.log('📝 Creando estados de cita...');

    const estadosCita = [
        { codigo: 'pendiente' },
        { codigo: 'confirmada' },
        { codigo: 'en_curso' },
        { codigo: 'completada' },
        { codigo: 'cancelada' },
        { codigo: 'no_asistio' },
    ];

    for (const estado of estadosCita) {
        await prisma.estadoCita.upsert({
            where: { codigo: estado.codigo },
            update: {},
            create: estado,
        });
    }
    console.log('✅ Estados de cita creados');

    // ========================================
    // 4. Motivos de Cancelación
    // ========================================
    console.log('📝 Creando motivos de cancelación...');

    const motivosCancelacion = [
        { codigo: 'paciente_no_disponible' },
        { codigo: 'medico_no_disponible' },
        { codigo: 'emergencia' },
        { codigo: 'reprogramacion' },
        { codigo: 'otro' },
    ];

    for (const motivo of motivosCancelacion) {
        await prisma.motivoCancelacionCita.upsert({
            where: { codigo: motivo.codigo },
            update: {},
            create: motivo,
        });
    }
    console.log('✅ Motivos de cancelación creados');

    // ========================================
    // 5. Tipos de Comunicación
    // ========================================
    console.log('📝 Creando tipos de comunicación...');

    const tiposComunicacion = [
        { codigo: 'videollamada' },
        { codigo: 'chat' },
        { codigo: 'presencial' },
    ];

    for (const tipo of tiposComunicacion) {
        await prisma.tipoComunicacion.upsert({
            where: { codigo: tipo.codigo },
            update: {},
            create: tipo,
        });
    }
    console.log('✅ Tipos de comunicación creados');

    // ========================================
    // 6. Usuario Administrador por defecto
    // ========================================
    console.log('📝 Creando usuario administrador...');

    const adminEmail = 'admin@srmedica.com';
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    const adminRole = await prisma.rol.findUnique({
        where: { codigo: 'admin' },
    });

    if (!adminRole) {
        throw new Error('Rol admin no encontrado');
    }

    const adminUser = await prisma.usuario.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: adminPassword,
            emailConfirmado: true,
            estado: true,
            roles: {
                create: {
                    rolId: adminRole.id,
                },
            },
        },
    });

    // Crear perfil de administrativo
    await prisma.administrativo.upsert({
        where: { usuarioId: adminUser.id },
        update: {},
        create: {
            usuarioId: adminUser.id,
            primerNombre: 'Admin',
            primerApellido: 'Sistema',
        },
    });

    console.log('✅ Usuario administrador creado');
    console.log('   Email:', adminEmail);
    console.log('   Password: Admin123!');
    console.log('   ⚠️  IMPORTANTE: Cambia esta contraseña en producción');

    console.log('\n🎉 Seed completado exitosamente!');
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
