import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ScheduleAssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleAssignmentsController {
  constructor(private readonly assignmentsService: ScheduleAssignmentsService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get('user/:userId')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  findActive(@Param('userId') userId: string, @Query('at') at?: string) {
    const date = at ? new Date(at) : new Date();
    return this.assignmentsService.findActiveForUser(userId, date);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.assignmentsService.remove(id);
  }
}
