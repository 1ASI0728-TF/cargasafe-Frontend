import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { AlertType } from './alert-type.enum';
import { AlertSeverity } from './alert-severity.enum';
import { Location } from './location.model';
import { SensorData } from './sensor-data.model';

export class Alert implements BaseEntity {
  private _id: number;
  private _tripId: string;
  private _deviceId: string;
  private _vehiclePlate: string;
  private _type: AlertType;
  private _severity: AlertSeverity;
  private _timestamp: Date;
  private _location: Location;
  private _sensorData: SensorData;
  private _resolved: boolean;

  constructor(
    id: number,
    tripId: string,
    deviceId: string,
    vehiclePlate: string,
    type: AlertType,
    severity: AlertSeverity,
    timestamp: Date,
    location: Location,
    sensorData: SensorData,
    resolved: boolean = false
  ) {
    this._id = id;
    this._tripId = tripId;
    this._deviceId = deviceId;
    this._vehiclePlate = vehiclePlate;
    this._type = type;
    this._severity = severity;
    this._timestamp = timestamp;
    this._location = location;
    this._sensorData = sensorData;
    this._resolved = resolved;
  }

  // Getters
  get id(): number {
    return this._id;
  }

  get tripId(): string {
    return this._tripId;
  }

  get deviceId(): string {
    return this._deviceId;
  }

  get vehiclePlate(): string {
    return this._vehiclePlate;
  }

  get type(): AlertType {
    return this._type;
  }

  get severity(): AlertSeverity {
    return this._severity;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get location(): Location {
    return this._location;
  }

  get sensorData(): SensorData {
    return this._sensorData;
  }

  get resolved(): boolean {
    return this._resolved;
  }

  // Domain methods
  resolve(): void {
    this._resolved = true;
  }

  unresolve(): void {
    this._resolved = false;
  }

  isCritical(): boolean {
    return this._severity === AlertSeverity.CRITICAL;
  }

  isHighPriority(): boolean {
    return this._severity === AlertSeverity.HIGH || this._severity === AlertSeverity.CRITICAL;
  }

  isTemperatureAlert(): boolean {
    return this._type === AlertType.TEMPERATURE;
  }

  isMovementAlert(): boolean {
    return this._type === AlertType.MOVEMENT;
  }

  getAgeInMinutes(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this._timestamp.getTime()) / (1000 * 60));
  }

  /**
   * Creates an Alert from a plain object (useful for HTTP responses)
   */
  static fromJson(json: any): Alert {
    return new Alert(
      json.id,
      json.tripId,
      json.deviceId,
      json.vehiclePlate,
      json.type as AlertType,
      json.severity as AlertSeverity,
      new Date(json.timestamp),
      json.location,
      json.sensorData,
      json.resolved || false
    );
  }

  /**
   * Converts the entity to a plain object (useful for HTTP requests)
   */
  toJson(): any {
    return {
      id: this.id,
      tripId: this._tripId,
      deviceId: this._deviceId,
      vehiclePlate: this._vehiclePlate,
      type: this._type,
      severity: this._severity,
      timestamp: this._timestamp.toISOString(),
      location: this._location,
      sensorData: this._sensorData,
      resolved: this._resolved
    };
  }
}