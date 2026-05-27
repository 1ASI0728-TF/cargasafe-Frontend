import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { Trip } from './trip.entity';

export class TripParameter implements BaseEntity {
  private _id: number;
  private _tripId: number;
  private _trip: Trip | null;

  private _minTemperature: number | null;
  private _maxTemperature: number | null;
  private _minHumidity: number | null;
  private _maxHumidity: number | null;
  private _maxVibration: number | null;

  constructor(tripParameter: {
    id: number;
    tripId: number;
    minTemperature: number | null;
    maxTemperature: number | null;
    minHumidity: number | null;
    maxHumidity: number | null;
    maxVibration: number | null;
    trip: Trip | null;
  }) {
    this._id = tripParameter.id;
    this._tripId = tripParameter.tripId;
    this._minTemperature = tripParameter.minTemperature;
    this._maxTemperature = tripParameter.maxTemperature;
    this._minHumidity = tripParameter.minHumidity;
    this._maxHumidity = tripParameter.maxHumidity;
    this._maxVibration = tripParameter.maxVibration;
    this._trip = tripParameter.trip;
  }

  get id(): number {
    return this._id;
  }

  get tripId(): number {
    return this._tripId;
  }

  get minTemperature(): number | null {
    return this._minTemperature;
  }

  get maxTemperature(): number | null {
    return this._maxTemperature;
  }

  get minHumidity(): number | null {
    return this._minHumidity;
  }

  get maxHumidity(): number | null {
    return this._maxHumidity;
  }

  get maxVibration(): number | null {
    return this._maxVibration;
  }

  set id(value: number) {
    this._id = value;
  }

  set tripId(value: number) {
    this._tripId = value;
  }

  set minTemperature(value: number | null) {
    this._minTemperature = value;
  }

  set maxTemperature(value: number | null) {
    this._maxTemperature = value;
  }

  set minHumidity(value: number | null) {
    this._minHumidity = value;
  }

  set maxHumidity(value: number | null) {
    this._maxHumidity = value;
  }

  set maxVibration(value: number | null) {
    this._maxVibration = value;
  }

  get trip(): Trip | null {
    return this._trip;
  }

  set trip(value: Trip | null) {
    this._trip = value;
  }
}
