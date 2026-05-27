import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Incident } from './incident.model';
import { Notification } from './notification.model';

export class Alert implements BaseEntity {
  constructor(
    public id: number,
    public alertType: string,
    public alertStatus: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED',
    public description: string,
    public createdAt: Date,
    public closedAt: Date | null,
    public incidents: Incident[] = [],
    public notifications: Notification[] = [],
    public deliveryOrderId?: number,
    public viewed: boolean = false
  ) {}
}
