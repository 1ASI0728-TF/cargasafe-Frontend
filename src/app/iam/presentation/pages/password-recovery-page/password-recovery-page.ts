import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-recovery-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './password-recovery-page.html',
  styleUrls: ['./password-recovery-page.css']
})
export class PasswordRecoveryPageComponent {
  email: string = '';

  constructor(private router: Router) {}

  onSendRecovery(): void {
    if (this.email) {
      console.log('Password recovery request for:', this.email);
      // TODO: Implement the actual API call to send the recovery link
      alert(`Instructions sent to ${this.email}.`);
    } else {
      console.error('Please enter your email address');
    }
  }

  onBackToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  onSignIn(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}
