import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';

import { Device } from '../../../domain/model/device.model';
import { DeviceCreateAndEditComponent } from '../../components/device-create-and-edit/device-create-and-edit.component';
import { FleetStore } from '../../../application/fleet.store';

@Component({
  selector: 'app-device-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatTooltipModule, MatIconModule, MatButtonModule,
    MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule,
  ],
  templateUrl: './device-management.html',
  styleUrls: ['./device-management.css'],
})
export class DeviceManagementComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private store = inject(FleetStore);

  constructor(private router: Router) {}

  columns: string[] = ['id', 'imei', 'online', 'vehiclePlate', 'actions'];
  dataSource = new MatTableDataSource<Device>([]);

  searchTerm = '';
  stateFilter = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row, filterStr) => {
      const f = JSON.parse(filterStr) as { q: string; state: string };
      const toL = (s: string | null | undefined) => (s ?? '').toLowerCase();

      const q = toL(f.q);
      const matchesQ =
        !q ||
        toL(row.imei).includes(q) ||
        toL(row.vehiclePlate ?? '').includes(q);

      const currentState = row.online ? 'Online' : 'Offline';
      const matchesState = !f.state || currentState === f.state;

      return matchesQ && matchesState;
    };

    this.store.devices$.subscribe(rows => {
      this.dataSource.data = rows;
      this.applyFilters();
    });
    this.store.loadDevices();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: Device, prop: string) => {
      switch (prop) {
        case 'id':           return item.id ?? 0;
        case 'imei':         return (item.imei ?? '').toString();
        case 'online':       return item.online ? 1 : 0;
        case 'vehiclePlate': return item.vehiclePlate ?? '\uffff';
        default:             return (item as any)[prop] ?? '';
      }
    };

    Promise.resolve().then(() => {
      this.sort.active = 'id';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'id', direction: 'asc' });
    });
  }

  onView(r: Device) { void this.router.navigate(['/fleet/devices', r.id]); }

  openCreateDialog(): void {
    const ref = this.dialog.open(DeviceCreateAndEditComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: { editMode: false, data: { imei: '', firmware: 'v1.0.0', online: false, vehiclePlate: null } },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.action === 'add' && res.payload) this.store.createDevice(res.payload);
    });
  }

  onEdit(row: Device): void {
    const ref = this.dialog.open(DeviceCreateAndEditComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: { editMode: true, data: { ...row } },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.action === 'update' && res.payload) this.store.updateDevice(res.payload);
    });
  }

  onDelete(row: Device): void {
    if (row.id) this.store.deleteDevice(row.id);
  }

  applySearch(value: string) { this.searchTerm = value; this.applyFilters(); }
  applyState(value: string)  { this.stateFilter = value; this.applyFilters(); }

  private applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      q: this.searchTerm.trim(),
      state: this.stateFilter,
    });
  }
}
