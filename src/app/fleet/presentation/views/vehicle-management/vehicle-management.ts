import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { defaultVehicle, Vehicle } from '../../../domain/model/vehicle.model';
import { Router } from '@angular/router';
import { VehicleCreateAndEditComponent } from '../../components/vehicle-create-and-edit/vehicle-create-and-edit';
import { FleetStore } from '../../../application/fleet.store';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './vehicle-management.html',
  styleUrls: ['./vehicle-management.css'],
})
export class VehicleManagementComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private store = inject(FleetStore);

  constructor(private router: Router) {}

  columns: string[] = ['id', 'plate', 'type', 'capabilities', 'status', 'deviceImeis', 'actions'];
  dataSource = new MatTableDataSource<Vehicle>([]);

  totalCount = 0;
  inServiceCount = 0;
  outOfServiceCount = 0;
  maintenanceCount = 0;
  retiredCount = 0;

  searchTerm = '';
  statusFilter = '';
  capabilityFilter = '';
  capabilityOptions: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.dataSource.filterPredicate = (row, filterStr) => {
      const f = JSON.parse(filterStr) as { q: string; status: string; cap: string };
      const toL = (s: string | null | undefined) => (s ?? '').toLowerCase();

      const q = toL(f.q);
      const matchesQ =
        !q ||
        toL(row.plate).includes(q) ||
        toL(String(row.type)).includes(q) ||
        (row.deviceImeis ?? []).some(imei => toL(imei).includes(q)) ||
        (row.capabilities ?? []).some(c => toL(c).includes(q));

      const matchesStatus = !f.status || row.status === f.status;
      const matchesCap    = !f.cap || (row.capabilities ?? []).includes(f.cap);

      return matchesQ && matchesStatus && matchesCap;
    };

    this.store.vehicles$.subscribe(rows => {
      this.dataSource.data = rows;

      this.totalCount        = rows.length;
      this.inServiceCount    = rows.filter(r => r.status === 'IN_SERVICE').length;
      this.outOfServiceCount = rows.filter(r => r.status === 'OUT_OF_SERVICE').length;
      this.maintenanceCount  = rows.filter(r => r.status === 'MAINTENANCE').length;
      this.retiredCount      = rows.filter(r => r.status === 'RETIRED').length;

      const set = new Set<string>();
      rows.forEach(r => (r.capabilities ?? []).forEach(c => set.add(c)));
      this.capabilityOptions = Array.from(set).sort();

      this.applyFilters();
    });

    this.store.loadVehicles();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item: Vehicle, prop: string) => {
      if (prop === 'id') return item.id ?? 0;
      const v = (item as any)[prop];
      return typeof v === 'string' ? v : String(v ?? '');
    };

    Promise.resolve().then(() => {
      this.sort.active = 'id';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit({ active: 'id', direction: 'asc' });
    });
  }

  onView(r: Vehicle) {
    this.router.navigate(['/fleet/vehicles', r.id]);
  }

  openCreateDialog() {
    const ref = this.dialog.open(VehicleCreateAndEditComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: { editMode: false, data: { ...defaultVehicle } },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.action === 'add' && res.payload) this.store.createVehicle(res.payload);
    });
  }

  onEdit(v: Vehicle): void {
    const model = { ...v, capabilities: Array.isArray(v.capabilities) ? [...v.capabilities] : [] };
    const ref = this.dialog.open(VehicleCreateAndEditComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: { editMode: true, data: model },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.action === 'update' && res.payload) this.store.updateVehicle(res.payload);
    });
  }

  onDelete(v: Vehicle): void {
    if (v.id) this.store.deleteVehicle(v.id);
  }

  applySearch(value: string)     { this.searchTerm = value; this.applyFilters(); }
  applyStatus(value: string)     { this.statusFilter = value; this.applyFilters(); }
  applyCapability(value: string) { this.capabilityFilter = value; this.applyFilters(); }

  private applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      q: this.searchTerm.trim(),
      status: this.statusFilter,
      cap: this.capabilityFilter,
    });
  }
}
