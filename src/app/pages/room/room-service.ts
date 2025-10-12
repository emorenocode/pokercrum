import { Injectable } from '@angular/core';
import { map, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  createRoom() {
    const newRoom = new Date().getTime();
    return timer(1000).pipe(map(() => newRoom));
  }
}
