import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { Public, CurrentUser } from './decorators';
import { JwtAuthGuard } from './guards';
import { JwtPayload } from '../common/interfaces';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email/username and password' })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token and user info' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset (public)', description: 'Creates a pending reset request for admin review' })
  @ApiResponse({ status: 200, description: 'Request submitted (always returns success for security)' })
  async requestPasswordReset(@Body() body: { identifier: string; notes?: string }) {
    return this.authService.createPasswordResetRequest(body.identifier, body.notes);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout', description: 'Logs out the user (audit trail only, JWT remains valid)' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async logout(@CurrentUser() user: JwtPayload) {
    await this.authService.logout(user.sub);
  }

  // Phase HT: Google OAuth routes (Directives 204–206)
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login', description: 'Redirects to Google consent screen' })
  async googleLogin() {
    // Passport handles redirect to Google OAuth — no body needed
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Handles Google OAuth response and redirects to frontend' })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const { access_token } = await this.authService.loginWithGoogleUser(req.user.id);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(access_token)}`);
  }
}
