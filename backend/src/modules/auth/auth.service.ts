import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AppRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async validateUserFromSSO(email: string, hubUserId: string, hubRole: string) {
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.log(`Performing JIT Provisioning for email: ${email}`);

      const defaultRole: AppRole = hubRole === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

      user = await this.prisma.user.create({
        data: {
          id: hubUserId,
          email,
          name: email.split('@')[0],
          password: 'SSO_MANAGED_PASSWORD',
          role: defaultRole,
        } as any,
      });
    } else {
      this.logger.log(
        `SSO Login for existing user: ${email} (Local Role: ${user.role})`,
      );
    }

    return this.sanitizeUser(user);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'EMPLOYEE',
      } as any,
    });

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      ((user as any).role ?? 'EMPLOYEE') as AppRole,
      user.isSystemAdmin,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      ((user as any).role ?? 'EMPLOYEE') as AppRole,
      user.isSystemAdmin,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException('Access denied');

    const tokens = await this.generateTokens(
      user.id,
      user.email,
      ((user as any).role ?? 'EMPLOYEE') as AppRole,
      user.isSystemAdmin,
    );
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If an account exists, a reset link has been sent' };

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'reset' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );

    this.logger.log(`Reset token for ${email}: ${token}`);
    return { message: 'If an account exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; type: string }>(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid reset token');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password: hashedPassword, refreshToken: null },
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: AppRole,
    isSystemAdmin: boolean,
  ) {
    const payload = { sub: userId, email, role, isSystemAdmin };

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hash } });
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }
}
