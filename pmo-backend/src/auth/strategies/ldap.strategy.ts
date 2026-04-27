import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy = require('passport-ldapauth');
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  private readonly logger = new Logger(LdapStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly db: DatabaseService,
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
    // LDAP email attribute (OpenLDAP uses 'mail'; Active Directory uses 'userPrincipalName')
    const email: string | undefined =
      ldapUser.mail || ldapUser.userPrincipalName;

    if (!email) {
      this.logger.warn('LDAP_LOGIN_FAILURE: reason=NO_EMAIL_ATTRIBUTE');
      throw new UnauthorizedException('No email attribute in LDAP profile');
    }

    // Lookup by email — no self-registration (matches Directive 202)
    const result = await this.db.query(
      `SELECT id, email, is_active
       FROM users
       WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
       LIMIT 1`,
      [email],
    );

    if (result.rows.length === 0) {
      this.logger.warn(
        `LDAP_LOGIN_FAILURE: email=${email}, reason=NO_LOCAL_ACCOUNT`,
      );
      throw new UnauthorizedException(
        'No account found. Contact your administrator.',
      );
    }

    const user = result.rows[0];

    if (!user.is_active) {
      this.logger.warn(
        `LDAP_LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_INACTIVE`,
      );
      throw new UnauthorizedException(
        'Account is inactive. Contact your administrator.',
      );
    }

    this.logger.log(`LDAP_VALIDATE_SUCCESS: user_id=${user.id}`);
    return user;
  }
}
