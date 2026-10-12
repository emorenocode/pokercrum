import { Player, Room } from '@/app/core/models';

export function normalizeUsername(value: string): string {
  return value.trim();
}

export function isValidUsername(value: string): boolean {
  const normalized = normalizeUsername(value);
  return normalized.length >= 2 && normalized.length <= 30;
}

export function isRoomOwner(room: Room | undefined, player: Pick<Player, 'id'>): boolean {
  return !!room && room.createdBy === player.id;
}

export function canDeletePlayer(
  room: Room | undefined,
  currentPlayer: Pick<Player, 'id'>,
  targetPlayerId: string,
): boolean {
  if (!room) return false;
  return currentPlayer.id === room.createdBy || currentPlayer.id === targetPlayerId;
}

export function canRevealCards(room: Room | undefined, currentPlayer: Pick<Player, 'id'>): boolean {
  return isRoomOwner(room, currentPlayer);
}
