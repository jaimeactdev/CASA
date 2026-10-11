import 'server-only';

import { prisma } from '@/server/db/prisma';

const userSessionInclude = {
  role: {
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  },
} as const;

export type UserWithRole = Awaited<
  ReturnType<typeof findUserByEmail>
>;

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: userSessionInclude,
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: userSessionInclude,
  });
}

export async function markUserLoggedIn(id: string) {
  return prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
    include: userSessionInclude,
  });
}

export async function updateUserPassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
    include: userSessionInclude,
  });
}
