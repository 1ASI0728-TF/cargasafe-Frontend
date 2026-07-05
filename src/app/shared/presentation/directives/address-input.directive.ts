import { Directive, ElementRef, EventEmitter, Output, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[addressInput]',
  standalone: true,
})
export class AddressInputDirective implements AfterViewInit {
  @Output() placeChanged = new EventEmitter<google.maps.places.PlaceResult>();

  @Input() country?: string = 'pe';

  private autocomplete!: google.maps.places.Autocomplete;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngAfterViewInit(): void {
    // 🚫 prevent creating multiple instances
    if (this.autocomplete) return;

    // The Google Maps JS SDK is loaded from an external <script> tag in index.html.
    // This is a standalone demo/testing build, so if that script is blocked, offline,
    // or simply not loaded, we fall back to a plain text input instead of throwing.
    if (typeof google === 'undefined' || !google.maps?.places) {
      console.warn(
        '[addressInput] Google Maps Places API is not available. ' +
          'Address autocomplete is disabled; the field still works as a plain text input.'
      );
      return;
    }

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'address_components'],
      componentRestrictions: this.country ? { country: this.country } : undefined,
    };

    try {
      this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, options);

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        this.placeChanged.emit(place);
      });

      // 👇 close autocomplete on blur
      this.el.nativeElement.addEventListener('blur', () => this.closeAutocomplete());
    } catch (error) {
      console.warn('[addressInput] Could not initialize Google Maps autocomplete.', error);
    }
  }

  private closeAutocomplete() {
    // Trick to close google autocomplete dropdown:
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    this.el.nativeElement.dispatchEvent(escEvent);
  }
}
