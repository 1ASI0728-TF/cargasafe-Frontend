export interface PaymentMethod {
  id: number | string;
  accountId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  country: string;
  postalCode?: string;
}
