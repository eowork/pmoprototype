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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  AssignUserDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('Reference: Departments')
@ApiBearerAuth('JWT-auth')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  @Roles('Admin', 'Staff')
  findAll(@Query() query: QueryDepartmentDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles('Admin', 'Staff')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateDepartmentDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- User Assignment ---
  @Get(':id/users')
  @Roles('Admin', 'Staff')
  findUsers(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findUsers(id);
  }

  @Post(':id/users')
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  assignUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.assignUser(id, dto, user.sub);
  }

  @Delete(':id/users/:uid')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('uid', ParseUUIDPipe) uid: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeUser(id, uid, user.sub);
  }
}
