export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  /** `null` for people with no manager. */
  managerId: string | null;
}
