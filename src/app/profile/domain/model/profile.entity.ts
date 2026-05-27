import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class Profile implements BaseEntity {
  private _id: number;
  private _createdAt?: Date | undefined;
  private _updatedAt?: Date | undefined;
  private _firstName: string;
  private _lastName: string;
  private _birthDate: Date | null;
  private _documentType: string | null;
  private _document: string | null;
  private _phoneNumber: string | null;
  private _userId: number;

  constructor(args: {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
    firstName: string;
    lastName: string;
    documentType: string | null;
    document: string | null;
    phoneNumber: string | null;
    birthDate: Date | null;
    userId: number;
  }) {
    this._id = args.id;
    this._createdAt = args.createdAt;
    this._updatedAt = args.updatedAt;
    this._firstName = args.firstName;
    this._lastName = args.lastName;
    this._documentType = args.documentType;
    this._document = args.document;
    this._userId = args.userId;
    this._phoneNumber = args.phoneNumber;
    this._birthDate = args.birthDate;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }

  set createdAt(value: Date | undefined) {
    this._createdAt = value;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  set updatedAt(value: Date | undefined) {
    this._updatedAt = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get documentType(): string | null {
    return this._documentType;
  }

  set documentType(value: string) {
    this._documentType = value;
  }

  get document(): string | null {
    return this._document;
  }

  set document(value: string) {
    this._document = value;
  }

  get userId(): number {
    return this._userId;
  }
  set userId(value: number) {
    this._userId = value;
  }
  get phoneNumber(): string | null {
    return this._phoneNumber;
  }
  set phoneNumber(value: string | null) {
    this._phoneNumber = value;
  }
  get birthDate(): Date | null {
    return this._birthDate;
  }
  set birthDate(value: Date | null) {
    this._birthDate = value;
  }
}
