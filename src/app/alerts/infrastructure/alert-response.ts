export interface IncidentResource {
  id: number;
  alertId: number;
  description: string;
  createdAt: string;
  acknowledgedAt?: string | null;
  closedAt?: string | null;
}

export interface NotificationResource {
  id: number;
  alertId: number;
  notificationChannel: string;
  message: string;
  sentAt: string;
}

export interface AlertResource {
  id: number;
  alertType: string;
  alertStatus: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  createdAt: string;
  closedAt?: string | null;
  description: string;
  incidents?: IncidentResource[];
  notifications?: NotificationResource[];
  deliveryOrderId?: number
}

export interface AlertResponse {
  alerts: AlertResource[];
}
