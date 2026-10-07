
import { prisma } from "./prisma.js";

try {
  const count = await prisma.user.count();
  console.log("Database connected. Users:", count);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}