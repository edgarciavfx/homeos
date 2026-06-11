import { Prisma } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma/client";

export class InvitationRepository {
  async findById(id: string) {
    return prisma.invitation.findUnique({ where: { id } });
  }

  async findByToken(token: string) {
    return prisma.invitation.findUnique({ where: { token } });
  }

  async findActiveByEmail(householdId: string, email: string) {
    return prisma.invitation.findFirst({
      where: {
        householdId,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async create(data: {
    householdId: string;
    email: string;
    token: string;
    expiresAt: Date;
  }, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.invitation.create({ data });
  }

  async markAccepted(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.invitation.update({ where: { id }, data: { acceptedAt: new Date() } });
  }

  async findByHousehold(householdId: string) {
    return prisma.invitation.findMany({
      where: { householdId },
      orderBy: { createdAt: "desc" },
    });
  }
}
