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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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
export class ConstructionProjectsController {
  constructor(private readonly service: ConstructionProjectsService) {}

  // --- Read Operations: All authenticated roles can view ---

  @Get()
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'List all construction projects (non-Admin only see PUBLISHED)' })
  findAll(@Query() query: QueryConstructionProjectDto, @CurrentUser() user: JwtPayload) {
    return this.service.findAll(query, user);
  }

  @Get('pending-review')
  @Roles('Admin')
  @ApiOperation({ summary: 'List drafts pending review (Admin only)' })
  findPendingReview(@CurrentUser() user: JwtPayload) {
    return this.service.findPendingReview(user);
  }

  @Get('my-drafts')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'List current user drafts' })
  findMyDrafts(@CurrentUser() user: JwtPayload) {
    return this.service.findMyDrafts(user.sub);
  }

  @Get(':id')
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'Get construction project details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  // --- Create/Update Operations: Admin and Staff ---

  @Post()
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create construction project (Admin=PUBLISHED, Staff=DRAFT)' })
  create(@Body() dto: CreateConstructionProjectDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub, user);
  }

  // --- Draft Governance Workflow ---

  @Post(':id/submit-for-review')
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit draft for admin review (owner only)' })
  submitForReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.submitForReview(id, user.sub);
  }

  @Post(':id/publish')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish (approve) a draft (Admin only)' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.publish(id, user.sub, user);
  }

  @Post(':id/reject')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a draft with notes (Admin only)' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.reject(id, user.sub, notes, user);
  }

  @Post(':id/withdraw')
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw pending submission (submitter only)' })
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.withdraw(id, user.sub);
  }

  @Patch(':id')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Update construction project (Admin/Staff)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConstructionProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.update(id, dto, user.sub, user);
  }

  // --- Delete Operations: Admin only ---

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete construction project (Admin only)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.service.remove(id, user.sub);
  }

  // --- Milestones ---

  @Get(':id/milestones')
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'List project milestones' })
  findMilestones(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findMilestones(id);
  }

  @Post(':id/milestones')
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create milestone (Admin/Staff)' })
  createMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.service.createMilestone(id, dto);
  }

  @Patch(':id/milestones/:milestoneId')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Update milestone (Admin/Staff)' })
  updateMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @Body() dto: Partial<CreateMilestoneDto>,
  ) {
    return this.service.updateMilestone(id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete milestone (Admin only)' })
  removeMilestone(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.service.removeMilestone(id, milestoneId);
  }

  // --- Financials ---

  @Get(':id/financials')
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'List project financials' })
  findFinancials(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fiscal_year') fiscalYear?: number,
  ) {
    return this.service.findFinancials(id, fiscalYear);
  }

  @Post(':id/financials')
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create financial record (Admin/Staff)' })
  createFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateConstructionFinancialDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createFinancial(id, dto, user.sub);
  }

  @Patch(':id/financials/:financialId')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Update financial record (Admin/Staff)' })
  updateFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @Body() dto: Partial<CreateConstructionFinancialDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateFinancial(id, financialId, dto, user.sub);
  }

  @Delete(':id/financials/:financialId')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete financial record (Admin only)' })
  removeFinancial(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('financialId', ParseUUIDPipe) financialId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeFinancial(id, financialId, user.sub);
  }

  // --- Gallery ---

  @Get(':id/gallery')
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'List project gallery items' })
  findGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: QueryGalleryDto,
  ) {
    return this.service.findGallery(id, query);
  }

  @Get(':id/gallery/:galleryId')
  @Roles('Admin', 'Staff', 'Viewer')
  @ApiOperation({ summary: 'Get gallery item details' })
  findGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
  ) {
    return this.service.findGalleryItem(id, galleryId);
  }

  @Post(':id/gallery')
  @Roles('Admin', 'Staff')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload gallery item (Admin/Staff)' })
  createGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateGalleryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createGalleryItem(id, file, dto, user.sub);
  }

  @Patch(':id/gallery/:galleryId')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Update gallery item (Admin/Staff)' })
  updateGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @Body() dto: Partial<CreateGalleryDto>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateGalleryItem(id, galleryId, dto, user.sub);
  }

  @Delete(':id/gallery/:galleryId')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete gallery item (Admin only)' })
  removeGalleryItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('galleryId', ParseUUIDPipe) galleryId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.removeGalleryItem(id, galleryId, user.sub);
  }
}
