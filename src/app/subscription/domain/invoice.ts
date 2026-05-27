export interface Invoice {
  id: number | string;
  subscriptionId: number | string;
  date: string;
  amount: number;
  currency: string;
  status: 'Accepted' | 'Pending' | 'Declined';
  receiptUrl?: string;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
}
