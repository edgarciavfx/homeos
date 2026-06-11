import { HouseholdRole } from "@prisma/client";

export interface HouseholdWithRoleView {
  id: string;
  name: string;
  role: HouseholdRole;
}

export interface HouseholdDetailView {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  memberCount: number;
}

export interface HouseholdMemberView {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: HouseholdRole;
  joinedAt: Date;
}

export interface InvitationView {
  id: string;
  email: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface CreateHouseholdResponse {
  householdId: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

export interface InviteMemberResponse {
  invitationId: string;
  email: string;
  expiresAt: Date;
}

export interface AcceptInvitationResponse {
  householdId: string;
  role: string;
}
