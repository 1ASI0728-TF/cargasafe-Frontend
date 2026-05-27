import { inject, Injectable } from '@angular/core';
import { OriginPointApi } from '../infrastructure/origin-point-api';
import { createAsyncState } from '../../shared/helpers/async-state';
import { OriginPoint } from '../domain/model/origin-point.entity';
import { finalize, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OriginPointsStore {
  private originPointsApi = inject(OriginPointApi);
  store = createAsyncState<OriginPoint[]>([]);

  loadOriginPoints() {
    this.store.setLoading(true);
    this.originPointsApi
      .getOriginPoints()
      .pipe(
        tap({
          next: (originPoints) => {
            this.store.setData(originPoints);
          },
          error: () => {
            this.store.setError('Failed to load origin points');
          },
        }),
        finalize(() => {
          this.store.setLoading(false);
        })
      )
      .subscribe();
  }
}
