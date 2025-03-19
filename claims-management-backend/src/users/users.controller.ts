import { Controller, Post, Body, Get, UseGuards, Request, Logger } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() userData: { name: string; email: string; password: string }) {
    this.logger.log(`Signup attempt for email: ${userData.email}`);
    try {
      const result = await this.usersService.signup(userData);
      this.logger.log(`Signup successful for email: ${userData.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Signup failed for email: ${userData.email}`, error);
      throw error;
    }
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    return this.usersService.login(loginData.email, loginData.password);
  }
} 