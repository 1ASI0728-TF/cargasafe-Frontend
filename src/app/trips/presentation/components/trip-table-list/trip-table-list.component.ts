import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TripsStore } from '../../../application/trips.store';
import { Trip } from '../../../domain/model/trip.entity';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trip-table-list',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatInputModule,
    RouterModule,
    DatePipe,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './trip-table-list.component.html',
  styleUrl: './trip-table-list.component.css',
})
export class TripTableListComponent implements OnInit {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  searchTerm: string = '';
  statusFilter: 'all' | '0' | '1' | '2' | '3' = 'all';
  createdOrder: 'desc' | 'asc' = 'desc';

  readonly store = inject(TripsStore);
  trips = computed(() => this.store.tripsState.data);
  dialog = inject(MatDialog);
  snackbar = inject(MatSnackBar);

  displayedColumns: string[] = [
    'id',
    'status',
    'driver',
    'deliveries',
    'completedDeliveries',
    'createdAt',
    'departure',
    'actions',
  ];

  dataSource = new MatTableDataSource<Trip>([]);

  isModifyOpen = false;
  isSaving = false;
  selectedTripId: number | null = null;

  currentStatusLabel = 'schedule';
  nextStatusLabel = 'completed';

  showToast = false;
  toastMessage = '';

  constructor() {
    effect(() => {
      const data = this.store.tripsState.data();
      this.dataSource.data = this.sortByCreated([...data], this.createdOrder);
    });

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      if (!filter) return true;

      const { from, to, search, status } = JSON.parse(filter) as {
        from?: string;
        to?: string;
        search?: string;
        status?: string;
      };

      if (from || to) {
        const created = new Date(data.createdAt);

        if (from) {
          const f = new Date(from);
          if (created < f) return false;
        }
        if (to) {
          const t = new Date(to);
          t.setHours(23, 59, 59, 999);
          if (created > t) return false;
        }
      }

      if (status && status !== 'all') {
        if (!this.statusMatches(data.statusId, status)) return false;
      }

      if (search && search.trim().length > 0) {
        const q = search.trim().toLowerCase();

        const idStr = (data.externalId ?? data.id ?? '').toString().toLowerCase();
        const driverStr = (data.driverId ?? '').toString().toLowerCase();
        const coDriverStr = (data.coDriverId ?? '').toString().toLowerCase();
        const statusStr = (data.statusId ?? '').toString().toLowerCase();
        const createdStr = data.createdAt
          ? new Date(data.createdAt).toLocaleString().toLowerCase()
          : '';
        const departureStr = data.departureAt
          ? new Date(data.departureAt).toLocaleString().toLowerCase()
          : '';
        const deliveriesStr = (data.totalDistanceKm ?? '').toString().toLowerCase();

        const hit =
          idStr.includes(q) ||
          driverStr.includes(q) ||
          coDriverStr.includes(q) ||
          statusStr.includes(q) ||
          createdStr.includes(q) ||
          departureStr.includes(q) ||
          deliveriesStr.includes(q);

        if (!hit) return false;
      }

      return true;
    };
  }

  ngOnInit(): void {
    this.store.loadTrips();
  }

  applyDateFilter(): void {
    const payload = JSON.stringify({
      from: this.fromDate ? this.fromDate.toISOString() : undefined,
      to: this.toDate ? this.toDate.toISOString() : undefined,
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
    });
    this.dataSource.filter = payload + ' ';
  }

  clearDateFilter(): void {
    this.fromDate = null;
    this.toDate = null;
    const payload = JSON.stringify({
      from: undefined,
      to: undefined,
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
    });
    this.dataSource.filter = payload + ' ';
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.pushFilter();
  }

  onStatusChange(value: 'all' | '0' | '1' | '2' | '3'): void {
    this.statusFilter = value;
    this.pushFilter();
  }

  onCreatedOrderChange(value: 'desc' | 'asc'): void {
    this.createdOrder = value;
    this.dataSource.data = this.sortByCreated([...this.dataSource.data], this.createdOrder);
  }

  private pushFilter(): void {
    const payload = JSON.stringify({
      from: this.fromDate ? this.fromDate.toISOString() : undefined,
      to: this.toDate ? this.toDate.toISOString() : undefined,
      search: this.searchTerm || undefined,
      status: this.statusFilter || undefined,
    });
    this.dataSource.filter = payload + ' ';
  }

  private sortByCreated(items: any[], order: 'desc' | 'asc'): any[] {
    return items.sort((a, b) => {
      const dA = new Date(a.createdAt).getTime();
      const dB = new Date(b.createdAt).getTime();
      return order === 'desc' ? dB - dA : dA - dB;
    });
  }

  private statusMatches(statusId: any, filterCode: string): boolean {
    if (filterCode === 'all') return true;

    const raw = statusId ?? '';
    const code = raw.toString();
    const text = raw.toString().toLowerCase();

    switch (filterCode) {
      case '0':
        return code === '0' || text.includes('complet');
      case '1':
        return code === '1' || text.includes('cancel');
      case '2':
        return (
          code === '2' ||
          text.includes('curso') ||
          text.includes('progress') ||
          text.includes('ongo')
        );
      case '3':
        return code === '3' || text.includes('program');
      default:
        return true;
    }
  }

  openModifyModal(trip: Trip) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirm Status Change',
        message: `Are you sure you want to execute status of Trip #${trip.id}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.executeTrip(trip.id)?.subscribe(() => {
          this.snackbar.open(`Trip #${trip.id} is now In Progress`, 'Close', { duration: 3000 });
        });
      }
    });
  }

  closeModifyModal() {
    if (this.isSaving) return;
    this.isModifyOpen = false;
    this.selectedTripId = null;
  }

  toggleNextStatus() {
    const options = ['completed', 'cancelled', 'in course'];
    const i = options.indexOf(this.nextStatusLabel);
    this.nextStatusLabel = options[(i + 1) % options.length];
  }

  confirmModify() {
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      this.isModifyOpen = false;

      this.toastMessage = `Trip #${this.selectedTripId ?? ''} updated to ${this.nextStatusLabel}`;
      this.showToast = true;
      setTimeout(() => (this.showToast = false), 1800);
    }, 900);
  }
}
