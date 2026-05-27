import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { DeliveryOrderStatus } from './delivery-order-status.vo';
import { Trip } from './trip.entity';

export class DeliveryOrder implements BaseEntity {
  private _id: number;
  private _clientEmail: string;
  private _address: string;
  private _latitude: number;
  private _longitude: number;
  private _sequenceOrder: number;
  private _arrivalAt: Date | null;
  private _notes: string;
  private _maxHumidity: number | null;
  private _minHumidity: number | null;
  private _maxTemperature: number | null;
  private _minTemperature: number | null;
  private _maxVibration: number | null;
  private _tripId: number;
  private _trip: Trip | null;
  private _status: DeliveryOrderStatus;

  constructor(deliveryOrder: {
    id: number;
    clientEmail: string;
    address: string;
    latitude: number;
    longitude: number;
    sequenceOrder: number;
    arrivalAt: Date | null;
    notes: string;
    maxHumidity: number | null;
    minHumidity: number | null;
    maxTemperature: number | null;
    minTemperature: number | null;
    maxVibration: number | null;
    tripId: number;
    trip: Trip | null;
    status: DeliveryOrderStatus;
  }) {
    this._id = deliveryOrder.id;
    this._clientEmail = deliveryOrder.clientEmail;
    this._address = deliveryOrder.address;
    this._latitude = deliveryOrder.latitude;
    this._longitude = deliveryOrder.longitude;
    this._sequenceOrder = deliveryOrder.sequenceOrder;
    this._arrivalAt = deliveryOrder.arrivalAt;
    this._notes = deliveryOrder.notes;
    this._maxHumidity = deliveryOrder.maxHumidity;
    this._minHumidity = deliveryOrder.minHumidity;
    this._maxTemperature = deliveryOrder.maxTemperature;
    this._minTemperature = deliveryOrder.minTemperature;
    this._maxVibration = deliveryOrder.maxVibration;
    this._tripId = deliveryOrder.tripId;
    this._trip = deliveryOrder.trip;
    this._status = deliveryOrder.status;
  }

  static createEmpty(): DeliveryOrder {
    return new DeliveryOrder({
      id: 0,
      clientEmail: '',
      address: '',
      latitude: 0,
      longitude: 0,
      sequenceOrder: 0,
      arrivalAt: null,
      notes: '',
      maxHumidity: null,
      minHumidity: null,
      maxTemperature: null,
      minTemperature: null,

      maxVibration: null,
      tripId: 0,
      trip: null,
      status: DeliveryOrderStatus.PENDING,
    });
  }

  isPending(): boolean {
    return this._status === DeliveryOrderStatus.PENDING;
  }
  isDelivered(): boolean {
    return this._status === DeliveryOrderStatus.DELIVERED;
  }
  isCancelled(): boolean {
    return this._status === DeliveryOrderStatus.CANCELLED;
  }
  markAsDelivered() {
    this._status = DeliveryOrderStatus.DELIVERED;
  }

  get id(): number {
    return this._id;
  }
  get clientEmail(): string {
    return this._clientEmail;
  }
  get address(): string {
    return this._address;
  }
  get latitude(): number {
    return this._latitude;
  }
  get longitude(): number {
    return this._longitude;
  }
  get sequenceOrder(): number {
    return this._sequenceOrder;
  }
  get arrivalAt(): Date | null {
    return this._arrivalAt;
  }
  get notes(): string {
    return this._notes;
  }
  get maxHumidity(): number | null {
    return this._maxHumidity;
  }
  get minHumidity(): number | null {
    return this._minHumidity;
  }
  get maxTemperature(): number | null {
    return this._maxTemperature;
  }
  get minTemperature(): number | null {
    return this._minTemperature;
  }
  get maxVibration(): number | null {
    return this._maxVibration;
  }
  get tripId(): number {
    return this._tripId;
  }
  get trip(): Trip | null {
    return this._trip;
  }
  get status(): DeliveryOrderStatus {
    return this._status;
  }

  set trip(value: Trip | null) {
    this._trip = value;
  }
  set id(value: number) {
    this._id = value;
  }
  set clientEmail(value: string) {
    this._clientEmail = value;
  }
  set address(value: string) {
    this._address = value;
  }
  set latitude(value: number) {
    this._latitude = value;
  }
  set longitude(value: number) {
    this._longitude = value;
  }
  set sequenceOrder(value: number) {
    this._sequenceOrder = value;
  }
  set arrivalAt(value: Date) {
    this._arrivalAt = value;
  }
  set notes(value: string) {
    this._notes = value;
  }
  set maxHumidity(value: number) {
    this._maxHumidity = value;
  }
  set minHumidity(value: number) {
    this._minHumidity = value;
  }
  set maxTemperature(value: number) {
    this._maxTemperature = value;
  }
  set minTemperature(value: number) {
    this._minTemperature = value;
  }
  set maxVibration(value: number) {
    this._maxVibration = value;
  }
  set tripId(value: number) {
    this._tripId = value;
  }
  set status(value: DeliveryOrderStatus) {
    this._status = value;
  }
}
