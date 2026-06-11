/**
 * PrimaryFundingSource enum — controlled Level-1 funding category (Phase AAAK).
 *
 * Level 1 (this enum) is used for analytics, dashboard reporting, portfolio summaries,
 * filtering, and KPI computation. Level 2 (free-text `funding_source_description` on
 * construction_projects) carries the descriptive variation (e.g. "GAA FY2025", "GAA Savings",
 * "CHED Grant") for detailed reporting/audit — it is NOT aggregated.
 *
 * Stored as VARCHAR(30) on construction_projects.primary_funding_source.
 */
export enum PrimaryFundingSource {
  GAA = 'GAA',
  SPECIAL_GRANT = 'SPECIAL_GRANT',
  TRUST_FUND = 'TRUST_FUND',
  INSTITUTIONAL_FUND = 'INSTITUTIONAL_FUND',
  LGU_FUND = 'LGU_FUND',
  PRIVATE_SECTOR = 'PRIVATE_SECTOR',
  FOREIGN_ASSISTED = 'FOREIGN_ASSISTED',
  OTHER = 'OTHER',
}

export const PRIMARY_FUNDING_SOURCE_VALUES: string[] =
  Object.values(PrimaryFundingSource);

/** Human-readable display labels for the 8 controlled categories. */
export const PRIMARY_FUNDING_SOURCE_LABELS: Record<string, string> = {
  [PrimaryFundingSource.GAA]: 'GAA',
  [PrimaryFundingSource.SPECIAL_GRANT]: 'Special Grant',
  [PrimaryFundingSource.TRUST_FUND]: 'Trust Fund',
  [PrimaryFundingSource.INSTITUTIONAL_FUND]: 'Institutional Fund',
  [PrimaryFundingSource.LGU_FUND]: 'LGU Fund',
  [PrimaryFundingSource.PRIVATE_SECTOR]: 'Private Sector',
  [PrimaryFundingSource.FOREIGN_ASSISTED]: 'Foreign-Assisted Project',
  [PrimaryFundingSource.OTHER]: 'Other',
};
