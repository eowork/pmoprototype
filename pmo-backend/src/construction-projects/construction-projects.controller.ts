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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConstructionProjectsService } from './construction-projects.service';
import {
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  CreateMilestoneDto,
  CreateConstructionFinancialDto,
  CreateGalleryDto,
  QueryGalleryDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';

@ApiTags('Construction Projects')
@ApiBearerAuth('JWT-auth')
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

  // --- Gallery ---
  @Get(':id/gallery')
  findGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryGalleryDto,
  ) {
    return this.service.findGallery(id, query);
  }

  @Get(':id/gallery/:galleryId')
  findGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
  ) {
    return this.service.findGalleryItem(id, galleryId);
  }

  @Post(':id/gallery')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  createGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateGalleryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createGalleryItem(id, file, dto, user.sub);
  }

  @Patch(':id/gallery/:galleryId')
  updateGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @Body() dto: Partial<CreateGalleryDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateGalleryItem(id, galleryId, dto, user.sub);
  }

  @Delete(':id/gallery/:galleryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeGalleryItem(id, galleryId, user.sub);
  }
}
