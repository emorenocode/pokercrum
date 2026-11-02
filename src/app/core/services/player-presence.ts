import { Logger } from '@/app/core/services/logger';
import { Injectable, inject, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Database, ref, onValue, set, onDisconnect, remove, update } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';

type PresenceStatus = 'connecting' | 'online' | 'offline';

interface TabPresence {
  visible: boolean;
  focused: boolean;
  updatedAt: number;
}

interface ParticipantPresence {
  connections?: Record<string, TabPresence>;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerPresence implements OnDestroy {
  private readonly auth = inject(Auth);
  private readonly database = inject(Database);
  private readonly logger = inject(Logger);

  private readonly statusSubject = new BehaviorSubject<PresenceStatus>('connecting');

  readonly status$ = this.statusSubject.asObservable();

  private roomId?: string;
  private uid?: string;
  private tabId?: string;

  private connectionRef?: ReturnType<typeof ref>;
  private participantPresenceRef?: ReturnType<typeof ref>;

  private connectedUnsubscribe?: () => void;
  private presenceUnsubscribe?: () => void;

  private writeTimer?: ReturnType<typeof setTimeout>;
  private statusTimer?: ReturnType<typeof setTimeout>;

  private connected = false;
  private active = false;
  private registering = false;

  private visible = false;
  private focused = false;

  /**
   * Inicia la presencia del participante en una sala.
   * Debe llamarse después de completar la autenticación.
   */
  async start(roomId: string): Promise<void> {
    await this.stop();

    const uid = this.auth.currentUser?.uid;

    if (!uid) {
      throw new Error('No existe un usuario autenticado en Firebase.');
    }

    this.roomId = roomId;
    this.uid = uid;
    this.tabId = crypto.randomUUID();
    this.active = true;

    this.connectionRef = ref(
      this.database,
      `rooms/${roomId}/presence/${uid}/connections/${this.tabId}`,
    );

    this.participantPresenceRef = ref(this.database, `rooms/${roomId}/presence/${uid}`);

    this.initializeBrowserListeners();
    this.listenParticipantPresence();
    this.listenFirebaseConnection();
  }

  /**
   * Escucha la conexión real con Realtime Database.
   */
  private listenFirebaseConnection(): void {
    const connectedRef = ref(this.database, '.info/connected');

    this.connectedUnsubscribe = onValue(connectedRef, (snapshot) => {
      this.connected = snapshot.val() === true;

      if (!this.connected) {
        this.statusSubject.next('connecting');
        return;
      }

      void this.registerConnection();
    });
  }

  /**
   * Registra exclusivamente la conexión de esta pestaña.
   */
  private async registerConnection(): Promise<void> {
    if (!this.active || !this.connected || !this.connectionRef || this.registering) {
      return;
    }

    this.registering = true;

    try {
      // Primero registramos la limpieza automática de esta pestaña.
      await onDisconnect(this.connectionRef).remove();

      if (!this.active || !this.connected) {
        return;
      }

      // Después registramos su estado actual.
      await set(this.connectionRef, this.getCurrentPresence());
    } catch (error) {
      this.logger.error('[Presence] Error registrando conexión:', error);
    } finally {
      this.registering = false;
    }
  }

  /**
   * Escucha todas las conexiones del participante.
   * El estado global se calcula considerando todas las pestañas.
   */
  private listenParticipantPresence(): void {
    if (!this.participantPresenceRef) {
      return;
    }

    this.presenceUnsubscribe = onValue(this.participantPresenceRef, (snapshot) => {
      const presence = snapshot.val() as ParticipantPresence | null;

      const connections = Object.values(presence?.connections ?? {});

      const isOnline = connections.some(
        (connection) => connection.visible === true && connection.focused === true,
      );

      this.scheduleGlobalStatus(isOnline);
    });
  }

  /**
   * Evita cambios momentáneos de estado al cambiar entre pestañas.
   */
  private scheduleGlobalStatus(isOnline: boolean): void {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }

    this.statusTimer = setTimeout(() => {
      this.statusSubject.next(isOnline ? 'online' : 'offline');
    }, 250);
  }

  /**
   * Escucha los eventos de visibilidad y foco del navegador.
   */
  private initializeBrowserListeners(): void {
    this.visible = document.visibilityState === 'visible';
    this.focused = this.visible && document.hasFocus();

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
  }

  private readonly handleVisibilityChange = (): void => {
    this.visible = document.visibilityState === 'visible';

    // Una pestaña oculta nunca puede considerarse enfocada.
    this.focused = this.visible && document.hasFocus();

    this.scheduleConnectionUpdate();
  };

  private readonly handleFocus = (): void => {
    this.visible = document.visibilityState === 'visible';
    this.focused = this.visible && document.hasFocus();

    this.scheduleConnectionUpdate();
  };

  private readonly handleBlur = (): void => {
    this.focused = false;

    this.scheduleConnectionUpdate();
  };

  /**
   * Agrupa cambios rápidos de foco para reducir escrituras en RTDB.
   */
  private scheduleConnectionUpdate(): void {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = setTimeout(() => {
      void this.updateConnection();
    }, 100);
  }

  /**
   * Actualiza únicamente el registro de esta pestaña.
   */
  private async updateConnection(): Promise<void> {
    if (!this.active || !this.connected || !this.connectionRef) {
      return;
    }

    try {
      await update(this.connectionRef, this.getCurrentPresence());
    } catch (error) {
      this.logger.error('[Presence] Error actualizando conexión:', error);
    }
  }

  private getCurrentPresence(): TabPresence {
    return {
      visible: this.visible,
      focused: this.focused,
      updatedAt: Date.now(),
    };
  }

  /**
   * Devuelve los UID de participantes que tienen al menos
   * una pestaña visible y enfocada.
   */
  watchOnlineUsers(roomId: string): Observable<string[]> {
    return new Observable<string[]>((subscriber) => {
      const presenceRef = ref(this.database, `rooms/${roomId}/presence`);

      const unsubscribe = onValue(
        presenceRef,
        (snapshot) => {
          const participants = snapshot.val() as Record<string, ParticipantPresence> | null;

          const onlineUsers = Object.entries(participants ?? {})
            .filter(([, presence]) =>
              Object.values(presence.connections ?? {}).some(
                (connection) => connection.visible === true && connection.focused === true,
              ),
            )
            .map(([participantUid]) => participantUid);

          subscriber.next(onlineUsers);
        },
        (error) => subscriber.error(error),
      );

      return unsubscribe;
    });
  }

  /**
   * Detiene únicamente la conexión de esta pestaña.
   */
  async stop(): Promise<void> {
    this.active = false;

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);

    this.connectedUnsubscribe?.();
    this.presenceUnsubscribe?.();

    this.connectedUnsubscribe = undefined;
    this.presenceUnsubscribe = undefined;

    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = undefined;
    }

    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
      this.statusTimer = undefined;
    }

    if (this.connectionRef) {
      try {
        // Cancelamos el onDisconnect registrado por esta pestaña.
        await onDisconnect(this.connectionRef).cancel();

        // Eliminamos exclusivamente nuestra conexión.
        await remove(this.connectionRef);
      } catch (error) {
        this.logger.error('[Presence] Error eliminando conexión:', error);
      }
    }

    this.connectionRef = undefined;
    this.participantPresenceRef = undefined;

    this.roomId = undefined;
    this.uid = undefined;
    this.tabId = undefined;

    this.connected = false;
    this.registering = false;

    this.statusSubject.next('offline');
  }

  ngOnDestroy(): void {
    void this.stop();
  }
}
