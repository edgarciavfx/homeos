import { HouseholdRole } from "@prisma/client";
import { Permission } from "./permission.enum";
import { hasPermission } from "./permission.service";

export class ForbiddenError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function authorize(role: HouseholdRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError();
  }
}
