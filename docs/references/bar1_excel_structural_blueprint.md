# BAR No. 1 Excel Structural Blueprint
## Quarterly Physical Report of Operation - 2025

**Source File:** `2025 Bar1 Excel.xlsx`
**Analysis Date:** 2026-02-26
**Report Period:** As of December 31, 2025

---

## 1. Sheet Names and Structure

| Sheet Name | Rows | Columns | Description |
|------------|------|---------|-------------|
| `bar1_report` | 111 | 28 (A-AB) | Main report containing all 4 pillars |

### Document Header (Rows 1-9)
- **Row 2:** Report Title - "BAR No. 1"
- **Row 3:** Report Type - "QUARTERLY PHYSICAL REPORT OF OPERATION"
- **Row 4:** Report Period - "As of December 31, 2025"
- **Row 6:** Department - State Universities and Colleges (SUCs)
- **Row 7:** Agency/Entity - Caraga State University
- **Row 8:** Operating Unit - < not applicable >
- **Row 9:** Organization Code (UACS) - 08 105 0000000

---

## 2. The 4 PILLARS

| # | Pillar Name | Start Row | UACS Code |
|---|-------------|-----------|-----------|
| 1 | **HIGHER EDUCATION PROGRAM** | 13 | 310100000000000 |
| 2 | **ADVANCED EDUCATION PROGRAM** | 27 | 320100000000000 |
| 3 | **RESEARCH PROGRAM** | 61 | 320200000000000 |
| 4 | **TECHNICAL ADVISORY EXTENSION PROGRAM** | 74 | 330100000000000 |

### Pillar Objectives (OO - Organizational Outcome)

| Pillar | Organizational Outcome |
|--------|----------------------|
| Higher Education | Relevant and quality tertiary education ensured to achieve inclusive growth and access of poor but deserving students to quality tertiary education increased |
| Advanced Education | Higher education research improved to promote economic productivity and innovation |
| Research | Higher education research improved to promote economic productivity and innovation |
| Technical Advisory Extension | Community engagement increased |

---

## 3. UACS Codes for Each Pillar

```
UACS Code Structure: XX X XX XXXX XXX XXX
                     |  |  |    |   |   |
                     |  |  |    |   |   +-- Object Code
                     |  |  |    |   +------ Sub-Object Code
                     |  |  |    +---------- Object Classification
                     |  |  +--------------- Program/Activity/Project
                     |  +------------------ Agency
                     +--------------------- Department

Organization Code: 08 105 0000000 (Caraga State University)

Pillar UACS Codes:
- 310100000000000 - Higher Education Program
- 320100000000000 - Advanced Education Program
- 320200000000000 - Research Program
- 330100000000000 - Technical Advisory Extension Program
```

---

## 4. Outcome Indicators per Pillar

### Pillar 1: HIGHER EDUCATION PROGRAM (UACS: 310100000000000)

| # | Outcome Indicator | Target | Unit |
|---|-------------------|--------|------|
| 1 | Percentage of first-time licensure exam takers that pass the licensure exams | 55.00% | Percentage |
| 2 | Percentage of graduates (2 years prior) that are employed | 55.00% | Percentage |

### Pillar 2: ADVANCED EDUCATION PROGRAM (UACS: 320100000000000)

| # | Outcome Indicator | Target | Unit |
|---|-------------------|--------|------|
| 1 | Percentage of graduate school faculty engaged in research work applied in any of the following: a. pursuing advanced research degree programs (Ph.D.) or b. actively pursuing within the last three (3) years (investigative research, basic and applied scientific research, policy research, social science research) or c. producing technologies for commercialization or livelihood improvement or d. whose research work resulted in an extension program | 50.00% | Percentage |

### Pillar 3: RESEARCH PROGRAM (UACS: 320200000000000)

| # | Outcome Indicator | Target | Unit |
|---|-------------------|--------|------|
| 1 | Number of research outputs in the last three years utilized by the industry or by other beneficiaries | 9 | Count |

### Pillar 4: TECHNICAL ADVISORY EXTENSION PROGRAM (UACS: 330100000000000)

| # | Outcome Indicator | Target | Unit |
|---|-------------------|--------|------|
| 1 | Number of active partnerships with LGUs, industries, NGOs, NGAs, SMEs, and other stakeholders as a result of extension activities | 9 | Count |

---

## 5. Output Indicators per Pillar

### Pillar 1: HIGHER EDUCATION PROGRAM

| # | Output Indicator | Target | Unit |
|---|------------------|--------|------|
| 1 | Percentage of undergraduate students enrolled in CHED-identified and RDC-identified priority programs | 65.00% | Percentage |
| 2 | Percentage of undergraduate programs with accreditation | 20.00% | Percentage |

### Pillar 2: ADVANCED EDUCATION PROGRAM

| # | Output Indicator | Target | Unit |
|---|------------------|--------|------|
| 1 | Percentage of graduate students enrolled in research degree programs | 70.00% | Percentage |
| 2 | Percentage of accredited graduate programs | 20.00% | Percentage |

### Pillar 3: RESEARCH PROGRAM

| # | Output Indicator | Target | Unit |
|---|------------------|--------|------|
| 1 | Number of research outputs completed within the year | 40 | Count |
| 2 | Percentage of research outputs published in internationally-refereed or CHED recognized journal within the year | 40.00% | Percentage |

### Pillar 4: TECHNICAL ADVISORY EXTENSION PROGRAM

| # | Output Indicator | Target | Unit |
|---|------------------|--------|------|
| 1 | Number of trainees weighted by the length of training | 1,500 | Count (weighted) |
| 2 | Number of extension programs organized and supported consistent with the SUC's mandated and priority programs | 10 | Count |
| 3 | Percentage of beneficiaries who rate the training course/s as satisfactory or higher in terms of quality and relevance | 70.00% | Percentage |

---

## 6. Quarterly Layout Structure (Q1-Q4)

### Column Layout (Actual Excel Columns)

```
DOCUMENT STRUCTURE:
==================

Column B (2)  : Particulars (Program/Indicator Name)
Column H (8)  : UACS CODE

PHYSICAL TARGET (Budget Year) - Columns J-P:
  Column J (10) : Q1 Target (1st Quarter)
  Column L (12) : Q2 Target (2nd Quarter)
  Column N (14) : Q3 Target (3rd Quarter)
  Column O (15) : Q4 Target (4th Quarter)
  Column P (16) : Total Target

PHYSICAL ACCOMPLISHMENT (Budget Year) - Columns Q-X:
  Column Q (17) : Q1 Actual (1st Quarter)
  Column R (18) : Q2 Actual (2nd Quarter)
  Column T (20) : Q3 Actual (3rd Quarter)
  Column V (22) : Q4 Actual (4th Quarter)
  Column X (24) : Total Actual

ANALYSIS COLUMNS:
  Column Y (25) : Variance as of December 31, 2025
  Column Z (26) : Remarks
```

### Header Row Structure

| Row | Content |
|-----|---------|
| 10 | Main headers (Particulars, UACS CODE, Physical Target, Physical Accomplishment, Variance, Remarks) |
| 11 | Quarter sub-headers (1st Quarter, 2nd Quarter, 3rd Quarter, 4th Quarter, Total) |
| 12 | Column numbers (1-14) for reference |

---

## 7. Target vs Actual Column Patterns

### Pattern Structure

```
QUARTERLY DATA LAYOUT:

                    |-- TARGETS (5 cols) --|-- ACTUALS (5 cols) --|
Indicator           | Q1  | Q2  | Q3  | Q4  | Tot | Q1  | Q2  | Q3  | Q4  | Tot | Var | Remarks
--------------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|--------
[Indicator Name]    | val | val | val | val | sum | val | val | val | val | sum | +/- | text
```

### Target Columns (Planned/Budgeted Values)
- **Q1 Target:** First quarter planned value
- **Q2 Target:** Second quarter planned value
- **Q3 Target:** Third quarter planned value
- **Q4 Target:** Fourth quarter planned value
- **Total Target:** Sum of quarterly targets OR annual target

### Actual Columns (Accomplished Values)
- **Q1 Actual:** First quarter accomplished value
- **Q2 Actual:** Second quarter accomplished value
- **Q3 Actual:** Third quarter accomplished value
- **Q4 Actual:** Fourth quarter accomplished value
- **Total Actual:** Sum of quarterly accomplishments OR cumulative value

---

## 8. Variance Computation Formula

### Formula
```
Variance = Total Actual - Total Target
```

### Display Format
- Positive variance: `+XX.XX%` or `+XX` (exceeded target)
- Negative variance: `-XX.XX%` or `-XX` (below target)

### Examples from the Data

| Indicator | Target | Actual | Variance | Calculation |
|-----------|--------|--------|----------|-------------|
| Licensure exam pass rate | 55.00% | 81.94% | +26.94% | 81.94 - 55.00 = 26.94 |
| Graduate employment | 55.00% | 58.19% | +3.19% | 58.19 - 55.00 = 3.19 |
| Research outputs completed | 40 | 243 | +203 | 243 - 40 = 203 |
| Extension programs | 10 | 29 | +19 | 29 - 10 = 19 |

---

## 9. Accomplishment Rate Formula

### Primary Formula (Percentage Achievement)
```
Accomplishment Rate = (Actual Value / Target Value) * 100%
```

### Display Formats in the Data

#### Format 1: Simple Percentage
```
Target: 55.00%
Actual: 81.94%
```

#### Format 2: Percentage with Ratio
```
Actual: 81.94% (381/465)
        |        |    |
        |        |    +-- Denominator (total population)
        |        +------- Numerator (achieved count)
        +---------------- Calculated percentage
```

### Examples

| Indicator | Format | Numerator | Denominator | Rate |
|-----------|--------|-----------|-------------|------|
| Licensure exam pass | 81.94% (381/465) | 381 | 465 | 81.94% |
| Graduate employment | 58.19% (1329/2284) | 1329 | 2284 | 58.19% |
| Priority programs enrollment | 95.19% (16713/17557) | 16713 | 17557 | 95.19% |
| Accredited programs | 54.84% (17/31) | 17 | 31 | 54.84% |

### Achievement Analysis

| Indicator Type | Target | Actual | Achievement % |
|----------------|--------|--------|---------------|
| Licensure exam pass rate | 55.00% | 81.94% | 148.98% |
| Undergraduate enrollment | 65.00% | 95.19% | 146.45% |
| Research outputs | 40 | 243 | 607.50% |
| Extension programs | 10 | 29 | 290.00% |

---

## 10. Unit Types Used

### Unit Type Summary

| Unit Type | Symbol/Format | Examples in Data |
|-----------|---------------|------------------|
| **Percentage** | `XX.XX%` | 55.00%, 81.94%, 70.00% |
| **Count** | Whole number | 9, 40, 243, 29 |
| **Weighted Count** | Decimal number | 499.5, 1464.75, 6027.30 |
| **Ratio** | `(n/d)` | (381/465), (17/31), (1225/1261) |

### Unit Type by Indicator Category

| Pillar | Indicator | Unit Type |
|--------|-----------|-----------|
| Higher Education | Licensure exam pass rate | Percentage |
| Higher Education | Graduate employment rate | Percentage |
| Higher Education | Priority program enrollment | Percentage |
| Higher Education | Program accreditation | Percentage |
| Advanced Education | Faculty research engagement | Percentage |
| Advanced Education | Graduate enrollment in research | Percentage |
| Advanced Education | Graduate program accreditation | Percentage |
| Research | Research outputs utilized | Count |
| Research | Research outputs completed | Count |
| Research | Published research outputs | Percentage |
| Extension | Active partnerships | Count |
| Extension | Trainees (weighted) | Weighted Count |
| Extension | Extension programs | Count |
| Extension | Beneficiary satisfaction | Percentage |

---

## 11. Complete Data Model Schema

### Entity: BAR1Report

```typescript
interface BAR1Report {
  reportNumber: string;           // "BAR No. 1"
  reportType: string;             // "QUARTERLY PHYSICAL REPORT OF OPERATION"
  reportPeriod: Date;             // "December 31, 2025"
  department: string;             // "State Universities and Colleges (SUCs)"
  agency: string;                 // "Caraga State University"
  operatingUnit: string;          // "< not applicable >"
  organizationCode: string;       // "08 105 0000000"
  pillars: Pillar[];
}

interface Pillar {
  id: number;                     // 1-4
  name: string;                   // "HIGHER EDUCATION PROGRAM"
  uacsCode: string;              // "310100000000000"
  organizationalOutcome: string;  // OO description
  outcomeIndicators: Indicator[];
  outputIndicators: Indicator[];
}

interface Indicator {
  id: number;                     // Sequential within pillar
  name: string;                   // Full indicator text
  type: 'outcome' | 'output';
  unitType: 'percentage' | 'count' | 'weighted_count' | 'ratio';
  quarterlyTargets: QuarterlyData;
  quarterlyActuals: QuarterlyData;
  variance: number | string;
  remarks: string;
}

interface QuarterlyData {
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  total: number;
  // For ratio display
  numerator?: number;
  denominator?: number;
}
```

---

## 12. Page Structure

The report spans 3 pages with repeated headers:

| Page | Rows | Content |
|------|------|---------|
| 1 | 1-44 | Header + Higher Education + Part of Advanced Education |
| 2 | 45-86 | Header + Rest of Advanced Education + Research + Part of Extension |
| 3 | 87-111 | Header + Rest of Extension + Signatures |

### Footer Information
- System: "Unified Reporting System"
- Status: "SUBMITTED"
- Pages: "Page X of 3"

### Signature Block (Rows 103-108)
- **Column E:** "Prepared By:" with Date
- **Column K:** "In coordination with:" with Date
- **Column U:** "Approved By:" with Date

---

## 13. Data Validation Rules

### Percentage Values
- Range: 0.00% to 100.00%+ (can exceed 100% for actuals)
- Format: Two decimal places
- Optional ratio: `(numerator/denominator)` suffix

### Count Values
- Non-negative integers for regular counts
- Decimals allowed for weighted counts (e.g., trainees weighted by training length)

### Variance Values
- Prefix: `+` for positive, `-` for negative
- Same unit as the indicator (% or count)

### Quarterly Totals
- For percentage indicators: May use year-end cumulative or quarterly average
- For count indicators: Sum of quarterly values

---

## 14. Key Observations

1. **Multi-line Indicators:** Indicator names often span multiple rows (D column)
2. **Merged Cells:** Headers use merged cells for visual grouping
3. **Page Breaks:** Document includes page break indicators with repeated headers
4. **Data Density:** Actual values include both calculated percentages and raw ratios
5. **Remarks Column:** Contains qualitative explanations for performance
6. **Missing Data:** Some quarters show "-" for no data available
7. **Positive Variances:** All sample indicators show positive variance (exceeded targets)

---

## 15. Implementation Recommendations

### For Database Design
1. Create separate tables for Pillars, Indicators, and QuarterlyData
2. Use ENUM for indicator types and unit types
3. Store raw numerator/denominator separately from calculated percentages
4. Include computed fields for variance and accomplishment rate

### For Frontend Display
1. Use collapsible sections for each pillar
2. Color-code variance (green for positive, red for negative)
3. Show progress bars for accomplishment rate
4. Enable quarterly filtering
5. Support export to original Excel format

### For Data Entry
1. Validate percentage ranges
2. Auto-calculate totals and variances
3. Support both percentage input and ratio input (numerator/denominator)
4. Require remarks for significant variances

---

*Document generated from analysis of 2025 Bar1 Excel.xlsx*
*Caraga State University - BAR No. 1 Quarterly Physical Report of Operation*
