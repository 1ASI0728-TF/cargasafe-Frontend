import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Incident implements BaseEntity {
  private _id: number;
  private _alertId: number;
  private _description: string;
  private _createdAt: Date;
  private _acknowledgedAt: Date | null;
  private _closedAt: Date | null;

  constructor(incident: {
    id: number;
    alertId: number;
    description: string;
    createdAt: Date;
    acknowledgedAt: Date | null;
    closedAt: Date | null;
  }) {
    this._id = incident.id;
    this._alertId = incident.alertId;
    this._description = incident.description;
    this._createdAt = new Date(incident.createdAt);
    this._acknowledgedAt = incident.acknowledgedAt ? new Date(incident.acknowledgedAt) : null;
    this._closedAt = incident.closedAt ? new Date(incident.closedAt) : null;
  }

  get id(): number { return this._id; }
  get alertId(): number { return this._alertId; }
  get description(): string { return this._description; }
  get createdAt(): Date { return this._createdAt; }
  get acknowledgedAt(): Date | null { return this._acknowledgedAt; }
  get closedAt(): Date | null { return this._closedAt; }
}
