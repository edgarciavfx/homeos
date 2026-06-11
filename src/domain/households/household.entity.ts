export const MIN_HOUSEHOLD_NAME_LENGTH = 2;
export const MAX_HOUSEHOLD_NAME_LENGTH = 100;

export function isValidHouseholdName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= MIN_HOUSEHOLD_NAME_LENGTH && trimmed.length <= MAX_HOUSEHOLD_NAME_LENGTH;
}

export function sanitizeHouseholdName(name: string): string {
  return name.trim();
}
