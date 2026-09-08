export interface TeamMember {
  id: number;
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}