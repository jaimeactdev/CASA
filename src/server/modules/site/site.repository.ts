import 'server-only';

import { prisma } from '@/server/db/prisma';

/** Public identity and contact. No wage, fees or member fields. */
export function findPublicSettings() {
  return prisma.settings.findUnique({
    where: { id: 1 },
    select: {
      name: true,
      acronym: true,
      serviceCity: true,
      phone: true,
      contactEmail: true,
      address: true,
      openingHours: true,
    },
  });
}

/** Active benefits the association chose to show. The lens aid stays out. */
export function listPublicBenefits() {
  return prisma.benefit.findMany({
    where: { isActive: true, isPublic: true, publicText: { not: null } },
    select: { id: true, name: true, publicText: true },
    orderBy: { name: 'asc' },
  });
}
