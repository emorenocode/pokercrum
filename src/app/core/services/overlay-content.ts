import { Injectable, Injector, TemplateRef, ViewContainerRef } from '@angular/core';
import { ComponentType, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class OverlayContent {
  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay, private injector: Injector) {}

  open<T = any>(
    origin: HTMLElement,
    componentOrTemplate: ComponentType<T> | TemplateRef<T>,
    data?: any,
    viewContainerRef?: ViewContainerRef
  ) {
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

    let portal: any;

    if (componentOrTemplate instanceof TemplateRef && viewContainerRef) {
      const context: any = data ? { $implicit: data } : null;
      portal = new TemplatePortal(componentOrTemplate, viewContainerRef, context, this.injector);
    } else if (typeof componentOrTemplate === 'function') {
      portal = new ComponentPortal(componentOrTemplate, null, this.injector);
    }

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
