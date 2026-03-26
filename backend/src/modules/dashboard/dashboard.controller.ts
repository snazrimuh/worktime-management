import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  getSummary(@Req() req: any) {
    const userRole = req.user.role;
    if (userRole === 'ADMIN' || userRole === 'MANAGER' || req.user.isSystemAdmin) {
      return this.dashboardService.getSummary();
    }
    return this.dashboardService.getPersonalSummary(req.user.sub || req.user.id);
  }
}
