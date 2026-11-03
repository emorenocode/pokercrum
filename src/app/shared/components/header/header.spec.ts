import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerStore } from '@/app/core/services/player-store';
import { OverlayContent } from '@/app/core/services/overlay-content';
import { afterEach, vi } from 'vitest';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  const snackbarOpen = vi.fn();
  const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  beforeEach(async () => {
    snackbarOpen.mockClear();
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        {
          provide: PlayerStore,
          useValue: {
            player: signal({ id: '', username: '', fromMobile: false, isOnline: true }),
          },
        },
        { provide: OverlayContent, useValue: { open: () => {}, close: () => {} } },
        { provide: MatSnackBar, useValue: { open: snackbarOpen } },
        { provide: Clipboard, useValue: { copy: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copies the QR code image to the clipboard', async () => {
    const clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { write: clipboardWrite },
    });

    class TestClipboardItem {
      constructor(readonly data: Record<string, Blob>) {}
    }
    vi.stubGlobal('ClipboardItem', TestClipboardItem);

    const container = document.createElement('div');
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'toBlob', {
      value: (callback: BlobCallback) => callback(new Blob(['qr-code'], { type: 'image/png' })),
    });
    container.append(canvas);

    await component.copyQrCode(container);

    expect(clipboardWrite).toHaveBeenCalledOnce();
    expect(clipboardWrite.mock.calls[0][0][0].data['image/png']).toBeInstanceOf(Blob);
    expect(snackbarOpen).toHaveBeenCalledWith('QR code copied to clipboard', undefined, {
      duration: 3000,
    });
  });
});
