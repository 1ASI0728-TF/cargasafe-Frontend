export interface Subscription {
  id: number | string;
  accountId: string;
  planId: string;
  status: 'ACTIVE' | 'CANCELED' | 'PENDING' | 'PAST_DUE';
  amount: number;
  currency: string;
  renewalDate: string;
  paymentMethodId?: number | string;
}
