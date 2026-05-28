import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('activity-logs')
@Controller('activity-logs')
@UseGuards(RolesGuard)
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Get()
  @Roles('SuperAdmin', 'Admin', 'Auditor')
  @ApiOperation({ summary: 'List activity logs (paginated)' })
  async list(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findLogs({
      entityType,
      entityId,
      userId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':entityType/:entityId')
  @Roles('SuperAdmin', 'Admin', 'Auditor', 'Staff')
  @ApiOperation({ summary: 'List activity logs scoped to a single entity' })
  async listForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findLogs({
      entityType,
      entityId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }
}
