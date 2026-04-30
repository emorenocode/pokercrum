import { Player } from '@/app/core/models';

export interface Room {
  id: string;
  name: string;
  timer: number;
  timerEnd: number;
  show: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  players: Player[];
}
