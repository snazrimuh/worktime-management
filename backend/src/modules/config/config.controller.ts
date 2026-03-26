import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigController {
  constructor(private readonly configService: SystemConfigService) {}

  @Get()
  @Roles('ADMIN', 'MANAGER')
  getConfig() {
    return this.configService.getGlobalConfig();
  }

  @Patch()
  @Roles('ADMIN')
  updateConfig(@Body() body: { gracePeriodMinutes?: number; noShowThresholdMins?: number }) {
    return this.configService.updateGlobalConfig(body);
  }
}
