import { z } from "zod";

export const CreateHouseholdSchema = z.object({
  name: z.string().min(2).max(100),
});

export const InviteMemberSchema = z.object({
  email: z.string().email(),
});

export const CreateMealSchema = z.object({
  name: z.string().min(1).max(150),
  preparationMinutes: z.number().int().positive(),
});

export const AddIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const UpdateIngredientSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
});

export const CreateWeeklyPlanSchema = z.object({
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CreatePrioritySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const UpdatePrioritySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const ScheduleMealSchema = z.object({
  mealId: z.string().uuid(),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const AddGroceryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().optional(),
  category: z.string().optional(),
});

export const UpdateGroceryItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  completed: z.boolean().optional(),
});

export const CreateChoreSchema = z.object({
  name: z.string().min(1),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]),
  ownerId: z.string().uuid().optional(),
});

export const UpdateChoreSchema = z.object({
  name: z.string().min(1).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  active: z.boolean().optional(),
  ownerId: z.string().uuid().optional(),
});

export const CreateBudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2025),
  amount: z.number().positive(),
});

export const RecordPurchaseSchema = z.object({
  amount: z.number().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

export const UpdateHouseholdSchema = z.object({
  name: z.string().min(2).max(100),
});

export const AssignOwnershipSchema = z.object({
  areaName: z.string().min(1),
  ownerId: z.string().uuid(),
});
