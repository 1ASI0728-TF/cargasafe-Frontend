import { HttpErrorResponse } from '@angular/common/http';

export function mapFleetError(error: unknown, context: 'device' | 'vehicle'): string {
  if (error instanceof HttpErrorResponse) {

    // ---- 400 BAD REQUEST ----
    if (error.status === 400) {
      return context === 'device'
        ? 'Invalid device data. Please verify the information and try again.'
        : 'Invalid vehicle data. Please verify the form fields.';
    }

    // ---- 404 NOT FOUND ----
    if (error.status === 404) {
      return context === 'device'
        ? 'The specified device was not found.'
        : 'The requested vehicle does not exist.';
    }

    // ---- 409 CONFLICT (business rules) ----
    if (error.status === 409) {
      const backendMessage = (error.error?.message || '').toLowerCase();

      if (backendMessage.includes('imei')) {
        return 'This IMEI is already registered.';
      }

      if (backendMessage.includes('device already assigned')) {
        return 'This device is already assigned to a vehicle.';
      }

      if (backendMessage.includes('vehicle already has device')) {
        return 'This vehicle already has an assigned device.';
      }

      if (backendMessage.includes('plate')) {
        return 'This license plate is already in use.';
      }

      return 'A conflict occurred while processing your request.';
    }

    // ---- 500 INTERNAL SERVER ERROR ----
    if (error.status === 500) {
      return 'A server error occurred. Please try again later.';
    }

    // Default fallback
    return `Unexpected error (${error.status}). Please try again.`;
  }

  return 'An unknown error occurred.';
}
