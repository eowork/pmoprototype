import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ConstructionProjectsService } from './construction-projects.service';
import {
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  CreateMilestoneDto,
  CreateConstructionFinancialDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@Controller('construction-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class ConstructionProjectsController {
  constructor(private readonly service: ConstructionProjectsService) {}

  @Get()
  findAll(@Query() query: QueryConstructionProjectDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateConstructionProjectDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConstructionProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- Milestones ---
  @Get(':id/milestones')
  findMilestones(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findMilestones(id);
  }

  @Post(':id/milestones')
  @HttpCode(HttpStatus.CREATED)
  createMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.service.createMilestone(id, dto);
  }

  @Patch(':id/milestones/:milestoneId')
  updateMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @Body() dto: Partial<CreateMilestoneDto>,
  ) {
    return this.service.updateMilestone(id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.service.removeMilestone(id, milestoneId);
  }

  // --- Financials ---
  @Get(':id/financials')
  findFinancials(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fiscal_year') fiscalYear?: number,
  ) {
    return this.service.findFinancials(id, fiscalYear);
  }

  @Post(':id/financials')
  @HttpCode(HttpStatus.CREATED)
  createFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateConstructionFinancialDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createFinancial(id, dto, user.sub);
  }

  @Patch(':id/financials/:financialId')
  updateFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @Body() dto: Partial<CreateConstructionFinancialDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateFinancial(id, financialId, dto, user.sub);
  }

  @Delete(':id/financials/:financialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeFinancial(id, financialId, user.sub);
  }
}
