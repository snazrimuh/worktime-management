import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as Ably from 'ably';

@Injectable()
export class NotificationsService {
  private readonly ably: Ably.Realtime | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('ABLY_API_KEY');
    if (key) {
      this.ably = new Ably.Realtime(key);
    }
  }

  async create(userId: string, title: string, message: string, type: string = 'INFO') {
    const notification = await this.prisma.notification.create({
      data: { userId, title, message, type },
    });

    if (this.ably) {
      const channel = this.ably.channels.get(`user-${userId}`);
      channel.publish('notification', notification);
    }

    return notification;
  }

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
