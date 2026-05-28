# CSU CORE — COI OVERVIEW TAB AND POW GOVERNANCE REFINEMENT

## ROLE

You are a Principal Systems Architect, Construction Workflow Governance Engineer, UI/UX Systems Analyst, and Context Continuity Manager operating under:

- ACE Framework v2.4 (STRICT)
- ACE + CLAUDE.md Integration
- MIS Compliance
- KISS, SOLID, DRY

Your responsibility is to refine and normalize the COI Project Details architecture, specifically the:
- Overview Tab
- POW Tab
- Project Profile presentation layer

while preserving continuity across repeated modifications and refactors.

---

# OBJECTIVE

Return the system to:

- Phase 1: Research
- Phase 2: Plan

While ensuring:

- continuity across repeated development modifications
- synchronization between:
  - frontend forms
  - DTOs
  - entities
  - migrations
  - database schema
  - UI rendering
  - operational workflows

- stability and scalability of:
  - Project Overview
  - Project Profile
  - Program of Works (POW)
  - document preview integration

- no regression across:
  - Create Project
  - Edit Project
  - Project Details/Profile

---

# CONTINUITY REQUIREMENT (CRITICAL)

You MUST:

- extend existing research.md and plan.md
- preserve validated implementations
- avoid conflicting schema or UI assumptions
- maintain alignment with:
  - MikroORM migration governance
  - existing COI architecture
  - Figma MCP server references
  - extracted Project Profile attributes
  - extracted POW attributes

Do NOT duplicate previously resolved findings unnecessarily.

---

# A. POW TAB — PROJECT DETAILS PAGE GOVERNANCE

The POW tab inside the Project Details page must support enterprise-level infrastructure monitoring and DPWH/PD1096-aligned costing structures.

## REQUIRED TASKS

### 1. TOGGLE COLUMN SYSTEM

Implement a dynamic Toggle Columns feature because the POW structure contains many attributes.

Requirements:

- user-controlled column visibility
- configurable default visible columns
- persistent user preference state
- grouped column categories
- responsive behavior
- table readability preservation

Default visible columns should prioritize:

- Pay Item No
- Description
- Quantity
- Unit
- Unit Cost
- Material Cost
- Labor Cost
- Project Cost
- Accomplishment %
- Status
- Date of Entry
- Remarks

---

### 2. POW ATTRIBUTE INTEGRATION

You MUST merge and normalize the extracted POW attributes from:

- official Program of Works documents
- BOQ
- Variation Orders
- Detailed Cost Estimates
- DPWH/PD1096 references

Ensure the Project Details POW tab reflects:

- compliance-oriented fields
- operational tracking fields
- accomplishment tracking
- financial monitoring
- audit/governance fields

Required categories include:

- project header
- contract details
- cost summary
- pay items
- materials breakdown
- labor breakdown
- equipment breakdown
- indirect costs
- variation orders
- accomplishment tracking
- attachments/documents
- workflow approvals
- audit trails

---

# B. OVERVIEW TAB — PROJECT PROFILE INTEGRATION

The Overview tab must be refactored to combine:

1. Admin-side Figma MCP reference
2. Client-side Figma MCP reference
3. Official Project Profile document structure

---

## REQUIRED TASKS

### 1. PROJECT PROFILE ATTRIBUTE ADOPTION

The Overview tab must adapt and display the extracted Project Profile attributes including:

- Project Summary
- Project Description
- Objectives
- Implementing Agencies
- Spatial Information
- Development Priority Alignment
- Strategic Alignment
- Output Indicators
- Outcome Indicators
- Funding Information
- Cost Sharing
- Status Category
- Status Updates
- Readiness Documents
- Signatories
- Attachments

---

### 2. UI/UX REFACTOR

The Overview tab must merge:

- Figma client-side presentation behavior
- Figma admin-side operational layout
- official Project Profile structure

Requirements:

- executive overview layout
- expandable sections
- responsive cards
- strategic alignment section
- funding summary section
- implementation timeline section
- status indicators
- accomplishment summary
- document preview widgets
- stakeholder-friendly presentation

---

### 3. DOCUMENT PREVIEW SECTION

Add a dedicated Overview section for:

- Project Profile
- Feasibility Study
- Program of Works (POW)
- other key implementation documents

Requirements:

- preview card only
- redirect/open document action
- latest version indicator
- upload status
- approval status
- no inline editing in Overview

---

# C. AUTHORIZATION AND ACCESS GOVERNANCE

Ensure strict authorization implementation.

Required roles:

1. Oversight Role
- full visibility
- logs and audit access

2. Full Access Role
- create
- edit
- delete
- approve

3. View-Only Role
- read-only access

4. Restricted Editor Role
- edit specific tabs only
- restricted per section/tab

---

# D. CODEBASE STRUCTURE GOVERNANCE

Ensure proper scalable structure for:

- Admin Side
- Client Side

Requirements:

- modular separation
- reusable shared components
- isolated UI layers
- separate services/composables
- maintainable routing structure

---

# OUTPUT REQUIREMENTS

docs/research.md must include:

- POW governance analysis
- Overview tab refactor analysis
- Project Profile integration analysis
- UI/UX continuity assessment
- authorization/governance findings
- risks and constraints

docs/plan.md must include:

- POW integration strategy
- Overview tab restructuring plan
- document preview architecture
- authorization strategy
- codebase structure plan
- verification method per step

---

# FINAL RULE

The Project Details page must evolve into a unified infrastructure-management interface capable of presenting:

- operational monitoring
- project governance
- financial visibility
- accomplishment tracking
- compliance documentation
- executive-level project overview

while maintaining strict continuity with:
- Figma MCP references
- Project Profile documents
- official POW structures
- enterprise MIS architecture.


---

# PROJECT PROFILE / OVERVIEW TAB — EXTRACTED ATTRIBUTES

Source: Official Project Profile document for Construction of College of Forestry and Environmental Sciences Building Complex.

## Core Categories

- Core Project Information
- Project Description & Objectives
- Implementing / Responsible Agencies
- Spatial / Location Information
- Development Priority Alignment
- Results Matrix Indicators
- Strategic Alignment
- Output Indicators
- Outcome Indicators
- Implementation Period & Timeline
- Funding Information
- Cost Sharing
- Status Category & Project Readiness
- Status Updates & Remarks
- Implementation Readiness Documents
- Signatories & Approvals
- Attachments & Supporting Files
- Authorization & Access Control
- System Audit & Governance
- UI/UX Requirements

## Essential MVP Attributes

1. project_title
2. project_description
3. project_objectives
4. implementing_agency
5. project_location
6. funding_source
7. total_project_cost
8. implementation_period_start
9. implementation_period_end
10. project_status
11. project_status_category
12. strategic_alignment
13. output_indicators
14. outcome_indicators
15. status_updates
16. readiness_documents
17. attachments
18. signatories
19. created_at
20. updated_at
21. created_by
22. approval_status
23. implementation_status
24. audit_log_reference

## POW Tab Essential Governance Areas

- Toggle Column System
- Pay Item Governance
- Materials Breakdown
- Labor Breakdown
- Equipment Breakdown
- Indirect Cost Structure
- Variation Orders
- Accomplishment Tracking
- Financial Monitoring
- Workflow Approvals
- Audit Trails
- Attachments/Documents
