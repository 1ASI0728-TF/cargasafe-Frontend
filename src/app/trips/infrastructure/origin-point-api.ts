import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { OriginPoint } from '../domain/model/origin-point.entity';
import { HttpClient } from '@angular/common/http';
import { OriginPointAssembler } from './origin-point-assembler';
import { OriginPointResource } from './origin-point-response';

@Injectable({ providedIn: 'root' })
export class OriginPointApi {
  private baseUrl = environment.baseUrl;
  private originPointsEndpoint = `/origin-points`;
  private http = inject(HttpClient);

  getOriginPoints(): Observable<OriginPoint[]> {
    return this.http
      .get<OriginPointResource[]>(`${this.baseUrl}${this.originPointsEndpoint}`)
      .pipe(map((resources) => OriginPointAssembler.toEntitiesFromResources(resources)));
  }
  getOriginPointByTripId(id: number): Observable<OriginPoint> {
    return this.http
      .get<OriginPointResource[]>(`${this.baseUrl}${this.originPointsEndpoint}?tripId=${id}`)
      .pipe(map(([resource]) => OriginPointAssembler.toEntityFromResource(resource)));
  }
}
