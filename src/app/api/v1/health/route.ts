import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      latencyMs: latency,
    });
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "disconnected" },
      { status: 503 },
    );
  }
}
