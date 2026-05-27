import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TripTotalSummaryComponent } from '../../components/trip-total-summary/trip-total-summary.component';
import { TripTableListComponent } from '../../components/trip-table-list/trip-table-list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trip-list-view',
  imports: [
    CommonModule,
    TripTotalSummaryComponent,
    TripTableListComponent,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './trip-list-view.component.html',
  styleUrl: './trip-list-view.component.css',
  standalone: true,
})
export class TripListViewComponent {}
