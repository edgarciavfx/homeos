import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { error } from "./api-response";
import { UnauthorizedError } from "./api-error";

export function protectedRoute<T extends { params: Promise<any> }>(
  handler: (req: NextRequest, context: T & { userId: string }) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UnauthorizedError();
      }
      return handler(req, { ...context, userId: session.user.id });
    } catch (e) {
      if (e instanceof Error && "name" in e) {
        const appError = e as import("./api-error").AppError;
        return error(appError);
      }
      return NextResponse.json(
        { success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } },
        { status: 500 },
      );
    }
  };
}
