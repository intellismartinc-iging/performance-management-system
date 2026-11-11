import type { WorkspaceRole } from "@/types/role";

export const WORKSPACE_CONFIG: {
  role: WorkspaceRole;
  departmentName: string;
  accountName: string;
  firstName: string;
} = {
  role: "hr",
  departmentName: "Human Resources",
  accountName: "Workspace User",
  firstName: "User",
};
