import { Component, computed, inject, TemplateRef, ViewContainerRef } from '@angular/core';
import { RoomService } from '@/app/pages/room/room-service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButton, MatIconButton } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayContent } from '@/app/core/services/overlay-content';
import { UserInfo } from '../user-info/user-info';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatIconButton, MatButton, OverlayModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly overlayContent = inject(OverlayContent);
  private readonly snackbar = inject(MatSnackBar);
  private readonly clipboad = inject(Clipboard);
  private readonly roomService = inject(RoomService);
  public readonly currentUrl = location.href;
  public readonly player = this.roomService.currentPlayer;
  public readonly username = computed(() => {
    const username = this.player().username.toUpperCase().split(' ');
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
    this.overlayContent.open(origin, template, this.currentUrl, this.viewContainerRef);
  }

  copyLink() {
    try {
      const success = this.clipboad.copy(this.currentUrl);
      if (success) {
        this.snackbar.open('Link copied successfully', undefined, { duration: 3000 });
        this.overlayContent.close();
      }
    } catch (error) {
      console.error('Error to copy link ', error);
      this.snackbar.open('Error copying link', undefined, { duration: 3000 });
    }
  }
}
