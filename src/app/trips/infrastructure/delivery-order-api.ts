import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DeliveryOrderAssembler } from './delivery-order-assembler';
import { DeliveryOrderResource } from './delivery-order-response';

@Injectable({ providedIn: 'root' })
export class DeliveryOrdersApi {
  private deliveryOrdersEndpoint = environment.deliveryOrdersEndpointPath;
  private baseUrl = `${environment.baseUrl}${this.deliveryOrdersEndpoint}`;
  private http = inject(HttpClient);

  getAll() {
    return this.http
      .get<DeliveryOrderResource[]>(this.baseUrl)
      .pipe(map((resources) => DeliveryOrderAssembler.toEntitiesFromResources(resources)));
  }

  markAsDelivered(orderId: number) {
    return this.http.post(`${this.baseUrl}/${orderId}/delivery`, undefined);
  }
}
