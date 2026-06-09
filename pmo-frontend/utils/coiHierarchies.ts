/**
 * Phase NB-A (2026-05-21): Single source of truth for the three strategic
 * alignment hierarchies referenced by the COI Project Profile selectors.
 *
 * Consumed by:
 *   - components/coi/CiHierarchicalSelectorModal.vue (modal renderer)
 *   - components/coi/CiBasicInfoForm.vue (selector trigger + chip display)
 *   - pages/coi/detail-[id].vue (read-only display)
 *
 * Editing taxonomy text in this file propagates everywhere automatically.
 * Sub-items use dotted keys (e.g., RDP_CH4_1, SEA_1_1, LIKHA_K) — keys are
 * stable identifiers stored in the DB; labels are display-only.
 */

export interface HierarchyOption {
  key: string;
  label: string;
  description?: string;
  /** Children are themselves selectable when no further nesting; otherwise act as group parents. */
  children?: HierarchyOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// CSU LIKHA Goals (institutional strategic plan — full names per ECO directive)
// ─────────────────────────────────────────────────────────────────────────────
export const LIKHA_OPTIONS: HierarchyOption[] = [
  { key: 'LIKHA_L', label: 'L — Launchpad for Global Talents and Innovators' },
  { key: 'LIKHA_I', label: 'I — Interdependent and High-Impact Coalition' },
  { key: 'LIKHA_K', label: 'K — Knowledge Co-Creation and Commercialization' },
  { key: 'LIKHA_H', label: 'H — Hub for Academic Innovation' },
  { key: 'LIKHA_A', label: 'A — Advancement in Administrative Systems and Digital Transformation' },
];

// ─────────────────────────────────────────────────────────────────────────────
// RDP 2023–2028 (Caraga Regional Development Plan) — full Parts/Chapters/Sub-chapters
// ─────────────────────────────────────────────────────────────────────────────
export const RDP_OPTIONS: HierarchyOption[] = [
  {
    key: 'RDP_PART_I',
    label: 'Part I — Introduction',
    children: [
      { key: 'RDP_CH1', label: 'Chapter 1: Overview of Regional Economy, Development Context, and Trends' },
      { key: 'RDP_CH2', label: 'Chapter 2: Regional Spatial Development Framework' },
      { key: 'RDP_CH3', label: 'Chapter 3: A Plan for Economic and Social Transformation in the Region' },
    ],
  },
  {
    key: 'RDP_PART_II',
    label: 'Part II — Develop and Protect Capabilities of Individuals and Families',
    children: [
      {
        key: 'RDP_CH4',
        label: 'Chapter 4: Promote Human and Social Development',
        children: [
          { key: 'RDP_CH4_1', label: 'Chapter 4.1: Boost Health' },
          { key: 'RDP_CH4_2', label: 'Chapter 4.2: Improve Education and Lifelong Learning Opportunities for All' },
          { key: 'RDP_CH4_3', label: 'Chapter 4.3: Establish Livable Communities' },
        ],
      },
      { key: 'RDP_CH5', label: 'Chapter 5: Increase Income-Earning Ability' },
      {
        key: 'RDP_CH6',
        label: 'Chapter 6: Reduce Vulnerabilities and Protect Purchasing Power',
        children: [
          { key: 'RDP_CH6_1', label: 'Chapter 6.1: Ensure Food Security and Proper Nutrition' },
          { key: 'RDP_CH6_2', label: 'Chapter 6.2: Strengthen Social Protection' },
        ],
      },
    ],
  },
  {
    key: 'RDP_PART_III',
    label: 'Part III — Transform Production Sectors to Generate More Quality Jobs and Competitive Products',
    children: [
      { key: 'RDP_CH7',  label: 'Chapter 7: Modernize Agriculture and Agribusiness' },
      { key: 'RDP_CH8',  label: 'Chapter 8: Revitalize Industry: Science, Technology, and Innovation-Driven Industrialization' },
      { key: 'RDP_CH9',  label: 'Chapter 9: Reinvigorate Services' },
      { key: 'RDP_CH10', label: 'Chapter 10: Advance Research and Development, Technology, and Innovation' },
      { key: 'RDP_CH11', label: 'Chapter 11: Promote Trade and Investments' },
    ],
  },
  {
    key: 'RDP_PART_IV',
    label: 'Part IV — Enabling Environment',
    children: [
      {
        key: 'RDP_CH12',
        label: 'Chapter 12: Promote Financial Inclusion and Improve Public Financial Management',
        children: [
          { key: 'RDP_CH12_1', label: 'Chapter 12.1: Promote an Inclusive, Innovative, and Healthy Financial Sector' },
          { key: 'RDP_CH12_2', label: 'Chapter 12.2: Ensure Sound Fiscal Management and Improve the Efficiency of the Tax System' },
        ],
      },
      { key: 'RDP_CH13', label: 'Chapter 13: Expand and Upgrade Infrastructure' },
      {
        key: 'RDP_CH14',
        label: 'Chapter 14: Ensure Peace and Security, and Enhance Administration of Justice',
        children: [
          { key: 'RDP_CH14_1', label: 'Chapter 14.1: Ensure Peace and Security' },
          { key: 'RDP_CH14_2', label: 'Chapter 14.2: Enhance Administration of Justice' },
        ],
      },
      { key: 'RDP_CH15', label: 'Chapter 15: Practice Good Governance and Improve Bureaucratic and Regulatory Efficiency' },
      { key: 'RDP_CH16', label: 'Chapter 16: Accelerate Climate Action and Strengthen Disaster Resilience' },
      { key: 'RDP_CH17', label: 'Chapter 17: Industrialize and Innovate Fishery, Agro-Forestry, Mining, and Eco-Tourism' },
    ],
  },
  {
    key: 'RDP_PART_V',
    label: 'Part V — Plan Implementation, Monitoring, and Evaluation',
    children: [
      { key: 'RDP_CH18', label: 'Chapter 18: Plan Implementation and Monitoring and Evaluation' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 0+8 Socio-Economic Agenda (Marcos Administration)
// Operator confirmed proposed sub-items 2026-05-21 (NA-C).
// Sub-items are INDEPENDENTLY selectable per ECO directive.
// ─────────────────────────────────────────────────────────────────────────────
export const SOCIOECONOMIC_OPTIONS: HierarchyOption[] = [
  {
    key: 'SEA_0',
    label: '0 — COVID-19 Response Continuity',
    children: [
      { key: 'SEA_0_1', label: '0.1 Vaccination program continuity' },
      { key: 'SEA_0_2', label: '0.2 Health system strengthening' },
    ],
  },
  {
    key: 'SEA_1',
    label: '1 — Food Security',
    children: [
      { key: 'SEA_1_1', label: '1.1 Ensure Food Security and Affordability' },
      { key: 'SEA_1_2', label: '1.2 Strengthen Agricultural Value Chains' },
    ],
  },
  {
    key: 'SEA_2',
    label: '2 — Improved Transportation',
    children: [
      { key: 'SEA_2_1', label: '2.1 Reduce Transport and Logistics Costs' },
      { key: 'SEA_2_2', label: '2.2 Expand Mass Transit Systems' },
    ],
  },
  {
    key: 'SEA_3',
    label: '3 — Affordable and Clean Energy',
    children: [
      { key: 'SEA_3_1', label: '3.1 Achieve Energy Security' },
      { key: 'SEA_3_2', label: '3.2 Promote Renewable Energy' },
    ],
  },
  {
    key: 'SEA_4',
    label: '4 — Healthcare',
    children: [
      { key: 'SEA_4_1', label: '4.1 Universal Healthcare Implementation' },
      { key: 'SEA_4_2', label: '4.2 Strengthen Primary Care' },
    ],
  },
  {
    key: 'SEA_5',
    label: '5 — Social Services',
    children: [
      { key: 'SEA_5_1', label: '5.1 4Ps and Social Safety Nets' },
      { key: 'SEA_5_2', label: '5.2 Pension and Senior Citizen Welfare' },
    ],
  },
  {
    key: 'SEA_6',
    label: '6 — Education',
    children: [
      { key: 'SEA_6_1', label: '6.1 Quality Basic Education' },
      { key: 'SEA_6_2', label: '6.2 Skills Training and TVET Expansion' },
    ],
  },
  {
    key: 'SEA_7',
    label: '7 — Bureaucratic Efficiency',
    children: [
      { key: 'SEA_7_1', label: '7.1 Digital Government Services' },
      { key: 'SEA_7_2', label: '7.2 Anti-Corruption Initiatives' },
    ],
  },
  {
    key: 'SEA_8',
    label: '8 — Sound Fiscal Management',
    children: [
      { key: 'SEA_8_1', label: '8.1 Tax Reform Continuity' },
      { key: 'SEA_8_2', label: '8.2 Public Financial Management' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers — used by detail page and chip displays to resolve key → label
// ─────────────────────────────────────────────────────────────────────────────

function flattenHierarchy(opts: HierarchyOption[]): HierarchyOption[] {
  const out: HierarchyOption[] = [];
  for (const o of opts) {
    out.push(o);
    if (o.children?.length) out.push(...flattenHierarchy(o.children));
  }
  return out;
}

const _likhaIndex  = new Map(flattenHierarchy(LIKHA_OPTIONS).map(o => [o.key, o.label]));
const _rdpIndex    = new Map(flattenHierarchy(RDP_OPTIONS).map(o => [o.key, o.label]));
const _seaIndex    = new Map(flattenHierarchy(SOCIOECONOMIC_OPTIONS).map(o => [o.key, o.label]));

export function labelForLikha(key: string): string { return _likhaIndex.get(key) || key; }
export function labelForRdp(key: string): string   { return _rdpIndex.get(key)   || key; }
export function labelForSea(key: string): string   { return _seaIndex.get(key)   || key; }

// ─────────────────────────────────────────────────────────────────────────────
// UN Sustainable Development Goals — flat, no sub-hierarchy (QQQ)
// ─────────────────────────────────────────────────────────────────────────────
export const SDG_OPTIONS: HierarchyOption[] = [
  { key: 'SDG_1',  label: 'SDG 1 — No Poverty' },
  { key: 'SDG_2',  label: 'SDG 2 — Zero Hunger' },
  { key: 'SDG_3',  label: 'SDG 3 — Good Health and Well-being' },
  { key: 'SDG_4',  label: 'SDG 4 — Quality Education' },
  { key: 'SDG_5',  label: 'SDG 5 — Gender Equality' },
  { key: 'SDG_6',  label: 'SDG 6 — Clean Water and Sanitation' },
  { key: 'SDG_7',  label: 'SDG 7 — Affordable and Clean Energy' },
  { key: 'SDG_8',  label: 'SDG 8 — Decent Work and Economic Growth' },
  { key: 'SDG_9',  label: 'SDG 9 — Industry, Innovation and Infrastructure' },
  { key: 'SDG_10', label: 'SDG 10 — Reduced Inequalities' },
  { key: 'SDG_11', label: 'SDG 11 — Sustainable Cities and Communities' },
  { key: 'SDG_12', label: 'SDG 12 — Responsible Consumption and Production' },
  { key: 'SDG_13', label: 'SDG 13 — Climate Action' },
  { key: 'SDG_14', label: 'SDG 14 — Life Below Water' },
  { key: 'SDG_15', label: 'SDG 15 — Life on Land' },
  { key: 'SDG_16', label: 'SDG 16 — Peace, Justice and Strong Institutions' },
  { key: 'SDG_17', label: 'SDG 17 — Partnerships for the Goals' },
];

const _sdgIndex = new Map(SDG_OPTIONS.map(o => [o.key, o.label]));
export function labelForSdg(key: string): string { return _sdgIndex.get(key) || key; }

/** Returns only leaf-level (independently selectable) keys from a hierarchy. */
export function leafKeysOf(opts: HierarchyOption[]): string[] {
  const out: string[] = [];
  const walk = (list: HierarchyOption[]) => {
    for (const o of list) {
      if (o.children?.length) walk(o.children);
      else out.push(o.key);
    }
  };
  walk(opts);
  return out;
}
