import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  OPERATIVE_PERMISSION_KEYS,
  PERMISSION_CATALOG,
} from '../src/server/auth/permissionCatalog';

const prisma = new PrismaClient();

const BENEFITS = [
  {
    name: 'Día de la madre',
    internalDescription: 'Regalo anual para afiliadas mujeres.',
    publicText: 'Celebración del día de la madre.',
    isPublic: true,
    type: 'ANNUAL' as const,
    audience: 'FEMALE' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: 5,
    requiresMinimumSetup: false,
  },
  {
    name: 'Día del padre',
    internalDescription: 'Regalo anual para afiliados hombres.',
    publicText: 'Celebración del día del padre.',
    isPublic: true,
    type: 'ANNUAL' as const,
    audience: 'MALE' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: 6,
    requiresMinimumSetup: false,
  },
  {
    name: 'Aguinaldo',
    internalDescription: 'Aguinaldo de diciembre para todos los afiliados.',
    publicText: 'Aguinaldo de fin de año.',
    isPublic: true,
    type: 'ANNUAL' as const,
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: 12,
    requiresMinimumSetup: false,
  },
  {
    name: 'Paseo o día de sol',
    internalDescription: 'Paseo anual. Exige un mínimo de cuotas pagadas.',
    publicText: 'Paseo o día de sol anual.',
    isPublic: true,
    type: 'ANNUAL' as const,
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: null,
    requiresMinimumSetup: true,
  },
  {
    name: 'Auxilio por cambio de fórmula de lentes',
    internalDescription: 'Auxilio eventual por cambio de fórmula de lentes.',
    publicText: null,
    isPublic: false,
    type: 'EVENTUAL' as const,
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: null,
    requiresMinimumSetup: false,
  },
];

const PAYMENT_METHODS = [
  'Efectivo',
  'Transferencia',
  'Nequi',
  'Daviplata',
  'Otro',
];

async function seedPermissions() {
  for (const permission of PERMISSION_CATALOG) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { module: permission.module, label: permission.label },
      create: permission,
    });
  }
}

async function seedRoles() {
  const permissions = await prisma.permission.findMany();
  const byKey = new Map(permissions.map((item) => [item.key, item]));

  const admin = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: { isSystem: true, isActive: true },
    create: {
      name: 'Administrador',
      description: 'Acceso completo a CASA.',
      isSystem: true,
      isActive: true,
    },
  });

  const operative = await prisma.role.upsert({
    where: { name: 'Operativo' },
    update: { isSystem: true, isActive: true },
    create: {
      name: 'Operativo',
      description: 'Trabajo de ventanilla.',
      isSystem: true,
      isActive: true,
    },
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: admin.id } });
  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({
      roleId: admin.id,
      permissionId: permission.id,
    })),
  });

  await prisma.rolePermission.deleteMany({ where: { roleId: operative.id } });
  await prisma.rolePermission.createMany({
    data: OPERATIVE_PERMISSION_KEYS.flatMap((key) => {
      const permission = byKey.get(key);
      return permission
        ? [{ roleId: operative.id, permissionId: permission.id }]
        : [];
    }),
  });

  return { admin };
}

async function seedSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Círculo de Apoyo y Servicios para Afiliados',
      acronym: 'CASA',
      serviceCity: 'Medellín',
      minimumWage: 0,
      firstFeeCutoffDay: 15,
      firstFeePercent: new Prisma.Decimal('50.00'),
      graceDays: 3,
      surchargePercent: new Prisma.Decimal('0.00'),
      enrollmentFee: 0,
      allowMultiFeePayment: true,
    },
  });
}

async function seedPaymentMethods() {
  for (const [index, name] of PAYMENT_METHODS.entries()) {
    await prisma.paymentMethod.upsert({
      where: { name },
      update: { sortOrder: index + 1 },
      create: { name, sortOrder: index + 1, isActive: true },
    });
  }
}

async function seedBenefitsAndProfile() {
  const benefitIds: string[] = [];
  for (const benefit of BENEFITS) {
    const existing = await prisma.benefit.findFirst({
      where: { name: benefit.name },
    });
    const row = existing
      ? await prisma.benefit.update({
          where: { id: existing.id },
          data: benefit,
        })
      : await prisma.benefit.create({ data: benefit });
    benefitIds.push(row.id);
  }

  const profile = await prisma.membershipProfile.upsert({
    where: { name: 'General' },
    update: { percent: new Prisma.Decimal('1.70'), isActive: true },
    create: {
      name: 'General',
      percent: new Prisma.Decimal('1.70'),
      isActive: true,
    },
  });

  await prisma.profileBenefit.deleteMany({ where: { profileId: profile.id } });
  await prisma.profileBenefit.createMany({
    data: benefitIds.map((benefitId) => ({
      profileId: profile.id,
      benefitId,
    })),
  });
}

async function seedAdmin(roleId: string) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is missing; skip admin user.');
    return;
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must have at least 8 characters.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email,
      passwordHash: await bcrypt.hash(password, 12),
      roleId,
      isActive: true,
      mustChangePassword: true,
    },
  });
}

async function main() {
  await seedPermissions();
  const { admin } = await seedRoles();
  await seedSettings();
  await seedPaymentMethods();
  await seedBenefitsAndProfile();
  await seedAdmin(admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
