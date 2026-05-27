import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trip, TripStatus } from '../../../domain/entities';

@Component({
  selector: 'app-trips-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trips-table.component.html',
  styleUrls: ['./trips-table.component.css']
})
export class TripsTableComponent {
  @Input() trips: Trip[] = [];
  @Input() loading = false;

  filteredTrips: Trip[] = [];
  searchTerm = '';
  statusFilter = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.filteredTrips = [...this.trips];
  }

  ngOnChanges() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTrips = this.trips.filter(trip => {
      const matchesSearch = !this.searchTerm || 
        trip.vehiclePlate.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        trip.origin.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || trip.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (this.sortField) {
      this.applySorting();
    }
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  private applySorting() {
    this.filteredTrips.sort((a, b) => {
      let aValue: any = (a as any)[this.sortField];
      let bValue: any = (b as any)[this.sortField];

      if (this.sortField === 'startDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;

      return this.sortDirection === 'asc' ? result : -result;
    });
  }

  getStatusClass(status: TripStatus): string {
    switch (status) {
      case TripStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TripStatus.COMPLETED:
        return 'status-completed';
      case TripStatus.CANCELLED:
        return 'status-cancelled';
      case TripStatus.DELAYED:
        return 'status-delayed';
      default:
        return '';
    }
  }

  getStatusText(status: TripStatus): string {
    switch (status) {
      case TripStatus.IN_PROGRESS:
        return 'In Progress';
      case TripStatus.COMPLETED:
        return 'Completed';
      case TripStatus.CANCELLED:
        return 'Cancelled';
      case TripStatus.DELAYED:
        return 'Delayed';
      default:
        return status;
    }
  }
}