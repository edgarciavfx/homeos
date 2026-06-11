export interface OverdueChoreView {
  occurrenceId: string;
  choreName: string;
  ownerName?: string;
  dueDate: Date;
}

export interface ChoreOccurrenceView {
  id: string;
  choreId: string;
  dueDate: string;
  completedAt: string | null;
  completedBy: string | null;
}

export interface ChoreView {
  id: string;
  name: string;
  frequency: string;
  active: boolean;
  occurrences: ChoreOccurrenceView[];
}

export interface OwnershipView {
  id: string;
  areaName: string;
  ownerId: string;
  ownerName: string | null;
}
