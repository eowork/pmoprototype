# University Operations Database Schema Enhancements

## Overview
The database schema has been enhanced to fully support all university operations subcategories and their quarterly assessment data structures as implemented in the admin interface.

## Subcategories Supported

### Indicator Counts (Based on BAR 1 for SUC - State Universities and Colleges)
Each subcategory has **3 static outcome indicators** as per BAR 1 requirements:

1. **Higher Education Program** - 3 indicators (Tertiary education outcomes)
2. **Advanced Education Program** - 3 indicators (Graduate-level education and research)
   - graduate-faculty-research
   - graduate-students-research
   - accredited-graduate-programs
3. **Research Program** - 3 indicators (Research outputs, publications, patents)
   - res_001: Research outputs utilized by industry/beneficiaries
   - res_002: Research outputs completed
   - res_003: Research outputs in refereed journals
4. **Technical Advisory Extension Program** - 3 indicators (Community engagement)
   - ext_001: Trainees weighted by training length
   - ext_002: Extension programs organized
   - ext_003: Beneficiaries satisfaction rating

## Schema Enhancements

### 1. New Table: `operation_organizational_info`
**Purpose**: Stores organizational context for each university operation

**Fields** (ALL OPTIONAL - can be added progressively):
- `department` - Office/Department name (nullable)
- `agency_entity` - Agency or entity name, e.g., "Caraga State University" (nullable)
- `operating_unit` - Operating unit name, e.g., "Project Management Unit" (nullable)
- `organization_code` - Unique organization code, e.g., "CSU-PMU-HEP-2024" (nullable)

**Relationship**: One-to-one with `university_operations`

**Beginner Note**: This table is completely optional. Users can create an operation first, then add organizational info later when available. All fields are nullable to allow progressive data entry.

### 2. Enhanced Table: `operation_indicators`
**Purpose**: Tracks quarterly outcome indicators with complete data breakdown

**Key Enhancements**:
- **Quarterly Physical Targets** (Q1-Q4): `target_q1`, `target_q2`, `target_q3`, `target_q4` (ALL NULLABLE)
- **Quarterly Physical Accomplishments** (Q1-Q4): `accomplishment_q1`, `accomplishment_q2`, `accomplishment_q3`, `accomplishment_q4` (ALL NULLABLE)
- **Quarterly Accomplishment Scores** (Q1-Q4): `score_q1`, `score_q2`, `score_q3`, `score_q4` (numerator/denominator format, e.g., "148/200") (ALL NULLABLE)
- **UACS Code**: Standardized code for tracking (NULLABLE - may not be available initially)
- **Indicator Code**: Unique identifier for each indicator (e.g., 'graduate-faculty-research', 'res_001', 'ext_001') (NULLABLE)
- **Status Field**: RBAC approval workflow support ('pending', 'approved', 'rejected') - defaults to 'pending'
- **Calculated Fields**: `variance`, `average_target`, `average_accomplishment` (ALL NULLABLE - computed later)
- **Subcategory Data (JSONB)**: Flexible storage for subcategory-specific fields (OPTIONAL - only for Research/Extension)

**Beginner-Friendly Design**:
- ✅ **Progressive Data Entry**: Users can enter Q1 data first, then add Q2, Q3, Q4 as quarters complete
- ✅ **Flexible Requirements**: Not all indicators need all fields - some may only need targets, others need scores
- ✅ **Optional Fields**: Description, UACS code, indicator code can be added later
- ✅ **Calculated Fields**: Variance and averages can be computed by application logic, not required at insert
- ✅ **Subcategory-Specific**: Only Research and Extension programs need `subcategory_data` - Higher Education and Advanced Education typically don't use it

**Subcategory-Specific JSONB Structure**:

**Research Program** (`subcategory_data`):
```json
{
  "researchOutput": 85.5,
  "publications": 12,
  "patents": 3,
  "citations": 45,
  "collaborations": "International partnerships",
  "fundingSource": "CHED Research Grant",
  "researchArea": "Agricultural Technology"
}
```

**Extension Program** (`subcategory_data`):
```json
{
  "beneficiaries": 2400,
  "communityProjects": 29,
  "trainingsProvided": 15,
  "practitioners": 45,
  "impactScore": 91.5,
  "communityPartners": "Local Government Units",
  "extensionArea": "Agricultural Extension",
  "targetSector": "Farmers and Fisherfolk"
}
```

### 3. Enhanced Table: `operation_financials`
**Purpose**: Tracks financial performance per quarter with detailed breakdown

**Key Enhancements**:
- **Quarterly Tracking**: `quarter` field (Q1, Q2, Q3, Q4) (NULLABLE - can add later)
- **Operations Programs**: Specific program name (REQUIRED)
- **Budget Sources**: Track funding sources, e.g., "Regular Agency Funds", "Internally Generated Funds" (NULLABLE)
- **Financial Metrics** (ALL NULLABLE except defaults):
  - `allotment` - Budget allocation (nullable)
  - `target` - Target amount (nullable)
  - `obligation` - Committed funds (defaults to 0)
  - `disbursement` - Actual disbursed amount (defaults to 0)
- **Calculated Rates** (ALL NULLABLE - computed later):
  - `utilization_per_target` - (obligation / target) * 100
  - `utilization_per_approved_budget` - (obligation / allotment) * 100
  - `disbursement_rate` - (disbursement / obligation) * 100
- **Variance Tracking**: `variance` = target - obligation (NULLABLE - computed)
- **Status**: Track financial record status ('active', 'completed', 'pending', 'cancelled') - defaults to 'active'

**Beginner-Friendly Design**:
- ✅ **Progressive Entry**: Start with basic info (program name, year), add financial details later
- ✅ **Optional Fields**: Department, budget source, performance indicator can be added when available
- ✅ **Calculated Fields**: Utilization rates and variance can be computed by application logic
- ✅ **Defaults**: Obligation and disbursement default to 0, can be updated as data comes in

**Unique Constraint**: `(operation_id, fiscal_year, quarter, operations_programs)` ensures no duplicate financial records

## Indexes Added

### `operation_organizational_info`
- `idx_ooi_operation` - Fast lookup by operation
- `idx_ooi_department` - Filter by department
- `idx_ooi_org_code` - Lookup by organization code

### `operation_indicators`
- `idx_oi_operation` - Fast lookup by operation
- `idx_oi_code` - Lookup by indicator code
- `idx_oi_uacs` - Filter by UACS code
- `idx_oi_year` - Filter by fiscal year
- `idx_oi_status` - Filter by approval status (for RBAC workflow)
- `idx_oi_created_by` - Track who created indicators
- `idx_oi_subcategory_data` - GIN index for JSONB queries on subcategory-specific data

### `operation_financials`
- `idx_of_operation` - Fast lookup by operation
- `idx_of_year` - Filter by fiscal year
- `idx_of_quarter` - Filter by quarter
- `idx_of_program` - Filter by program name
- `idx_of_department` - Filter by department
- `idx_of_status` - Filter by status

## Data Mapping from Admin Interface

### Outcome Indicators
| Admin Interface Field | Database Column | Notes |
|----------------------|----------------|-------|
| `particular` | `particular` | Indicator description |
| `uacsCode` | `uacs_code` | UACS code |
| `physicalTarget.quarter1-4` | `target_q1` to `target_q4` | Quarterly targets |
| `physicalAccomplishment.quarter1-4` | `accomplishment_q1` to `accomplishment_q4` | Quarterly accomplishments |
| `accomplishmentScore.quarter1-4` | `score_q1` to `score_q4` | Numerator/denominator format |
| `variance` | `variance` | Calculated variance |
| `varianceAsOf` | `variance_as_of` | Date of variance calculation |
| `remarks` | `remarks` | Additional notes |
| `status` | `status` | Approval status |
| `budgetYear` | `fiscal_year` | Assessment year |

### Research-Specific Fields
| Admin Interface Field | Database Location |
|----------------------|-------------------|
| `researchOutput` | `subcategory_data->>'researchOutput'` |
| `publications` | `subcategory_data->>'publications'` |
| `patents` | `subcategory_data->>'patents'` |
| `citations` | `subcategory_data->>'citations'` |
| `collaborations` | `subcategory_data->>'collaborations'` |
| `fundingSource` | `subcategory_data->>'fundingSource'` |
| `researchArea` | `subcategory_data->>'researchArea'` |

### Extension-Specific Fields
| Admin Interface Field | Database Location |
|----------------------|-------------------|
| `beneficiaries` | `subcategory_data->>'beneficiaries'` |
| `communityProjects` | `subcategory_data->>'communityProjects'` |
| `trainingsProvided` | `subcategory_data->>'trainingsProvided'` |
| `practitioners` | `subcategory_data->>'practitioners'` |
| `impactScore` | `subcategory_data->>'impactScore'` |
| `communityPartners` | `subcategory_data->>'communityPartners'` |
| `extensionArea` | `subcategory_data->>'extensionArea'` |
| `targetSector` | `subcategory_data->>'targetSector'` |

### Financial Records
| Admin Interface Field | Database Column |
|----------------------|----------------|
| `operationsPrograms` | `operations_programs` |
| `allotment` | `allotment` |
| `target` | `target` |
| `obligation` | `obligation` |
| `disbursement` | `disbursement` |
| `utilizationPerTarget` | `utilization_per_target` |
| `utilizationPerApprovedBudget` | `utilization_per_approved_budget` |
| `disbursementRate` | `disbursement_rate` |
| `quarter` | `quarter` |
| `year` | `fiscal_year` |
| `budgetSource` | `budget_source` |
| `department` | `department` |

## RBAC Support
- **Status Field**: Tracks approval workflow ('pending', 'approved', 'rejected')
- **Created/Updated By**: Tracks user who created/updated records
- **Audit Trail**: All changes logged via `audit_trail` table

## Query Examples

### Get all indicators for an operation with quarterly data
```sql
SELECT 
  id,
  particular,
  uacs_code,
  target_q1, target_q2, target_q3, target_q4,
  accomplishment_q1, accomplishment_q2, accomplishment_q3, accomplishment_q4,
  score_q1, score_q2, score_q3, score_q4,
  variance,
  status,
  subcategory_data
FROM operation_indicators
WHERE operation_id = :operation_id
  AND fiscal_year = :year
ORDER BY indicator_code;
```

### Get research-specific data
```sql
SELECT 
  id,
  particular,
  subcategory_data->>'researchOutput' as research_output,
  subcategory_data->>'publications' as publications,
  subcategory_data->>'patents' as patents,
  subcategory_data->>'citations' as citations
FROM operation_indicators
WHERE operation_id = :operation_id
  AND subcategory_data->>'researchOutput' IS NOT NULL;
```

### Get quarterly financial performance
```sql
SELECT 
  quarter,
  operations_programs,
  allotment,
  target,
  obligation,
  disbursement,
  utilization_per_target,
  disbursement_rate
FROM operation_financials
WHERE operation_id = :operation_id
  AND fiscal_year = :year
ORDER BY quarter, operations_programs;
```

## Migration Notes
- Existing `operation_indicators` table structure is replaced
- Existing `operation_financials` table structure is replaced
- New `operation_organizational_info` table added
- All tables include soft-delete support (`deleted_at`, `deleted_by`)
- All tables include metadata JSONB for extensibility
- All timestamps use `TIMESTAMPTZ` for timezone support

## Benefits
1. **Complete Quarterly Tracking**: Full Q1-Q4 breakdown for all indicators
2. **Flexible Subcategory Support**: JSONB allows different fields per subcategory
3. **RBAC Ready**: Status field supports approval workflows
4. **Financial Granularity**: Per-quarter financial tracking
5. **Performance Optimized**: Comprehensive indexes for fast queries
6. **Audit Trail**: Full tracking of who created/updated records
7. **Extensible**: JSONB metadata fields for future enhancements
8. **Beginner-Friendly**: Minimal required fields, progressive data entry supported
9. **Flexible Data Entry**: Not all fields required at once - users can add data as it becomes available

## Beginner Programmer Guidelines

### When Creating an Indicator Record
**Minimum Required Fields**:
- `operation_id` - Which operation this indicator belongs to
- `particular` - The indicator description
- `fiscal_year` - Assessment year
- `created_by` - Who is creating the record

**Can Add Later**:
- Quarterly targets (target_q1, target_q2, etc.) - Add as you plan each quarter
- Quarterly accomplishments - Add as quarters complete
- UACS code - Add when available
- Description - Add detailed description later
- Subcategory data - Only if this is Research or Extension program

### Example: Creating a Basic Indicator
```sql
-- Start with minimal data
INSERT INTO operation_indicators (
  id, operation_id, particular, fiscal_year, created_by
) VALUES (
  gen_random_uuid(),
  'operation-uuid-here',
  'A. Percentage of graduate school faculty engaged in research work',
  2024,
  'user-uuid-here'
);

-- Add quarterly data later
UPDATE operation_indicators 
SET target_q1 = 85.0, accomplishment_q1 = 87.5, score_q1 = '148/200'
WHERE id = 'indicator-uuid-here';
```

### When Creating Financial Records
**Minimum Required Fields**:
- `operation_id` - Which operation
- `fiscal_year` - Assessment year
- `operations_programs` - Program name

**Can Add Later**:
- Quarter - Add when you have quarterly breakdown
- Allotment/Target - Add when budget is finalized
- Obligation/Disbursement - Add as financial transactions occur
- Calculated rates - Let application compute these

### Best Practices for Beginners
1. **Start Simple**: Create records with minimal required fields first
2. **Add Progressively**: Update records as more data becomes available
3. **Use NULLs**: NULL values are expected and normal - not all data is available at once
4. **Calculate Later**: Don't worry about calculated fields (variance, averages) - compute them in application code
5. **Subcategory Data**: Only use `subcategory_data` for Research and Extension programs
6. **Status Field**: Defaults to 'pending' - change to 'approved' when ready

