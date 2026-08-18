export interface JobRole {
  id: string;
  organization_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface JobRoleCreatePayload {
  name: string;
}

export interface JobRoleUpdatePayload {
  name?: string;
}
