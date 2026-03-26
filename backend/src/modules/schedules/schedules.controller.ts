import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll() {
    return this.schedulesService.findAll();
  }

  @Get('my/today')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  async getMyToday(@Req() req: any) {
    return this.schedulesService.findTodayForUser(req.user.sub || req.user.id);
  }

  @Get('my/active')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  async getMyActive(@Req() req: any) {
    return this.schedulesService.findTodayForUser(req.user.sub || req.user.id);
  }

  @Get(':id')
  @Roles('ADMIN', 'MANAGER')
  findOne(@Param('id') id: string) {
    return this.schedulesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(id);
  }
}
