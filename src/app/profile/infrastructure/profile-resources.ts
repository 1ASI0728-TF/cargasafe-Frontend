export interface ProfileResource {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  documentType: string | null;
  document: string | null;
  birthDate: string | null;
}

export interface UpdateProfileResource {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  documentType: string | null;
  document: string | null;
  birthDate: string | null;
}
