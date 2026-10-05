export type RoleId =
  | "embryologist"
  | "clinician"
  | "ivf-specialist"
  | "andro-technician";

export interface Role {
  id: RoleId;
  label: string;
  /** Shown under the role in the picker so users pick the right one. */
  blurb: string;
}

export interface Session {
  username: string;
  displayName: string;
  role: RoleId;
  roleLabel: string;
  centerId: string;
  /** ISO timestamp. */
  issuedAt: string;
}

export interface LoginCredentials {
  centerId: string;
  role: RoleId | "";
  username: string;
  password: string;
  remember: boolean;
}
