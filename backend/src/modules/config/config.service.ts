import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalConfig() {
    let config = await this.prisma.systemConfig.findUnique({
      where: { id: 'global' },
    });
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: { id: 'global', gracePeriodMinutes: 15, noShowThresholdMins: 60 },
      });
    }
    return config;
  }

  async updateGlobalConfig(dto: { gracePeriodMinutes?: number; noShowThresholdMins?: number }) {
    return this.prisma.systemConfig.upsert({
      where: { id: 'global' },
      update: dto,
      create: { id: 'global', ...dto },
    });
  }
}
