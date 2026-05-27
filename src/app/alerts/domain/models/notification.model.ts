import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Notification implements BaseEntity {
  private _id: number;
  private _alertId: number;
  private _notificationChannel: string;
  private _message: string;
  private _sentAt: Date;

  constructor(notification: {
    id: number;
    alertId: number;
    notificationChannel: string;
    message: string;
    sentAt: Date;
  }) {
    this._id = notification.id;
    this._alertId = notification.alertId;
    this._notificationChannel = notification.notificationChannel;
    this._message = notification.message;
    this._sentAt = new Date(notification.sentAt);
  }

  get id(): number { return this._id; }
  get alertId(): number { return this._alertId; }
  get notificationChannel(): string { return this._notificationChannel; }
  get message(): string { return this._message; }
  get sentAt(): Date { return this._sentAt; }
}
