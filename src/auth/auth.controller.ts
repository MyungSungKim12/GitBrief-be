import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/callback')
  callback(@Query('code') code: string) {
    return this.authService.exchangeCodeForToken(code);
  }
}
