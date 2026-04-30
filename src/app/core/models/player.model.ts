import { Card } from '@/app/core/models';

export interface Player {
  id: string;
  username: string;
  card?: Card;
  room?: string;
}
