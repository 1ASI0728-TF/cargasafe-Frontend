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

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'address_components'],
      componentRestrictions: this.country ? { country: this.country } : undefined,
    };

    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, options);

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      this.placeChanged.emit(place);
    });

    // 👇 close autocomplete on blur
    this.el.nativeElement.addEventListener('blur', () => this.closeAutocomplete());
  }

  private closeAutocomplete() {
    // Trick to close google autocomplete dropdown:
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    this.el.nativeElement.dispatchEvent(escEvent);
  }
}
