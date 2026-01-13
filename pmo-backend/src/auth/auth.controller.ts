import { Controller, Post, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService, UserProfile } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute per IP
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req: { user: UserProfile }) {
    return req.user;
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // Guard redirects to Google
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Request() req: { user: GoogleProfile },
    @Res() res: Response,
  ) {
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${result.access_token}`);
  }
}
