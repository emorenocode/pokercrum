import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Firestore } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { Player } from '@/app/core/models';
import { PlayerStore } from '@/app/core/services/player-store';
import { RoomService } from './room-service';
import { vi } from 'vitest';

const firestoreMocks = vi.hoisted(() => {
  const batch = {
    set: vi.fn(),
    update: vi.fn(),
    commit: vi.fn(),
  };

  return {
    batch,
    collection: vi.fn((...segments: unknown[]) => segments),
    collectionData: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn((...segments: unknown[]) => segments),
    docData: vi.fn(),
    getDoc: vi.fn(),
    onSnapshot: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    writeBatch: vi.fn(() => batch),
  };
});

vi.mock('@angular/fire/firestore', () => ({
  Firestore: class Firestore {},
  collection: firestoreMocks.collection,
  collectionData: firestoreMocks.collectionData,
  deleteDoc: firestoreMocks.deleteDoc,
  doc: firestoreMocks.doc,
  docData: firestoreMocks.docData,
  getDoc: firestoreMocks.getDoc,
  onSnapshot: firestoreMocks.onSnapshot,
  setDoc: firestoreMocks.setDoc,
  updateDoc: firestoreMocks.updateDoc,
  writeBatch: firestoreMocks.writeBatch,
}));

describe('RoomService', () => {
  const initialPlayer: Player = {
    id: 'player-1',
    username: '',
    fromMobile: false,
  };
  let service: RoomService;
  let playerStore: {
    player: ReturnType<typeof signal<Player>>;
    savePlayer: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firestoreMocks.batch.commit.mockResolvedValue(undefined);
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => true });
    firestoreMocks.setDoc.mockResolvedValue(undefined);
    firestoreMocks.updateDoc.mockResolvedValue(undefined);
    firestoreMocks.deleteDoc.mockResolvedValue(undefined);

    playerStore = {
      player: signal(initialPlayer),
      savePlayer: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: PlayerStore, useValue: playerStore },
      ],
    });
    service = TestBed.inject(RoomService);
  });

  it('rejects invalid usernames when creating a room without writing to Firestore', async () => {
    await expect(firstValueFrom(service.createRoom(' '))).rejects.toThrow(
      'Username is required and must be between 2 and 30 chars',
    );

    expect(firestoreMocks.writeBatch).not.toHaveBeenCalled();
  });

  it('creates a room and stores the owner as its first player', async () => {
    const room = await firstValueFrom(service.createRoom(' Alice '));

    expect(room.createdBy).toBe(initialPlayer.id);
    expect(room.id).toBeTruthy();
    expect(playerStore.player().username).toBe('Alice');
    expect(playerStore.player().room).toBe(room.id);
    expect(firestoreMocks.batch.set).toHaveBeenCalledTimes(2);
    expect(firestoreMocks.batch.commit).toHaveBeenCalledOnce();
    expect(playerStore.savePlayer).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'Alice', room: room.id }),
    );
    expect(service.currentRoom()).toEqual(room);
  });

  it('does not add a player when the room does not exist', async () => {
    firestoreMocks.getDoc.mockResolvedValueOnce({ exists: () => false });

    await expect(
      firstValueFrom(
        service.joinRoom({ ...initialPlayer, username: 'Guest' }, 'missing-room'),
      ),
    ).rejects.toThrow('Room not found');

    expect(firestoreMocks.setDoc).not.toHaveBeenCalled();
    expect(playerStore.savePlayer).not.toHaveBeenCalled();
  });

  it('joins an existing room with a normalized username', async () => {
    const player = await firstValueFrom(
      service.joinRoom({ ...initialPlayer, username: ' Guest ' }, 'room-1'),
    );

    expect(player).toEqual({
      ...initialPlayer,
      username: 'Guest',
      room: 'room-1',
    });
    expect(firestoreMocks.setDoc).toHaveBeenCalledOnce();
    expect(playerStore.savePlayer).toHaveBeenCalledWith(player);
  });

  it('rejects card selection after cards have been revealed', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: true,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await expect(
      firstValueFrom(service.selectCard('room-1', { ...initialPlayer, username: 'Alice' })),
    ).rejects.toThrow('Cards are already revealed');

    expect(firestoreMocks.setDoc).not.toHaveBeenCalled();
  });

  it('writes a selected card while voting is open', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });
    const player = { ...initialPlayer, username: 'Alice' };
    const card = { value: '5', label: 'Medium to large effort' };

    await firstValueFrom(service.selectCard('room-1', { ...player, card }));

    expect(firestoreMocks.setDoc).toHaveBeenCalledOnce();
    expect(firestoreMocks.setDoc.mock.calls[0][1]).toEqual({
      ...player,
      card,
      room: 'room-1',
    });
  });

  it('rejects reveal attempts from a non-owner', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'another-player',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await expect(firstValueFrom(service.onReveal('room-1', true))).rejects.toThrow(
      'Only the room owner can reveal cards',
    );

    expect(firestoreMocks.updateDoc).not.toHaveBeenCalled();
  });

  it('allows the owner to reveal cards', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 500,
      show: false,
      createdBy: initialPlayer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await firstValueFrom(service.onReveal('room-1', true));

    expect(firestoreMocks.updateDoc).toHaveBeenCalledOnce();
    expect(firestoreMocks.updateDoc.mock.calls[0][1]).toEqual(
      expect.objectContaining({ show: true, timerEnd: 0 }),
    );
  });

  it('rejects reset attempts from a non-owner', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: true,
      createdBy: 'another-player',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await expect(firstValueFrom(service.onResetCards('room-1', []))).rejects.toThrow(
      'Only the room owner can reset cards',
    );

    expect(firestoreMocks.writeBatch).not.toHaveBeenCalled();
  });

  it('allows the owner to reset cards and start the next timer', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 500,
      show: true,
      createdBy: initialPlayer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });
    const players: Player[] = [
      {
        id: 'guest-1',
        username: 'Guest',
        fromMobile: false,
        card: { value: '5', label: 'Medium to large effort' },
        room: 'room-1',
      },
    ];

    await firstValueFrom(service.onResetCards('room-1', players));

    expect(firestoreMocks.batch.set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ ...players[0], card: null }),
    );
    expect(firestoreMocks.batch.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        show: false,
        timerEnd: expect.any(Number),
      }),
    );
    expect(firestoreMocks.batch.commit).toHaveBeenCalledOnce();
  });

  it('allows an owner to remove another player', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: initialPlayer.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await firstValueFrom(service.onDeletePlayer('room-1', 'guest-1'));

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledOnce();
  });

  it('rejects removing another player when the caller is not the owner', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await expect(firstValueFrom(service.onDeletePlayer('room-1', 'guest-2'))).rejects.toThrow(
      'You are not allowed to delete this player',
    );

    expect(firestoreMocks.deleteDoc).not.toHaveBeenCalled();
  });

  it('allows a player to remove themselves', async () => {
    service.currentRoom.set({
      id: 'room-1',
      name: '',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    });

    await firstValueFrom(service.onDeletePlayer('room-1', initialPlayer.id));

    expect(firestoreMocks.deleteDoc).toHaveBeenCalledOnce();
  });
});
