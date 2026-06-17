import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

/**
 * PHASE BBBD (Track 4, R-327): turn a failed OAuth callback (e.g. a non-@carsu.edu.ph account
 * rejected by GoogleStrategy) into a redirect to a branded frontend page instead of a raw 401 JSON.
 * Security is unchanged — the account is still rejected; only the presentation differs.
 * Scoped to the google/callback route via @UseFilters.
 */
@Catch(UnauthorizedException)
export class OAuthFailureFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(_exception: UnauthorizedException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    res.redirect(`${frontendUrl}/auth/restricted`);
  }
}
