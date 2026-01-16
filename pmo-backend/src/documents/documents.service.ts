import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { UploadsService } from '../uploads/uploads.service';
import { CreateDocumentDto, UpdateDocumentDto, QueryDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'document_type', 'file_name'];
  private readonly ALLOWED_ENTITY_TYPES = [
    'project',
    'construction_project',
    'repair_project',
    'university_operation',
  ];

  constructor(
    private readonly db: DatabaseService,
    private readonly uploadsService: UploadsService,
  ) {}

  private validateEntityType(entityType: string): void {
    if (!this.ALLOWED_ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException(
        `Invalid entity type: ${entityType}. Allowed: ${this.ALLOWED_ENTITY_TYPES.join(', ')}`,
      );
    }
  }

  async findAllForEntity(
    entityType: string,
    entityId: string,
    query: QueryDocumentDto,
  ): Promise<PaginatedResponse<any>> {
    this.validateEntityType(entityType);

    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = [
      'deleted_at IS NULL',
      'documentable_type = $1',
      'documentable_id = $2',
    ];
    const params: any[] = [entityType, entityId];
    let paramIndex = 3;

    if (query.document_type) {
      conditions.push(`document_type = $${paramIndex++}`);
      params.push(query.document_type);
    }
    if (query.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(query.category);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM documents WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, documentable_type, documentable_id, document_type, file_name,
              file_path, file_size, mime_type, description, category, created_at, updated_at
       FROM documents
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM documents WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(
    entityType: string,
    entityId: string,
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    userId: string,
  ): Promise<any> {
    this.validateEntityType(entityType);

    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Upload file using uploads service
    const uploadResult = await this.uploadsService.uploadFile(
      file,
      userId,
      entityType,
      entityId,
    );

    const result = await this.db.query(
      `INSERT INTO documents
       (documentable_type, documentable_id, document_type, file_name, file_path, file_size, mime_type, description, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        entityType,
        entityId,
        dto.document_type,
        uploadResult.originalName,
        uploadResult.filePath,
        uploadResult.fileSize,
        uploadResult.mimeType,
        dto.description || null,
        dto.category || null,
        userId,
      ],
    );

    this.logger.log(
      `DOCUMENT_CREATED: id=${result.rows[0].id}, entity=${entityType}/${entityId}, by=${userId}`,
    );
    return result.rows[0];
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string): Promise<any> {
    await this.findOne(id);

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);

    const result = await this.db.query(
      `UPDATE documents
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`DOCUMENT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.findOne(id);

    // Delete the file from storage
    if (doc.file_path) {
      await this.uploadsService.deleteFile(doc.file_path);
    }

    await this.db.query(
      `UPDATE documents SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`DOCUMENT_DELETED: id=${id}, by=${userId}`);
  }
}
