import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class OriginPoint implements BaseEntity {
  private _id: number;
  private _name: string;
  private _address: string;
  private _latitude: number;
  private _longitude: number;

  constructor(originPoint: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }) {
    this._id = originPoint.id;
    this._name = originPoint.name;
    this._address = originPoint.address;
    this._latitude = originPoint.latitude;
    this._longitude = originPoint.longitude;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get address(): string {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
  }

  get latitude(): number {
    return this._latitude;
  }

  set latitude(value: number) {
    this._latitude = value;
  }

  get longitude(): number {
    return this._longitude;
  }

  set longitude(value: number) {
    this._longitude = value;
  }
}
