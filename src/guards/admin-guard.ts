import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (request.user.isAdmin !== true) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
