import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProfileStore } from '../../../application/profile.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Profile } from '../../../domain/model/profile.entity';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile-info',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatProgressSpinner,
  ],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.css',
})
export class ProfileInfo implements OnInit {
  isEditMode = signal(false);
  profileStore = inject(ProfileStore);
  profile$ = computed(() => this.profileStore.profileState);
  private fb = inject(FormBuilder);
  documentTypesOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'PAS', label: 'Passport' },
    { value: 'CEX', label: 'CEX' },
  ];

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    birthDate: ['', Validators.required],
    document: ['', Validators.required],
    documentType: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.isEditMode()) {
        this.form.enable();
      } else {
        this.form.disable();
      }
    });
  }

  ngOnInit(): void {
    this.profileStore.loadProfileByUserId(1).subscribe(() => {
      this.syncProfileToForm();
    });
  }

  /**
   * Helper function to easily check for a specific error on a control.
   * @param controlName The name of the form control.
   * @param errorType The type of validation error (e.g., 'required').
   * @returns True if the control has the error and has been touched/dirtied.
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(errorType) && (control.dirty || control.touched);
  }

  syncProfileToForm() {
    const profile = this.profile$().data();

    if (!profile) return;

    this.form.setValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
      birthDate: profile.birthDate?.toISOString().split('T')[0] ?? '',
      document: profile.document,
      documentType: profile.documentType,
    });
    this.form.markAsPristine();
  }

  onClickEdit() {
    this.isEditMode.set(true);
  }
  onClickCancel() {
    this.isEditMode.set(false);
    this.syncProfileToForm();
  }
  onClickSave() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const updatedProfile = new Profile({
      id: this.profile$().data()?.id ?? 0,
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      phoneNumber: this.form.value.phoneNumber!,
      birthDate: this.form.value.birthDate ? new Date(this.form.value.birthDate) : null,
      document: this.form.value.document!,
      documentType: this.form.value.documentType!,
      userId: this.profile$().data()?.userId ?? 0,
    });

    this.profileStore.updateProfile(updatedProfile).subscribe(() => {
      this.isEditMode.set(false);
    });
  }
}
