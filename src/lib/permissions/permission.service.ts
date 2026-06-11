import { HouseholdRole } from "@prisma/client";
import { Permission } from "./permission.enum";

const rolePermissions: Record<HouseholdRole, Permission[]> = {
  OWNER: [
    Permission.HOUSEHOLD_VIEW,
    Permission.HOUSEHOLD_EDIT,
    Permission.MEMBER_VIEW,
    Permission.MEMBER_INVITE,
    Permission.OWNERSHIP_VIEW,
    Permission.OWNERSHIP_MANAGE,
    Permission.PLAN_VIEW,
    Permission.PLAN_EDIT,
    Permission.MEAL_VIEW,
    Permission.MEAL_MANAGE,
    Permission.GROCERY_VIEW,
    Permission.GROCERY_MANAGE,
    Permission.CHORE_VIEW,
    Permission.CHORE_MANAGE,
    Permission.BUDGET_VIEW,
    Permission.BUDGET_MANAGE,
    Permission.PURCHASE_CREATE,
  ],
  MEMBER: [
    Permission.HOUSEHOLD_VIEW,
    Permission.MEMBER_VIEW,
    Permission.OWNERSHIP_VIEW,
    Permission.PLAN_VIEW,
    Permission.PLAN_EDIT,
    Permission.MEAL_VIEW,
    Permission.MEAL_MANAGE,
    Permission.GROCERY_VIEW,
    Permission.GROCERY_MANAGE,
    Permission.CHORE_VIEW,
    Permission.CHORE_MANAGE,
    Permission.BUDGET_VIEW,
    Permission.PURCHASE_CREATE,
  ],
};

export function hasPermission(role: HouseholdRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
