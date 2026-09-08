export interface Deployment {
  id: number;
  clientId: number;
  clientName: string;
  productId: number;
  productName: string;
  productVersion: string;
  goLiveDate: string;
  status: string;
  supportTier: string | null;
  clientSpecificNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
}