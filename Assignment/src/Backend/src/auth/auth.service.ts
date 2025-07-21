import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.validateCredentials({
      username,
      password: pass,
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username };
    return {
      username,
      access_token: await this.jwtService.signAsync(payload, {
        secret: 'secret',
        privateKey: process.env.JWT_SECRET,
      }),
    };
  }

  async signUp(user: User) {
    const newUser = await this.usersService.create(user);
    if (!newUser) {
      throw new InternalServerErrorException();
    }
    delete newUser.password;
    return newUser;
  }

  validateToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: 'secret',
    });
  }
}
