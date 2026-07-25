import { Card } from '@/app/core/models';

export interface Player {
  id: string;
  username: string;
  fromMobile: boolean;
  card?: Card | null;
  room?: string;
}
