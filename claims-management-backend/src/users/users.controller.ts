import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() userData: { name: string; email: string; password: string }) {
    return this.usersService.signup(userData);
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.usersService.login(loginData.email, loginData.password);
  }
} 