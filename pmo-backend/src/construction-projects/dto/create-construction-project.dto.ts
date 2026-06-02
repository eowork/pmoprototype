import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, Campus } from '../../common/enums';
import { AssignmentMetadataDto } from './assignment-metadata.dto';

export class CreateConstructionProjectDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsString()
  @IsNotEmpty()
  project_code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ideal_infrastructure_image?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  beneficiaries?: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  facilities?: string;

  @IsOptional()
  @IsArray()
  objectives?: string[];

  @IsOptional()
  @IsArray()
  key_features?: string[];

  @IsOptional()
  @IsString()
  original_contract_duration?: string;

  @IsOptional()
  @IsString()
  contract_number?: string;

  @IsOptional()
  @IsUUID()
  contractor_id?: string;

  @IsOptional()
  @IsString()
  contractor?: string;

  @IsOptional()
  @IsNumber()
  contract_amount?: number;

  @IsOptional()
  @IsNumber()
  cost_amount?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  target_completion_date?: string;

  @IsOptional()
  @IsDateString()
  actual_completion_date?: string;

  @IsOptional()
  @IsString()
  project_duration?: string;

  @IsOptional()
  @IsString()
  project_engineer?: string;

  @IsOptional()
  @IsString()
  project_manager?: string;

  @IsOptional()
  @IsString()
  building_type?: string;

  @IsOptional()
  @IsNumber()
  floor_area?: number;

  @IsOptional()
  @IsNumber()
  number_of_floors?: number;

  @IsUUID()
  @IsNotEmpty()
  funding_source_id: string;

  @IsOptional()
  @IsUUID()
  subcategory_id?: string;

  @IsEnum(Campus)
  @IsNotEmpty()
  campus: Campus;

  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  target_physical_progress?: number;

  @IsOptional()
  @IsNumber()
  target_financial_progress?: number;

  @IsOptional()
  @IsNumber()
  physical_progress?: number;

  @IsOptional()
  @IsNumber()
  financial_progress?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  // Phase AN: Inline assignment during creation (DEPRECATED - use assigned_user_ids)
  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  // Phase AT: Multi-select assignment
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigned_user_ids?: string[];

  // Phase JW-E: Per-assignment metadata. When provided, overrides assigned_user_ids.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentMetadataDto)
  assignments?: AssignmentMetadataDto[];

  // KC-C: Project Profile fields
  @IsOptional()
  @IsString()
  strategic_alignment?: string;

  @IsOptional()
  @IsArray()
  output_indicators?: string[];

  @IsOptional()
  @IsArray()
  outcome_indicators?: string[];

  @IsOptional()
  @IsString()
  implementing_agency?: string;

  @IsOptional()
  @IsEnum(['NEW', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'CANCELLED'])
  project_status_category?: string;

  @IsOptional()
  @IsArray()
  status_updates?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  readiness_documents?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  signatories?: Record<string, any>[];

  // KX-B1: Project monitoring log fields
  @IsOptional()
  @IsArray()
  incident_log?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  risk_register?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  escalation_records?: Record<string, any>[];

  // MC: Location
  @IsOptional()
  @IsString()
  spatial_coverage?: string;

  @IsOptional()
  @IsString()
  municipality?: string;

  @IsOptional()
  @IsString()
  province?: string;

  // MC: Implementation Agencies
  @IsOptional()
  @IsString()
  co_implementing_agency?: string;

  @IsOptional()
  @IsString()
  attached_agency?: string;

  // MC: Revision Orders
  @IsOptional()
  @IsDateString()
  original_start_date?: string;

  @IsOptional()
  @IsDateString()
  revised_start_date?: string;

  @IsOptional()
  @IsDateString()
  original_completion_date?: string;

  @IsOptional()
  @IsDateString()
  revised_completion_date?: string;

  @IsOptional()
  @IsString()
  revised_project_duration?: string;

  // MC: Progress Monitoring
  @IsOptional()
  @IsDateString()
  as_of_date?: string;

  @IsOptional()
  @IsNumber()
  cost_incurred_to_date?: number;

  // MC: Strategic Alignment
  @IsOptional()
  @IsArray()
  rdp_alignment?: string[];

  @IsOptional()
  @IsArray()
  socioeconomic_agenda?: string[];

  @IsOptional()
  @IsArray()
  csu_likha_goals?: string[];

  // QQQ: UN Sustainable Development Goals
  @IsOptional()
  @IsArray()
  sdg_goals?: string[];

  // MC: Beneficiaries dynamic list
  @IsOptional()
  @IsArray()
  beneficiary_list?: string[];

  // MC: Hybrid Funding
  @IsOptional()
  @IsString()
  funding_source_type?: string;

  @IsOptional()
  @IsArray()
  additional_funding_sources?: Record<string, any>[];

  // MC: Remarks Log
  @IsOptional()
  @IsArray()
  remarks_log?: Record<string, any>[];

  // MC: Personnel Groups
  @IsOptional()
  personnel_groups?: Record<string, any>;
}
