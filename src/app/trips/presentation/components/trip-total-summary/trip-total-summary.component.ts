import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { TripsStore } from '../../../application/trips.store';

@Component({
  selector: 'app-trip-total-summary',
  imports: [],
  templateUrl: './trip-total-summary.component.html',
  styleUrl: './trip-total-summary.component.css',
})
export class TripTotalSummaryComponent implements OnInit {
  readonly store = inject(TripsStore);
  readonly summaryState = computed(() => this.store.totalTripsSummaryState);

  ngOnInit(): void {
    this.store.loadTotalTripsSummary();
  }
}
