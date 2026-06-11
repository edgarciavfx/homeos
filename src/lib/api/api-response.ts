import { NextResponse } from "next/server";
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from "./api-error";

interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export function ok<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function paginated<T>(
  data: T[],
  meta: PaginationMeta,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({ success: true, data, meta });
}

export function error(error: AppError): NextResponse<ErrorResponse> {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
      { status: 400 },
    );
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: error.message } },
      { status: 401 },
    );
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: error.message } },
      { status: 403 },
    );
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: error.message } },
      { status: 404 },
    );
  }
  if (error instanceof ConflictError) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: error.message } },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } },
    { status: 500 },
  );
}
