import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { registerBillingIcons } from '../../icons/billing-icons';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CancelSubscriptionDialog } from '../../dialogs/cancel-subscription.dialog';
import { ChangePlanDialog } from '../../dialogs/change-plan.dialog';
import { Plan } from '../../../domain/plan';
import { BillingService, SubscriptionVm } from '../../../infraestructure/billing.service';
import { Router } from '@angular/router';

@Component({

  selector: 'app-subscriptions-page',
  standalone: true,

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],

  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.css'],
})

export class SubscriptionsPage implements OnInit {
  private matIcons = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private dialog = inject(MatDialog);
  private billing = inject(BillingService);
  private router = inject(Router);

  loading = signal(true);

  sub = signal<SubscriptionVm | null>(null);
  invoices = signal<any[]>([]);
  displayed = ['date', 'amount', 'status', 'reference', 'actions'];

  constructor() {
    registerBillingIcons(this.matIcons, this.sanitizer);
  }

  ngOnInit(): void {
    this.refresh();
  }

  get amountLabel() {
    const s = this.sub();
    if (!s) return '—';
    const amount = (s.amount ?? 0).toFixed(2);
    const currency = s.currency ?? 'PEN';
    return `${currency} ${amount}`;
  }

  get currentPlanName(){
    const s = this.sub();
    if (!s) return '-';
    return s.plan?.name ?? '-';
  }

  get renewalDateLabel() {
    const s = this.sub();
    if (!s) return '-';
    return new Date(s.renewalDate).toLocaleDateString();
  }

  private refresh() {
    this.loading.set(true);

    this.billing.getSubscription().subscribe({
      next: (s) => this.sub.set(s),
      error: () => {
        this.sub.set(null);
      },
    });

      this.billing.getPayments().subscribe({
      next: (list) => this.invoices.set(list),
      complete: () => this.loading.set(false),
    });
  }

  onCancel() {
    const ref = this.dialog.open(CancelSubscriptionDialog);
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      const s = this.sub();
      if (!s) return;
      this.billing.cancelSubscription(s.id).subscribe({
        next: () => {
          this.sub.update((curr) =>
            curr
              ? {
                ...curr,
                status: 'CANCELED',
              }
              : curr
          );
        },
      });
    });
  }

  onChangePlan() {
    this.billing.getPlans().subscribe((plans: Plan[]) => {
      const currentPlanId =
        this.sub()?.plan?.id ?? this.sub()?.planId ?? '';

      const ref = this.dialog.open(ChangePlanDialog, {
        data: { plans, currentPlanId },
      });

      ref.afterClosed().subscribe((selectedPlanId: string | undefined) => {
        if (!selectedPlanId) return;

        const s = this.sub();
        if (!s) return;

        if (String(selectedPlanId) === String(currentPlanId)) return;

        this.billing
          .changePlan(s.id, Number(selectedPlanId))
          .subscribe((updated) => {
            this.sub.set(updated);
          });
      });
    });
  }

  onChangeCard() {
    this.router.navigate(['/subscriptions/change-card']);
  }

  canDownload(row: any): boolean {
    return !!row?.receiptUrl;
  }

  onDownloadReceipt(row: any) {
    if (!row?.receiptUrl) return;
    window.open(row.receiptUrl, '_blank');
  }

  canViewInvoice(row: any): boolean {
    return !!row?.hostedInvoiceUrl || !!row?.invoicePdfUrl;
  }

  onViewInvoice(row: any) {
    const url = row?.hostedInvoiceUrl || row?.invoicePdfUrl;
    if (!url) return;
    window.open(url, '_blank');
  }

  protected readonly name = name;
}
