import { Module } from '@nestjs/common';
import { ScheduleAssignmentsService } from './assignments.service';
import { ScheduleAssignmentsController } from './assignments.controller';

@Module({
  controllers: [ScheduleAssignmentsController],
  providers: [ScheduleAssignmentsService],
  exports: [ScheduleAssignmentsService],
})
export class ScheduleAssignmentsModule {}
