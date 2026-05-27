import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export function registerBillingIcons(reg: MatIconRegistry, san: DomSanitizer) {

  const cancel = `<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.3 13.9-1.4 1.4L12 13.4l-2.9 2.9-1.4-1.4L10.6 12 7.7 9.1l1.4-1.4L12 10.6l2.9-2.9 1.4 1.4L13.4 12l2.9 2.9Z"/>
  </svg>`;
  const upgrade = `<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M5 18h14v2H5v-2Zm7-14 5.5 5.5-1.4 1.4L13 8.3V16h-2V8.3L6.9 10.9 5.5 9.5 12 4Z"/>
  </svg>`;
  const card = `<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4V10h16v8Zm0-12v2H4V6h16Z"/>
  </svg>`;
  const download = `<svg viewBox="0 0 24 24" width="24" height="24">
    <path d="M5 20h14v-2H5v2Zm7-16v9.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V4h1Z"/>
  </svg>`;

  reg.addSvgIconLiteral('cs-cancel', san.bypassSecurityTrustHtml(cancel));
  reg.addSvgIconLiteral('cs-upgrade', san.bypassSecurityTrustHtml(upgrade));
  reg.addSvgIconLiteral('cs-card', san.bypassSecurityTrustHtml(card));
  reg.addSvgIconLiteral('cs-download', san.bypassSecurityTrustHtml(download));
}
