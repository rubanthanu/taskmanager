import { prisma } from "../prisma.js";

export async function getUsersWithTasks() {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}
