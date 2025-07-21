import { AuthService } from './auth.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: any = context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const { authorization } = request['headers'];
      if (!authorization) {
        throw new UnauthorizedException('Không có token');
      }
      const authToken = (authorization + '').replace(/bearer/gim, '').trim();
      const resp = await this.authService.validateToken(authToken);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.decodedData = resp;
      return true;
    } catch (error) {
      console.log('auth error - ', error);
    }
    return false;
  }
}
