import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'EMPLOYEE';
  isSystemAdmin?: boolean;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const authHeader: string = req.get('authorization') || '';
    const refreshToken = authHeader.replace('Bearer', '').trim();

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isSystemAdmin: payload.isSystemAdmin || false,
      refreshToken,
    };
  }
}
