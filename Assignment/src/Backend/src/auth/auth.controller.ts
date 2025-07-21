import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  signUp(@Body() signInDto: User) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.signUp(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: Record<string, any>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
