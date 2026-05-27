export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  vehiclesLimit?: number | 'UNLIMITED';
}
