
export interface School {
  id: string;
  name: string;
  photoUrl: string;
  location: string;
  adminEmail: string;
}

export interface Student {
  id: string;
  name: string;
  schoolId: string;
  grade: string;
  parentId: string; // Links to ParentAccount.id
  photoUrl: string;
}

export interface Staff {
  id: string;
  userName: string;
  password: string;
  schoolId: string;
}

export interface ParentAccount {
  id: string;
  userName: string;
  password: string;
}

export type StatusLevel = 'bien' | 'moyen' | 'mauvais';
export type GradeABCD = 'A' | 'B' | 'C' | 'D';

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // ISO string YYYY-MM-DD
  status: 'present' | 'absent';
  aspect?: StatusLevel;
  conduite?: StatusLevel;
  abcd?: GradeABCD;
}

export enum UserRole {
  ADMIN = 'ADMIN', // Global Admin (Xelar)
  STAFF = 'STAFF', // School specific staff
  PARENT = 'PARENT',
  GUEST = 'GUEST'
}

export interface UserSession {
  role: UserRole;
  userName?: string;
  schoolId?: string;
  parentId?: string;
}
