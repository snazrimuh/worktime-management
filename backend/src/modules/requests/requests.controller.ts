import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  create(@Req() req: any, @Body() dto: CreateRequestDto) {
    return this.requestsService.create(req.user.sub, dto);
  }

  @Get('my')
  @Roles('ADMIN', 'MANAGER', 'EMPLOYEE')
  getMyRequests(@Req() req: any) {
    return this.requestsService.getMyRequests(req.user.sub);
  }

  @Get('pending')
  @Roles('ADMIN', 'MANAGER')
  getPending() {
    return this.requestsService.findAllPending();
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.requestsService.updateStatus(id, req.user.sub, 'APPROVED');
  }

  @Patch(':id/reject')
  @Roles('ADMIN', 'MANAGER')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.requestsService.updateStatus(id, req.user.sub, 'REJECTED');
  }
}
