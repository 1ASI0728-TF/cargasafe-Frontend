import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class User implements BaseEntity {
  private _id: number;
  private _email: string;
  private _roles: string[];

  constructor(args: { id: number; email: string; roles: string[] }) {
    this._id = args.id;
    this._email = args.email;
    this._roles = args.roles;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  get roles(): string[] {
    return this._roles;
  }

  set roles(value: string[]) {
    this._roles = value;
  }

  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  isOperator(): boolean {
    return this.hasRole('OPERATOR');
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
