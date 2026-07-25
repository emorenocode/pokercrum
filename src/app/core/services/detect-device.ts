import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DetectDevice {
  isMobile = this.detectMobile();

  private detectMobile(): boolean {
    // Client Hints
    if ('userAgentData' in navigator) {
      const uaData = (
        navigator as Navigator & {
          userAgentData?: { mobile: boolean };
        }
      ).userAgentData;

      if (uaData?.mobile) {
        return true;
      }
    }

    const ua = navigator.userAgent;

    // Android, iPhone, iPad, iPod, Windows Phone, etc.
    if (/Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua)) {
      return true;
    }

    // iPadOS 13+ se identifica como Mac
    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      return true;
    }

    return false;
  }
}
