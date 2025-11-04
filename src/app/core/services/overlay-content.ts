import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class OverlayContent {
  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T>(origin: HTMLElement, component: any, data?: any) {
    this.close();

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.overlayRef.backdropClick().subscribe(() => this.close());

    const portal = new ComponentPortal(component, null, this.injector);
    const componentRef = this.overlayRef.attach(portal);

    return {
      overlayRef: this.overlayRef,
      componentRef,
    };
  }

  close() {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
