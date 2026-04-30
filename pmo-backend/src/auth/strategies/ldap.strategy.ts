import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy = require('passport-ldapauth');
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../database/entities';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  private readonly logger = new Logger(LdapStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {
    super({
      server: {
        url: configService.get<string>('LDAP_URL', ''),
        bindDN: configService.get<string>('LDAP_BIND_DN', ''),
        bindCredentials: configService.get<string>('LDAP_BIND_PASSWORD', ''),
        searchBase: configService.get<string>('LDAP_SEARCH_BASE', ''),
        searchFilter: configService.get<string>(
          'LDAP_SEARCH_FILTER',
          '(mail={{username}})',
        ),
        tlsOptions: {
          rejectUnauthorized:
            configService.get<string>(
              'LDAP_TLS_REJECT_UNAUTHORIZED',
              'true',
            ) === 'true',
        },
      },
    });
  }

  async validate(ldapUser: any): Promise<any> {
    const email: string | undefined =
      ldapUser.mail || ldapUser.userPrincipalName;

    if (!email) {
      this.logger.warn('LDAP_LOGIN_FAILURE: reason=NO_EMAIL_ATTRIBUTE');
      throw new UnauthorizedException('No email attribute in LDAP profile');
    }

    const user = await this.em.findOne(
      User,
      { email: { $ilike: email } },
      { filters: false },
    );

    if (!user || user.deletedAt) {
      this.logger.warn(
        `LDAP_LOGIN_FAILURE: email=${email}, reason=NO_LOCAL_ACCOUNT`,
      );
      throw new UnauthorizedException(
        'No account found. Contact your administrator.',
      );
    }

    if (!user.isActive) {
      this.logger.warn(
        `LDAP_LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_INACTIVE`,
      );
      throw new UnauthorizedException(
        'Account is inactive. Contact your administrator.',
      );
    }

    this.logger.log(`LDAP_VALIDATE_SUCCESS: user_id=${user.id}`);
    return { id: user.id, email: user.email, is_active: user.isActive };
  }
}
