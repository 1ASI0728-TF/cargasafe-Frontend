import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Alert } from './alert.model';
import { TripStatus } from './trip-status.enum';

export class Trip implements BaseEntity {
  private _id: number;
  private _startDate: Date;
  private _endDate: Date;
  private _origin: string;
  private _destination: string;
  private _vehiclePlate: string;
  private _driverName: string;
  private _cargoType: string;
  private _status: TripStatus;
  private _distance: number;
  private _alerts: Alert[];

  constructor(
    id: number,
    startDate: Date,
    endDate: Date,
    origin: string,
    destination: string,
    vehiclePlate: string,
    driverName: string,
    cargoType: string,
    status: TripStatus,
    distance: number,
    alerts: Alert[] = []
  ) {
    this._id = id;
    this._startDate = startDate;
    this._endDate = endDate;
    this._origin = origin;
    this._destination = destination;
    this._vehiclePlate = vehiclePlate;
    this._driverName = driverName;
    this._cargoType = cargoType;
    this._status = status;
    this._distance = distance;
    this._alerts = alerts;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get origin(): string {
    return this._origin;
  }

  get destination(): string {
    return this._destination;
  }

  get vehiclePlate(): string {
    return this._vehiclePlate;
  }

  get driverName(): string {
    return this._driverName;
  }

  get cargoType(): string {
    return this._cargoType;
  }

  get status(): TripStatus {
    return this._status;
  }

  get distance(): number {
    return this._distance;
  }

  get alerts(): Alert[] {
    return [...this._alerts]; // Return a copy to maintain encapsulation
  }

  // Domain methods
  start(): void {
    if (this._status !== TripStatus.IN_PROGRESS) {
      this._status = TripStatus.IN_PROGRESS;
      this._startDate = new Date();
    }
  }

  complete(): void {
    if (this._status === TripStatus.IN_PROGRESS) {
      this._status = TripStatus.COMPLETED;
      this._endDate = new Date();
    }
  }

  cancel(): void {
    if (this._status === TripStatus.IN_PROGRESS) {
      this._status = TripStatus.CANCELLED;
    }
  }

  delay(): void {
    if (this._status === TripStatus.IN_PROGRESS) {
      this._status = TripStatus.DELAYED;
    }
  }

  addAlert(alert: Alert): void {
    this._alerts.push(alert);
  }

  isInProgress(): boolean {
    return this._status === TripStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this._status === TripStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this._status === TripStatus.CANCELLED;
  }

  isDelayed(): boolean {
    return this._status === TripStatus.DELAYED;
  }

  hasUnresolvedAlerts(): boolean {
    return this._alerts.some(alert => !alert.resolved);
  }

  getUnresolvedAlertsCount(): number {
    return this._alerts.filter(alert => !alert.resolved).length;
  }

  getCriticalAlerts(): Alert[] {
    return this._alerts.filter(alert => alert.isCritical());
  }

  getDurationInHours(): number {
    if (!this._endDate) {
      return 0;
    }
    return (this._endDate.getTime() - this._startDate.getTime()) / (1000 * 60 * 60);
  }

  getAverageSpeed(): number {
    const duration = this.getDurationInHours();
    return duration > 0 ? this._distance / duration : 0;
  }

  /**
   * Creates a Trip from a plain object (useful for HTTP responses)
   */
  static fromJson(json: any): Trip {
    return new Trip(
      json.id,
      new Date(json.startDate),
      new Date(json.endDate),
      json.origin,
      json.destination,
      json.vehiclePlate,
      json.driverName,
      json.cargoType,
      json.status as TripStatus,
      json.distance,
      json.alerts?.map((a: any) => Alert.fromJson(a)) || []
    );
  }

  /**
   * Converts the entity to a plain object (useful for HTTP requests)
   */
  toJson(): any {
    return {
      id: this._id,
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      origin: this._origin,
      destination: this._destination,
      vehiclePlate: this._vehiclePlate,
      driverName: this._driverName,
      cargoType: this._cargoType,
      status: this._status,
      distance: this._distance,
      alerts: this._alerts.map(alert => alert.toJson())
    };
  }
}