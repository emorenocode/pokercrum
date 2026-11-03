import {
  Component,
  computed,
  inject,
  TemplateRef,
  ViewContainerRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButton, MatIconButton } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';
import { QrCodeComponent } from 'ng-qrcode';
import { OverlayContent } from '@/app/core/services/overlay-content';
import { UserInfo } from '../user-info/user-info';
import { PlayerStore } from '@/app/core/services/player-store';
import { Logger } from '@/app/core/services/logger';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatIconButton,
    MatButton,
    OverlayModule,
    QrCodeComponent,
    MatTooltipModule,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css',
})
export class Header {
  private readonly logger = inject(Logger);
  private readonly playerStore = inject(PlayerStore);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly overlayContent = inject(OverlayContent);
  private readonly snackbar = inject(MatSnackBar);
  private readonly clipboad = inject(Clipboard);
  protected currentUrl = location.href;
  public readonly player = this.playerStore.player;
  public readonly username = computed(() => {
    const username = this.player().username.trim().toUpperCase().split(' ');
    let letters = username[0].slice(0, 2);

    if (username.length >= 2) {
      letters = `${username[0][0]}${username[1][0]}`;
    }

    return letters;
  });

  constructor() {}

  openUserInfo(origin: HTMLElement) {
    this.overlayContent.open(origin, UserInfo);
  }

  openToShared(origin: HTMLElement, template: TemplateRef<any>) {
    this.currentUrl = location.href;
    this.overlayContent.open(origin, template, this.currentUrl, this.viewContainerRef);
  }

  async copyQrCode(container: HTMLElement) {
    try {
      const canvas = container.querySelector('canvas');
      if (!canvas) throw new Error('QR code canvas not found.');

      const image = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create QR code image.'));
          }
        }, 'image/png');
      });

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })]);
      this.snackbar.open('QR code copied to clipboard', undefined, { duration: 3000 });
      this.overlayContent.close();
    } catch (error) {
      this.logger.error('header.copy-qr-code.error', error);
      this.snackbar.open('Error copying QR code', undefined, { duration: 3000 });
    }
  }

  copyLink() {
    try {
      const success = this.clipboad.copy(this.currentUrl);
      if (success) {
        this.snackbar.open('Link copied successfully', undefined, { duration: 3000 });
        this.overlayContent.close();
      }
    } catch (error) {
      this.logger.error('header.copy-link.error', error);
      this.snackbar.open('Error copying link', undefined, { duration: 3000 });
    }
  }
}
