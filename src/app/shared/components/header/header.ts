import { Component, inject, TemplateRef } from '@angular/core';
import { RoomService } from '../../../pages/room/room-service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButton, MatIconButton } from '@angular/material/button';
import { OverlayModule } from '@angular/cdk/overlay';
import { OverlayContent } from '../../../core/services/overlay-content';
import { UserInfo } from '../user-info/user-info';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, MatMenuModule, MatDialogClose, MatIconButton, MatButton, OverlayModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  openUserInfo(origin: HTMLElement) {
    this.overlayContent.open(origin, UserInfo);
  }
  private readonly overlayContent = inject(OverlayContent);

  private readonly snackbar = inject(MatSnackBar);
  private readonly clipboad = inject(Clipboard);
  private readonly dialog = inject(MatDialog);
  private readonly roomService = inject(RoomService);
  public readonly currentUrl = location.href;
  public readonly player = this.roomService.currentPlayer;
  public isOpen = false;

  constructor() {}

  openDialogToShared(template: TemplateRef<any>) {
    this.dialog
      .open(template, { data: this.currentUrl })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (!res) return;

          try {
            const success = this.clipboad.copy(this.currentUrl);
            if (success) {
              this.snackbar.open('Link copied successfully', undefined, { duration: 3000 });
            }
          } catch (error) {
            console.error('Error to copy link ', error);
            this.snackbar.open('Error copying link', undefined, { duration: 3000 });
          }
        },
      });
  }
}
