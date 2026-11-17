import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordPermanentRedirect(tx: Prisma.TransactionClient, sourcePath: string, destinationPath: string) {
  if (sourcePath === destinationPath) return;
  await tx.urlRedirect.updateMany({ where: { destinationPath: sourcePath }, data: { destinationPath } });
  await tx.urlRedirect.upsert({
    where: { sourcePath },
    create: { sourcePath, destinationPath },
    update: { destinationPath },
  });
}

export async function redirectDestination(sourcePath: string) {
  const redirect = await prisma.urlRedirect.findUnique({ where: { sourcePath }, select: { destinationPath: true } });
  return redirect?.destinationPath || null;
}
