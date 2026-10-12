import { isRoomOwner, isValidUsername, normalizeUsername, canDeletePlayer } from './room-validation';

describe('Room validation', () => {
  it('normalizes usernames', () => {
    expect(normalizeUsername('  alice  ')).toBe('alice');
  });

  it('accepts valid usernames only', () => {
    expect(isValidUsername('alice')).toBe(true);
    expect(isValidUsername('a')).toBe(false);
    expect(isValidUsername('a'.repeat(31))).toBe(false);
  });

  it('allows only the room owner to manage it', () => {
    const room = {
      id: 'room-1',
      name: 'Room',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    };

    expect(isRoomOwner(room, { id: 'owner-1' })).toBe(true);
    expect(isRoomOwner(room, { id: 'other' })).toBe(false);
  });

  it('allows owner or self to remove a player', () => {
    const room = {
      id: 'room-1',
      name: 'Room',
      timer: 30,
      timerEnd: 0,
      show: false,
      createdBy: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      autoRevealCards: false,
    };

    expect(canDeletePlayer(room, { id: 'owner-1' }, 'guest')).toBe(true);
    expect(canDeletePlayer(room, { id: 'guest' }, 'guest')).toBe(true);
    expect(canDeletePlayer(room, { id: 'guest' }, 'other')).toBe(false);
  });
});
