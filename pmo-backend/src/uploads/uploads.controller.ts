import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { JwtPayload } from '../common/interfaces';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dto';

@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Upload a file
   * POST /api/uploads
   */
  @Post()
  @Roles('Admin', 'Staff')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB - also enforced in service
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<UploadResponseDto> {
    return this.uploadsService.uploadFile(file, user.sub);
  }
}
