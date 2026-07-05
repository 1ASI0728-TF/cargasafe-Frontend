import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { onDbChange } from './fake-db';

/**
 * Thin Angular wrapper around the fake database's plain pub/sub.
 *
 * `fake-db.ts` intentionally has no Angular/rxjs dependency, so it
 * exposes a tiny `onDbChange(callback)` registry instead. This service
 * turns that into an `Observable<void>` that any component or store can
 * subscribe to, so screens like the Dashboard and Alerts can refresh
 * themselves live whenever something changes — e.g. the IoT simulation
 * raises a new alert, or an operator registers a new vehicle/device.
 */
@Injectable({ providedIn: 'root' })
export class FakeDbEventsService {
  private readonly subject = new Subject<void>();

  /** Emits every time the fake database is saved or reset. */
  readonly changes$: Observable<void> = this.subject.asObservable();

  constructor() {
    onDbChange(() => this.subject.next());
  }
}
