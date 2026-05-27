import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

import { AuthService } from '../../../application/auth.service.';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    MatSnackBarModule,
  ],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css']
})
export class RegisterPageComponent {
  segment: 'Client' | 'Shipping Company' = 'Client';

  companyContactEmail: string = '';
  legalName: string = '';
  rucId: string = '';
  fiscalAddress: string = '';

  firstName: string = '';
  lastName: string = '';

  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  termsAccepted: boolean = false;

  constructor(private router: Router, private snackBar: MatSnackBar, private auth: AuthService) {}

  onRegister(): void {
    if (!this.termsAccepted) {
      this.showNotification('You must accept the terms and conditions');
      return;
    }

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.showNotification('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(this.email)) {
      this.showNotification('Please enter a valid email address');
      return;
    }

    if (this.password.length < 6) {
      this.showNotification('Password must be at least 6 characters');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showNotification('Passwords do not match');
      return;
    }

    if (this.segment === 'Shipping Company') {
      if (!this.companyContactEmail || !this.legalName || !this.rucId || !this.fiscalAddress) {
        this.showNotification('Please complete all Company Data fields');
        return;
      }

      if (!emailRegex.test(this.companyContactEmail)) {
        this.showNotification('Please enter a valid company email address');
        return;
      }
    }

    const profile = {
      firstName: this.firstName,
      lastName: this.lastName
    };

    const roles = this.segment === 'Client' ? ['CLIENT'] : ['OPERATOR'];

    this.auth.signUp(this.email, this.password, profile, roles).subscribe({
      next: () => {
        this.showNotification('Registration successful! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.showNotification('Could not register. Please try again');
      }
    });
  }

  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  onBackToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}




