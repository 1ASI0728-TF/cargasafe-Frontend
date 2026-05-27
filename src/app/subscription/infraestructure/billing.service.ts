import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Invoice } from '../domain/invoice';
import { Plan } from '../domain/plan';
import { environment } from '../../../environments/environment';

//POR EL MOMENTO YA QUE AUN NO HAY UN AUTH
const USER_ID = '1';

  type BackendPlan = {
    id: number;
    name: string;
    limits: string;
    price: number;
    description: string;
  };

  type BackendPayment = {
    id: number;
    userId: number;
    receiptUrl: string;
    transactionId: string;
    status: string;
    amount: number;
    paymentDate: string;
  };

  type BackendSubscriptionByUser = {
    id: number;
    userId: number;
    status: 'ACTIVE' | 'CANCELED' | 'PENDING' | 'PAST_DUE';
    renewal: string;
    paymentMethod: string;
    plan: BackendPlan;
};

export type SubscriptionVm = {
  id: number;
  userId: number;
  planId: string | number;
  status: 'ACTIVE' | 'CANCELED' | 'PENDING' | 'PAST_DUE';
  amount: number;
  currency: string;
  renewalDate: string;
  paymentMethodLabel?: string;
  plan?: Plan;
};


@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private API_URL = environment.baseUrl;

  getPlans(): Observable<Plan[]> {
    return this.http.get<BackendPlan[]>(`${this.API_URL}/plans`).pipe(
      map((arr) =>
        arr.map((p) => ({
          id: String(p.id),
          name: p.name,
          price: p.price,
          currency: 'PEN',
          vehiclesLimit: undefined as any,
        }))
      )
    );
  }

  getSubscription(): Observable<SubscriptionVm | null> {
    return this.http.get<BackendSubscriptionByUser>(`${this.API_URL}/subscription/user-id/${USER_ID}`).pipe(
      map((s) => ({
        id: s.id,
        userId: s.userId,
        planId: s.plan?.id ?? '',
        status: s.status,
        amount: s.plan?.price ?? 0,
        currency: 'PEN',
        renewalDate: s.renewal,
        paymentMethodLabel: s.paymentMethod,
        plan: s.plan
          ? {
            id: String(s.plan.id),
            name: s.plan.name,
            price: s.plan.price,
            currency: 'PEN',
            vehiclesLimit: undefined as any }
          : undefined,
      }))
    );
  }

  changePlan(subscriptionId: number, newPlanId: number): Observable<SubscriptionVm> {
    return this.http
      .put<BackendSubscriptionByUser>(
        `${this.API_URL}/subscription/${subscriptionId}/plan`,
        { newPlanId }
      )
      .pipe(
        map((s) => ({
          id: s.id,
          userId: s.userId,
          planId: s.plan?.id ?? '',
          status: s.status,
          amount: s.plan?.price ?? 0,
          currency: 'PEN',
          renewalDate: s.renewal,
          paymentMethodLabel: s.paymentMethod,
          plan: s.plan
            ? {
              id: String(s.plan.id),
              name: s.plan.name,
              price: s.plan.price,
              currency: 'PEN',
              vehiclesLimit: undefined as any,
            }
            : undefined,
        }))
      );
  }


  cancelSubscription(subscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/subscription/${subscriptionId}`);
  }

  getPayments(): Observable<Invoice[]> {
    return this.http.get<BackendPayment[]>(`${this.API_URL}/payments/user-id/${USER_ID}`).pipe(
      map((arr) =>
        arr
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
          .map((p) => ({
            id: p.id,
            subscriptionId: 0,
            date: new Date(p.paymentDate).toISOString(),
            amount: p.amount,
            currency: 'PEN',
            status: (p.status ?? 'SUCCEEDED') as any,
            receiptUrl: p.receiptUrl,
            hostedInvoiceUrl: undefined,
            invoicePdfUrl: undefined,
          }))
      )
    );
  }
}
