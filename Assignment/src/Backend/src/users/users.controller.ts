import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return [];
  }
}
