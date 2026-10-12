import { RoomState } from './room-state';

describe('RoomState', () => {
  it('stores players and auto reveals when all cards are set', () => {
    const state = new RoomState();

    const players = [
      { id: 'p1', username: 'Alice', fromMobile: false, card: { value: '3', label: 'Medium' } },
      { id: 'p2', username: 'Bob', fromMobile: true, card: { value: '5', label: 'Large' } },
    ];

    state.setPlayers(players);
    state.autoRevealIfNeeded(
      {
        id: 'room-1',
        name: 'Test room',
        timer: 30,
        timerEnd: 0,
        show: false,
        createdBy: 'p1',
        createdAt: new Date(),
        updatedAt: new Date(),
        autoRevealCards: true,
      },
      players,
    );

    expect(state.players().length).toBe(2);
    expect(state.showCards()).toBe(true);
    expect(state.timerEnd()).toBe(0);
  });
});
