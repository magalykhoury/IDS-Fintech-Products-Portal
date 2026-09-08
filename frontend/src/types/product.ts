export interface Product {
  id: number;
  name: string;
  description: string | null;
  businessPurpose: string | null;
  lifecycleStatus: string;
  currentVersion: string | null;
  supportedMarkets: string | null;
  criticality: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}