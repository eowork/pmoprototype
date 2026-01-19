import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  ParseUUIDPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GadService } from './gad.service';
import {
  CreateStudentParityDto, CreateFacultyParityDto, CreateStaffParityDto,
  CreatePwdParityDto, CreateIndigenousParityDto, ReviewParityDto,
  CreateGpbAccomplishmentDto, CreateBudgetPlanDto,
  QueryParityDto, QueryPlanningDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('GAD Parity')
@ApiBearerAuth('JWT-auth')
@Controller('gad')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Staff')
export class GadController {
  constructor(private readonly service: GadService) {}

  // --- Student Parity ---
  @Get('student-parity')
  findStudentParity(@Query() query: QueryParityDto) { return this.service.findStudentParity(query); }

  @Post('student-parity')
  @HttpCode(HttpStatus.CREATED)
  createStudentParity(@Body() dto: CreateStudentParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createStudentParity(dto, user.sub);
  }

  @Patch('student-parity/:id')
  updateStudentParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateStudentParityDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateStudentParity(id, dto, user.sub);
  }

  @Delete('student-parity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStudentParity(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeStudentParity(id); }

  @Patch('student-parity/:id/review')
  reviewStudentParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.reviewStudentParity(id, dto, user.sub);
  }

  // --- Faculty Parity ---
  @Get('faculty-parity')
  findFacultyParity(@Query() query: QueryParityDto) { return this.service.findFacultyParity(query); }

  @Post('faculty-parity')
  @HttpCode(HttpStatus.CREATED)
  createFacultyParity(@Body() dto: CreateFacultyParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createFacultyParity(dto, user.sub);
  }

  @Patch('faculty-parity/:id')
  updateFacultyParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateFacultyParityDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateFacultyParity(id, dto, user.sub);
  }

  @Delete('faculty-parity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFacultyParity(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeFacultyParity(id); }

  @Patch('faculty-parity/:id/review')
  reviewFacultyParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.reviewFacultyParity(id, dto, user.sub);
  }

  // --- Staff Parity ---
  @Get('staff-parity')
  findStaffParity(@Query() query: QueryParityDto) { return this.service.findStaffParity(query); }

  @Post('staff-parity')
  @HttpCode(HttpStatus.CREATED)
  createStaffParity(@Body() dto: CreateStaffParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createStaffParity(dto, user.sub);
  }

  @Patch('staff-parity/:id')
  updateStaffParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateStaffParityDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateStaffParity(id, dto, user.sub);
  }

  @Delete('staff-parity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeStaffParity(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeStaffParity(id); }

  @Patch('staff-parity/:id/review')
  reviewStaffParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.reviewStaffParity(id, dto, user.sub);
  }

  // --- PWD Parity ---
  @Get('pwd-parity')
  findPwdParity(@Query() query: QueryParityDto) { return this.service.findPwdParity(query); }

  @Post('pwd-parity')
  @HttpCode(HttpStatus.CREATED)
  createPwdParity(@Body() dto: CreatePwdParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createPwdParity(dto, user.sub);
  }

  @Patch('pwd-parity/:id')
  updatePwdParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreatePwdParityDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updatePwdParity(id, dto, user.sub);
  }

  @Delete('pwd-parity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePwdParity(@Param('id', ParseUUIDPipe) id: string) { return this.service.removePwdParity(id); }

  @Patch('pwd-parity/:id/review')
  reviewPwdParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.reviewPwdParity(id, dto, user.sub);
  }

  // --- Indigenous Parity ---
  @Get('indigenous-parity')
  findIndigenousParity(@Query() query: QueryParityDto) { return this.service.findIndigenousParity(query); }

  @Post('indigenous-parity')
  @HttpCode(HttpStatus.CREATED)
  createIndigenousParity(@Body() dto: CreateIndigenousParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.createIndigenousParity(dto, user.sub);
  }

  @Patch('indigenous-parity/:id')
  updateIndigenousParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateIndigenousParityDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateIndigenousParity(id, dto, user.sub);
  }

  @Delete('indigenous-parity/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeIndigenousParity(@Param('id', ParseUUIDPipe) id: string) { return this.service.removeIndigenousParity(id); }

  @Patch('indigenous-parity/:id/review')
  reviewIndigenousParity(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReviewParityDto, @CurrentUser() user: JwtPayload) {
    return this.service.reviewIndigenousParity(id, dto, user.sub);
  }

  // --- GPB Accomplishments ---
  @Get('gpb-accomplishments')
  findGpbAccomplishments(@Query() query: QueryPlanningDto) { return this.service.findGpbAccomplishments(query); }

  @Post('gpb-accomplishments')
  @HttpCode(HttpStatus.CREATED)
  createGpbAccomplishment(@Body() dto: CreateGpbAccomplishmentDto, @CurrentUser() user: JwtPayload) {
    return this.service.createGpbAccomplishment(dto, user.sub);
  }

  @Patch('gpb-accomplishments/:id')
  updateGpbAccomplishment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateGpbAccomplishmentDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateGpbAccomplishment(id, dto, user.sub);
  }

  // --- Budget Plans ---
  @Get('budget-plans')
  findBudgetPlans(@Query() query: QueryPlanningDto) { return this.service.findBudgetPlans(query); }

  @Post('budget-plans')
  @HttpCode(HttpStatus.CREATED)
  createBudgetPlan(@Body() dto: CreateBudgetPlanDto, @CurrentUser() user: JwtPayload) {
    return this.service.createBudgetPlan(dto, user.sub);
  }

  @Patch('budget-plans/:id')
  updateBudgetPlan(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreateBudgetPlanDto>, @CurrentUser() user: JwtPayload) {
    return this.service.updateBudgetPlan(id, dto, user.sub);
  }
}
