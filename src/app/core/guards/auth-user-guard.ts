import { AuthService } from '@/app/core/services/auth-service';
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { map, Observable } from 'rxjs';

export const authUserGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  return authService.login().pipe(
    map((user) => {
      return !!user;
    }),
  );
};
