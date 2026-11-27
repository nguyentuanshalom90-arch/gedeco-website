import { prisma } from "./prisma-client.mjs";

async function main() {
  const user = await prisma.adminUser.findFirst({
    where: { username: "chucnguyen" }
  });

  if (!user) {
    console.log("User chucnguyen not found! Let's check all users:");
    const all = await prisma.adminUser.findMany();
    console.log(all);
    return;
  }

  const updated = await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      email: "contract.gedeco@gmail.com",
      role: "SUPER_ADMIN",
      isActive: true
    }
  });

  console.log("UPDATED_SUCCESS:", {
    id: updated.id,
    username: updated.username,
    email: updated.email,
    role: updated.role,
    isActive: updated.isActive
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
