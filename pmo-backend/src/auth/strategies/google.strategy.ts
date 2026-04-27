import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(
        new UnauthorizedException('No email in Google profile'),
        false,
      );
    }

    // Domain restriction (Directive 201)
    const allowedDomains = this.configService.get<string>(
      'GOOGLE_ALLOWED_DOMAINS',
      '',
    );
    if (allowedDomains) {
      const domains = allowedDomains.split(',').map((d) => d.trim());
      const emailDomain = email.split('@')[1];
      if (!domains.includes(emailDomain)) {
        return done(
          new UnauthorizedException(
            'Email domain not permitted for this system',
          ),
          false,
        );
      }
    }

    // Look up user by google_id OR email (Directive 202 — no self-registration)
    const result = await this.em.getConnection().execute(
      `SELECT id, email, is_active, google_id
       FROM users
       WHERE (google_id = ? OR LOWER(email) = LOWER(?))
         AND deleted_at IS NULL
       LIMIT 1`,
      [profile.id, email],
    );

    if (result.length === 0) {
      return done(
        new UnauthorizedException(
          'No account found. Contact your administrator.',
        ),
        false,
      );
    }

    const user = result[0];

    if (!user.is_active) {
      return done(
        new UnauthorizedException(
          'Account is inactive. Contact your administrator.',
        ),
        false,
      );
    }

    // Link google_id if not yet linked (Directive 203)
    if (!user.google_id) {
      await this.em.getConnection().execute(
        `UPDATE users SET google_id = ?, updated_at = NOW() WHERE id = ?`,
        [profile.id, user.id],
      );
    }

    return done(null, user);
  }
}
