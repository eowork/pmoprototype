import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseUUIDPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RepairProjectsService } from './repair-projects.service';
import {
  CreateRepairProjectDto, UpdateRepairProjectDto, QueryRepairProjectDto,
  CreatePowItemDto, CreatePhaseDto, CreateTeamMemberDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('Repair Projects')
@ApiBearerAuth('JWT-auth')
@Controller('repair-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class RepairProjectsController {
  constructor(private readonly service: RepairProjectsService) {}

  @Get()
  findAll(@Query() query: QueryRepairProjectDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRepairProjectDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRepairProjectDto, @CurrentUser() user: JwtPayload) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- POW Items ---
  @Get(':id/pow-items')
  findPowItems(@Param('id', ParseUUIDPipe) id: string, @Query('category') category?: string, @Query('phase') phase?: string) {
    return this.service.findPowItems(id, category, phase);
  }

  @Post(':id/pow-items')
  @HttpCode(HttpStatus.CREATED)
  createPowItem(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreatePowItemDto, @CurrentUser() user: JwtPayload) {
    return this.service.createPowItem(id, dto, user.sub);
  }

  @Patch(':id/pow-items/:itemId')
  updatePowItem(@Param('id', ParseUUIDPipe) id: string, @Param('itemId', ParseUUIDPipe) itemId: string, @Body() dto: Partial<CreatePowItemDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updatePowItem(id, itemId, dto, user.sub);
  }

  @Delete(':id/pow-items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePowItem(@Param('id', ParseUUIDPipe) id: string, @Param('itemId', ParseUUIDPipe) itemId: string, @CurrentUser() user: JwtPayload) {
    return this.service.removePowItem(id, itemId, user.sub);
  }

  // --- Phases ---
  @Get(':id/phases')
  findPhases(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findPhases(id);
  }

  @Post(':id/phases')
  @HttpCode(HttpStatus.CREATED)
  createPhase(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreatePhaseDto) {
    return this.service.createPhase(id, dto);
  }

  @Patch(':id/phases/:phaseId')
  updatePhase(@Param('id', ParseUUIDPipe) id: string, @Param('phaseId', ParseUUIDPipe) phaseId: string, @Body() dto: Partial<CreatePhaseDto>) {
    return this.service.updatePhase(id, phaseId, dto);
  }

  // --- Team Members ---
  @Get(':id/team-members')
  findTeamMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findTeamMembers(id);
  }

  @Post(':id/team-members')
  @HttpCode(HttpStatus.CREATED)
  createTeamMember(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateTeamMemberDto) {
    return this.service.createTeamMember(id, dto);
  }

  @Delete(':id/team-members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTeamMember(@Param('id', ParseUUIDPipe) id: string, @Param('memberId', ParseUUIDPipe) memberId: string) {
    return this.service.removeTeamMember(id, memberId);
  }
}
