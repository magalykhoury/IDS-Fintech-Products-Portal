export interface Client {
  id: number;
  companyName: string;
  country: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}