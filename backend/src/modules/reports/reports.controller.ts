import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance')
  @Roles('ADMIN', 'MANAGER')
  getAttendance(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('month') month?: string,
    @Query('userId') userId?: string,
  ) {
    return this.reportsService.getAttendanceSummary({ from, to, month, userId });
  }
}
