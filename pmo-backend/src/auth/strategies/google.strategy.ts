import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  avatar: string | null;
  domain: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);
  private readonly allowedDomains: string[];

  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });

    const domains = configService.get<string>('GOOGLE_ALLOWED_DOMAINS', '');
    this.allowedDomains = domains.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const emailVerified = profile.emails?.[0]?.verified;

    if (!email) {
      this.logger.warn(`GOOGLE_SSO_REJECTED: reason=NO_EMAIL`);
      return done(new ForbiddenException('GOOGLE_NO_EMAIL'), null);
    }

    if (!emailVerified) {
      this.logger.warn(`GOOGLE_SSO_REJECTED: email=${email}, reason=EMAIL_NOT_VERIFIED`);
      return done(new ForbiddenException('GOOGLE_EMAIL_NOT_VERIFIED'), null);
    }

    const domain = email.split('@')[1]?.toLowerCase();

    if (this.allowedDomains.length > 0 && !this.allowedDomains.includes(domain)) {
      this.logger.warn(`GOOGLE_SSO_REJECTED: email=${email}, domain=${domain}, reason=DOMAIN_NOT_ALLOWED`);
      return done(
        new ForbiddenException('GOOGLE_DOMAIN_NOT_ALLOWED'),
        null,
      );
    }

    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: email.toLowerCase(),
      emailVerified: true,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      avatar: profile.photos?.[0]?.value || null,
      domain,
    };

    this.logger.log(`GOOGLE_SSO_VALIDATED: email=${email}, domain=${domain}`);
    done(null, googleProfile);
  }
}
