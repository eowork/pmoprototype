// Project List Aggregation Logic for M&E System
// Uses Date of Entry of Record as primary grouping field

export interface ProjectListItem {
  idNo: string;
  description: string;
  unit: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedProjectCost: number;
  unitCost: number;
  dateOfEntryOfRecord: string; // YYYY-MM-DD
}

export interface AggregatedProjectData {
  period: string;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalProjectCost: number;
  averageUnitCost: number;
  recordCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Get ISO week number from date
function getISOWeek(date: Date): string {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const jan4 = new Date(target.getFullYear(), 0, 4);
  const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
  const weekNr = 1 + Math.ceil(dayDiff / 7);
  return `${target.getFullYear()}-W${weekNr.toString().padStart(2, '0')}`;
}

// Get ISO quarter from date
function getISOQuarter(date: Date): string {
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  return `${date.getFullYear()}-Q${quarter}`;
}

// Daily aggregation (group by exact date)
export function aggregateDaily(
  items: ProjectListItem[],
  startDate: string,
  endDate: string
): AggregatedProjectData[] {
  const filtered = items.filter(item => 
    item.dateOfEntryOfRecord >= startDate && 
    item.dateOfEntryOfRecord <= endDate
  );

  const grouped = filtered.reduce((acc, item) => {
    const date = item.dateOfEntryOfRecord;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ProjectListItem[]>);

  return Object.entries(grouped).map(([date, items]) => ({
    period: date,
    totalMaterialCost: items.reduce((sum, item) => sum + item.estimatedMaterialCost, 0),
    totalLaborCost: items.reduce((sum, item) => sum + item.estimatedLaborCost, 0),
    totalProjectCost: items.reduce((sum, item) => sum + item.estimatedProjectCost, 0),
    averageUnitCost: items.reduce((sum, item) => sum + item.unitCost, 0) / items.length,
    recordCount: items.length,
    dateRange: { start: date, end: date }
  })).sort((a, b) => a.period.localeCompare(b.period));
}

// Weekly aggregation (group by ISO week)
export function aggregateWeekly(
  items: ProjectListItem[],
  startDate: string,
  endDate: string
): AggregatedProjectData[] {
  const filtered = items.filter(item => 
    item.dateOfEntryOfRecord >= startDate && 
    item.dateOfEntryOfRecord <= endDate
  );

  const grouped = filtered.reduce((acc, item) => {
    const week = getISOWeek(new Date(item.dateOfEntryOfRecord));
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(item);
    return acc;
  }, {} as Record<string, ProjectListItem[]>);

  return Object.entries(grouped).map(([week, items]) => {
    const dates = items.map(item => item.dateOfEntryOfRecord).sort();
    return {
      period: week,
      totalMaterialCost: items.reduce((sum, item) => sum + item.estimatedMaterialCost, 0),
      totalLaborCost: items.reduce((sum, item) => sum + item.estimatedLaborCost, 0),
      totalProjectCost: items.reduce((sum, item) => sum + item.estimatedProjectCost, 0),
      averageUnitCost: items.reduce((sum, item) => sum + item.unitCost, 0) / items.length,
      recordCount: items.length,
      dateRange: { start: dates[0], end: dates[dates.length - 1] }
    };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

// Monthly aggregation (group by YYYY-MM)
export function aggregateMonthly(
  items: ProjectListItem[],
  startDate: string,
  endDate: string
): AggregatedProjectData[] {
  const filtered = items.filter(item => 
    item.dateOfEntryOfRecord >= startDate && 
    item.dateOfEntryOfRecord <= endDate
  );

  const grouped = filtered.reduce((acc, item) => {
    const month = item.dateOfEntryOfRecord.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(item);
    return acc;
  }, {} as Record<string, ProjectListItem[]>);

  return Object.entries(grouped).map(([month, items]) => {
    const dates = items.map(item => item.dateOfEntryOfRecord).sort();
    return {
      period: month,
      totalMaterialCost: items.reduce((sum, item) => sum + item.estimatedMaterialCost, 0),
      totalLaborCost: items.reduce((sum, item) => sum + item.estimatedLaborCost, 0),
      totalProjectCost: items.reduce((sum, item) => sum + item.estimatedProjectCost, 0),
      averageUnitCost: items.reduce((sum, item) => sum + item.unitCost, 0) / items.length,
      recordCount: items.length,
      dateRange: { start: dates[0], end: dates[dates.length - 1] }
    };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

// Quarterly aggregation (group by YYYY-Q1/Q2/Q3/Q4)
export function aggregateQuarterly(
  items: ProjectListItem[],
  startDate: string,
  endDate: string
): AggregatedProjectData[] {
  const filtered = items.filter(item => 
    item.dateOfEntryOfRecord >= startDate && 
    item.dateOfEntryOfRecord <= endDate
  );

  const grouped = filtered.reduce((acc, item) => {
    const quarter = getISOQuarter(new Date(item.dateOfEntryOfRecord));
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    acc[quarter].push(item);
    return acc;
  }, {} as Record<string, ProjectListItem[]>);

  return Object.entries(grouped).map(([quarter, items]) => {
    const dates = items.map(item => item.dateOfEntryOfRecord).sort();
    return {
      period: quarter,
      totalMaterialCost: items.reduce((sum, item) => sum + item.estimatedMaterialCost, 0),
      totalLaborCost: items.reduce((sum, item) => sum + item.estimatedLaborCost, 0),
      totalProjectCost: items.reduce((sum, item) => sum + item.estimatedProjectCost, 0),
      averageUnitCost: items.reduce((sum, item) => sum + item.unitCost, 0) / items.length,
      recordCount: items.length,
      dateRange: { start: dates[0], end: dates[dates.length - 1] }
    };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

// Main aggregation function
export function aggregateProjectList(
  items: ProjectListItem[],
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly',
  startDate: string,
  endDate: string
): AggregatedProjectData[] {
  switch (period) {
    case 'daily':
      return aggregateDaily(items, startDate, endDate);
    case 'weekly':
      return aggregateWeekly(items, startDate, endDate);
    case 'monthly':
      return aggregateMonthly(items, startDate, endDate);
    case 'quarterly':
      return aggregateQuarterly(items, startDate, endDate);
    default:
      throw new Error(`Unsupported aggregation period: ${period}`);
  }
}

// Unit test examples (pseudocode style)
/*
UNIT TEST EXAMPLES:

Test 1: Daily Aggregation
Input: 3 items with dates [2024-01-15, 2024-01-15, 2024-01-16]
Expected: 2 groups (2024-01-15 with 2 items, 2024-01-16 with 1 item)
Material costs: [sum of first 2 items], [third item cost]

Test 2: Weekly Aggregation  
Input: items spanning 2024-01-15 to 2024-01-22 (crosses week boundary)
Expected: 2 groups (2024-W03, 2024-W04)
Average unit cost calculation verified per week

Test 3: Monthly Aggregation
Input: items from 2024-01-15, 2024-02-03, 2024-02-14
Expected: 2 groups (2024-01, 2024-02)  
Sum validation: Feb group = 200000 + 1000000 = 1200000 project cost

Test 4: Quarterly Aggregation
Input: items across Q1 (Jan-Mar) and Q2 (Apr-Jun)
Expected: 2 groups (2024-Q1, 2024-Q2)
Record counts: Q1=6 items, Q2=6 items from mock data
*/