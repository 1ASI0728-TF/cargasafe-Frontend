import { AlertResource, AlertResponse, IncidentResource, NotificationResource } from './alert-response';
import { Alert } from '../domain/models/alert.model';
import { Incident } from '../domain/models/incident.model';
import { Notification } from '../domain/models/notification.model';

export class AlertAssembler {

  static toEntitiesFromResponse(responses: AlertResponse): Alert[] {
    return responses.alerts.map((response) => this.toEntityFromResource(response));
  }

  static toEntityFromResource(resource: AlertResource): Alert {
    return new Alert(
      resource.id,
      resource.alertType,
      resource.alertStatus,
      resource.description,
      new Date(resource.createdAt),
      resource.closedAt ? new Date(resource.closedAt) : null,
      resource.incidents?.map(this.toIncidentFromResource) || [],
      resource.notifications?.map(this.toNotificationFromResource) || [],
      resource.deliveryOrderId ?? undefined
    );
  }

  static toIncidentFromResource(resource: IncidentResource): Incident {
    return new Incident({
      id: resource.id,
      alertId: resource.alertId,
      description: resource.description,
      createdAt: new Date(resource.createdAt),
      acknowledgedAt: resource.acknowledgedAt ? new Date(resource.acknowledgedAt) : null,
      closedAt: resource.closedAt ? new Date(resource.closedAt) : null
    });
  }

  static toNotificationFromResource(resource: NotificationResource): Notification {
    return new Notification({
      id: resource.id,
      alertId: resource.alertId,
      notificationChannel: resource.notificationChannel,
      message: resource.message,
      sentAt: new Date(resource.sentAt)
    });
  }

  static toResourceFromEntity(alert: Alert): AlertResource {
    return {
      id: alert.id,
      alertType: alert.alertType,
      alertStatus: alert.alertStatus,
      createdAt: alert.createdAt.toISOString(),
      closedAt: alert.closedAt ? alert.closedAt.toISOString() : undefined,
      description: alert.description,
      incidents: alert.incidents.map(i => ({
        id: i.id,
        alertId: i.alertId,
        description: i.description,
        createdAt: i.createdAt.toISOString(),
        acknowledgedAt: i.acknowledgedAt ? i.acknowledgedAt.toISOString() : null,
        closedAt: i.closedAt ? i.closedAt.toISOString() : null
      })),
      notifications: alert.notifications.map(n => ({
        id: n.id,
        alertId: n.alertId,
        notificationChannel: n.notificationChannel,
        message: n.message,
        sentAt: n.sentAt.toISOString()
      })),
      deliveryOrderId: alert.deliveryOrderId
    };
  }
}
