import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { EntityManager } from '@mikro-orm/core';
import { User, Role, UserRole } from '../../database/entities';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

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

    // Look up user by google_id OR email
    const result = await this.em.getConnection().execute(
      `SELECT id, email, is_active, google_id
       FROM users
       WHERE (google_id = ? OR LOWER(email) = LOWER(?))
         AND deleted_at IS NULL
       LIMIT 1`,
      [profile.id, email],
    );

    if (result.length === 0) {
      // ZC-A: Auto-create account for first-time Google OAuth login.
      // OAuth-verified accounts activate immediately — no admin approval gate.
      const displayName = profile.displayName || email.split('@')[0];
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const newUser = this.em.create(User, {
        email,
        username: email,
        googleId: profile.id,
        firstName,
        lastName,
        avatarUrl: profile.photos?.[0]?.value ?? undefined,
        isActive: true,
        status: 'ACTIVE',
        passwordHash: '',
        metadata: { registrationSource: 'google-oauth', registeredAt: new Date().toISOString() },
      });
      try {
        await this.em.persistAndFlush(newUser);
        // ZH-A: Assign default 'Staff' role — failure is non-blocking.
        try {
          const staffRole = await this.em.findOne(Role, { name: 'Staff' });
          if (staffRole) {
            const userRole = this.em.create(UserRole, {
              userId: newUser.id,
              roleId: staffRole.id,
              isSuperadmin: false,
              assignedBy: null,
            });
            await this.em.persistAndFlush(userRole);
            this.logger.log(`GOOGLE_STAFF_ROLE_ASSIGNED: user_id=${newUser.id}`);
          }
        } catch (roleErr: any) {
          this.logger.warn(`GOOGLE_STAFF_ROLE_FAILED: user_id=${newUser.id}, error=${roleErr?.message}`);
        }
      } catch (err: any) {
        if (err?.code === '23505') {
          // Race condition: email registered between lookup and insert — fetch and continue
          const existing = await this.em.getConnection().execute(
            `SELECT id, email, is_active, google_id FROM users WHERE LOWER(email) = LOWER(?) AND deleted_at IS NULL LIMIT 1`,
            [email],
          );
          if (existing.length > 0) return done(null, existing[0]);
        }
        return done(err as Error, false);
      }
      this.logger.log(`GOOGLE_AUTO_CREATED: user_id=${newUser.id}, email=${email}`);
      return done(null, { id: newUser.id, email: newUser.email, is_active: true, google_id: newUser.googleId });
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
