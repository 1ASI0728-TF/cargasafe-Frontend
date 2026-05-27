import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Alert } from '../../../domain/models/alert.model';

@Component({
  selector: 'app-alert-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './alert-table.component.html',
  styleUrls: ['./alert-table.component.css'],
})
export class AlertTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() alerts: Alert[] = [];
  @Output() closeAlert = new EventEmitter<number>();
  @Output() acknowledgeAlert = new EventEmitter<number>();

  displayedColumns: string[] = [
    'id',
    'type',
    'deliveryOrderId',
    'status',
    'createdAt',
    'closedAt',
    'actions',
    'details',
  ];

  dataSource = new MatTableDataSource<Alert>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchTerm = '';
  statusFilter = '';

  selectedAlert: Alert | null = null;

  ngOnInit() {
    this.setupFilter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['alerts'] && this.alerts) {
      this.dataSource.data = this.alerts.map((alert) =>
        Object.assign({}, alert, {
          viewed: localStorage.getItem(`alert-viewed-${alert.id}`) === 'true',
        })
      );
      this.applyCombinedFilter();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setupFilter() {
    this.dataSource.filterPredicate = (data: Alert, _: string): boolean => {
      const search = this.searchTerm.toLowerCase();
      const status = this.statusFilter.toLowerCase();

      const matchesSearch =
        !search ||
        data.id.toString().includes(search) ||
        data.alertType.toLowerCase().includes(search);

      const matchesStatus = !status || data.alertStatus.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    };
  }

  applySearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyCombinedFilter();
  }

  filterByStatus(status: string) {
    this.statusFilter = status;
    this.applyCombinedFilter();
  }

  private applyCombinedFilter() {
    this.dataSource.filter = Math.random().toString();
  }

  markAsResolved(id: number) {
    this.closeAlert.emit(id);
  }

  openDetails(alert: Alert) {
    this.selectedAlert = alert;

    if (!alert.viewed) {
      alert.viewed = true;
      localStorage.setItem(`alert-viewed-${alert.id}`, 'true');

      this.dataSource.data = this.dataSource.data.map(a =>
        a.id === alert.id ? { ...a, viewed: true } : a
      );
    }

    if (alert.alertStatus === 'OPEN') {
      this.acknowledgeAlert.emit(alert.id);

      this.selectedAlert = {
        ...this.selectedAlert,
        alertStatus: 'ACKNOWLEDGED'
      };
    }
  }


  closeDetails() {
    this.selectedAlert = null;
  }
}
