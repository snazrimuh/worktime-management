import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  checkIn(@Req() req: any) {
    return this.attendanceService.checkIn(req.user.sub);
  }

  @Post('check-out')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  checkOut(@Req() req: any) {
    return this.attendanceService.checkOut(req.user.sub);
  }

  @Get('today')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  getToday(@Req() req: any) {
    return this.attendanceService.getTodayRecord(req.user.sub);
  }

  @Get('my')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  getMyLogs(@Req() req: any, @Query('limit') limit?: number, @Query('month') month?: string) {
    return this.attendanceService.getMyLogs(req.user.sub, limit, month);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  getAllLogs(@Query('date') date?: string, @Query('userId') userId?: string) {
    return this.attendanceService.getAllLogs({ date, userId });
  }

  @Patch(':id/adjust')
  @Roles('ADMIN', 'MANAGER')
  adjust(@Param('id') id: string, @Body() body: any) {
    return this.attendanceService.adjust(id, body);
  }
}
