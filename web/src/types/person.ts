/** Minimum needed to show a person in a cell, list, or lookup. */
export interface PersonSummary {
  id: string;
  name: string;
  /** Job title, department, or email. */
  subtitle?: string;
  avatarUrl?: string;
}
