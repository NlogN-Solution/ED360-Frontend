import type { UserRole } from "@/types/enums";
import type { ModuleKey } from "@/constants/permissions";

export interface PermissionCell {
  role: UserRole;
  module: ModuleKey;
  can_read: boolean;
  can_write: boolean;
}

export interface PermissionMatrixResponse {
  items: PermissionCell[];
}

export interface PermissionUpdate {
  role: UserRole;
  module: ModuleKey;
  can_read: boolean;
  can_write: boolean;
}
