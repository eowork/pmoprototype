# GAD Parity and Knowledge Management System

## Overview
The GAD (Gender and Development) Parity and Knowledge Management System is a comprehensive platform for monitoring and analyzing gender parity across all university populations at Caraga State University.

## System Architecture

### Client Interface
- **File**: `GADParityKnowledgeManagementPage.tsx`
- **Purpose**: Public-facing interface for viewing gender parity data
- **Access**: No authentication required for viewing
- **Features**: Interactive radar charts, detailed tables, dynamic insights, announcements, programs, and resources

### Data Categories

#### 1. Students Tab
**Attributes Implemented:**
- Admission Gender Parity (by program/college)
- Graduation Gender Parity (by program/college)
- Male %, Female % distribution
- Parity Index calculations
- Key Performance Metrics

**Required Admin Attributes:**
- Program/College Name
- Academic Year
- Total Admitted/Graduates
- Male Count
- Female Count
- Male Percentage
- Female Percentage
- Gender Parity Index
- Completion Rate
- Year-over-Year Change

#### 2. Faculty Tab
**Attributes Implemented:**
- Undergraduate Colleges (CAA, CED, CCIS, CMNS, CHASS, COFES)
- Professional Schools (CEGS, School of Medicine, Graduate School)
- Gender distribution by college/school
- Total faculty count
- Male %, Female % by institution
- Parity Index: 0.82

**Required Admin Attributes:**
- College/School Name
- Total Faculty Count
- Male Faculty Count
- Female Faculty Count
- Male Percentage
- Female Percentage
- Position Level (Professor, Associate, Assistant, Instructor)
- Department/Division
- Leadership Roles
- Research Success Rate
- Publication Rates
- Promotion Equity Metrics

#### 3. Staff Tab
**Attributes Implemented:**
- Administrative Staff (Executive Management, Finance & Admin, HR, Procurement, Legal, Planning)
- Support Services Staff (Academic Support, Student Services, IT, Library, Facilities, Health)
- Gender distribution by department
- Total staff count
- Male %, Female % by department
- Parity Index: 0.88

**Required Admin Attributes:**
- Department Name
- Position Title
- Total Staff Count
- Male Staff Count
- Female Staff Count
- Male Percentage
- Female Percentage
- Job Level/Grade
- Salary Grade
- Service Type
- Training Hours Completed
- Promotion Rate
- Equal Pay Compliance Metrics

#### 4. PWD (Persons with Disabilities) Tab
**Attributes Implemented:**
- Population Distribution (Students, Faculty, Staff, Visiting Scholars, Community Members, Alumni)
- Support Services (Accessibility Support, Scholarships, Career Placement, Counseling, Assistive Technology, Academic Accommodations)
- Total beneficiaries
- Male %, Female % distribution
- Parity Index: 0.86

**Required Admin Attributes:**
- Category (Students/Faculty/Staff)
- Disability Type
- Total Count
- Male Count
- Female Count
- Male Percentage
- Female Percentage
- Service Name
- Utilization Rate
- Accessibility Compliance Level
- Support Services Access
- Facility Accessibility
- Technology Access
- Scholarship Program Data

#### 5. Indigenous People Tab
**Attributes Implemented:**
- Community Distribution (Students, Faculty, Staff, Community Leaders, Cultural Practitioners, Alumni)
- Support Programs (Scholarships, Cultural Programs, Leadership Training, Language Preservation, Skills Development, Livelihood Support)
- Total participants
- Male %, Female % distribution
- Parity Index: 0.92

**Required Admin Attributes:**
- Category (Students/Faculty/Staff/Leaders)
- Tribal Affiliation
- Total Count
- Male Count
- Female Count
- Male Percentage
- Female Percentage
- Program Name
- Participation Rate
- Scholarship Recipients
- Cultural Events Participation
- Leadership Representation
- Retention Rate
- Community Engagement Metrics

## Visual Components

### Dual Radar Charts
Each demographic tab features two professional radar charts:
- **Students**: Admission & Graduation Parity
- **Faculty**: Undergraduate Colleges & Professional Schools
- **Staff**: Administrative Staff & Support Services
- **PWD**: Population Distribution & Support Services
- **Indigenous People**: Community Distribution & Support Programs

### Key Insights Tables
Each tab includes comprehensive metrics:
- Parity Index (target ≥ 0.85)
- Specific performance indicators
- Target values
- Status badges (Excellent/Good/Improving)

### Comprehensive Distribution Tables
Clean, formal tables without redundant visual bars:
- Category/Program/Department names
- Total counts
- Male % and Female %
- Gender Balance status badges

## Dynamic Features

### Active Tab-Based Insights
The "Parity Insights & Analysis" section dynamically updates based on the selected tab:
- **Students**: Admission/Graduation indices, year-over-year change
- **Faculty**: Faculty parity, female leadership, research success
- **Staff**: Staff parity, senior management, equal pay compliance
- **PWD**: PWD parity, accessibility compliance, support utilization
- **Indigenous**: IP parity, female enrollment, cultural participation

### Responsive Design
- Mobile-friendly tables with horizontal scrolling
- Adaptive grid layouts
- Touch-optimized interactions
- Consistent purple color theme (#7c3aed primary, #a855f7 secondary)

## Admin Dashboard Requirements

### CRUD Operations Required
All data categories must support:
1. **Create**: Add new records for each demographic category
2. **Read**: View and filter existing records
3. **Update**: Edit demographic data and metrics
4. **Delete**: Remove outdated or incorrect records

### Data Management Interface
The admin dashboard should include:
- Form inputs for all required attributes
- Data validation
- Bulk upload capabilities (CSV/Excel)
- Export functionality
- Year/semester filtering
- Real-time parity calculations
- Audit logs for data changes

### Key Metrics Calculations
Automated calculations for:
- Gender Parity Index (Female/Male ratio)
- Percentage distributions
- Trend analysis
- Year-over-year comparisons
- Status categorization

## Additional Features

### Announcements System
- Carousel display with 3 visible cards
- Priority levels (High/Medium/Low)
- CRUD operations for Admin/Staff
- Date tracking

### Program Highlights
- Showcase successful GAD initiatives
- Impact metrics
- Participant information
- CRUD operations for Admin/Staff

### Downloadable Resources
- GAD policies and guidelines
- Research reports and studies
- Training materials
- Forms and templates
- Download tracking

## Design Standards

### Color Scheme
- Primary: Purple (#7c3aed)
- Secondary: Light Purple (#a855f7)
- Success: Green
- Warning: Amber
- Info: Blue

### Typography
- Formal, professional appearance
- Clear hierarchy
- Readable font sizes
- Consistent spacing

### Layout Principles
- Clean, minimal design
- Intuitive navigation
- Consistent card styling
- Professional table formatting
- Responsive breakpoints

## Data Privacy & Security

### Important Considerations
1. **No PII Collection**: The system should not collect personally identifiable information
2. **Aggregate Data Only**: All reports show aggregate statistics, not individual records
3. **Access Control**: Role-based permissions for data management
4. **Data Accuracy**: Regular validation and verification processes
5. **Audit Trail**: Track all data modifications

## Future Enhancements

### Planned Features
- Interactive data visualizations
- Trend forecasting
- Comparative analysis tools
- Report generation and export
- Email notifications for updates
- Advanced filtering and search
- Dashboard analytics

### Integration Opportunities
- Student Information System integration
- HR Management System integration
- Scholarship Management System integration
- Research Database integration

## Technical Notes

### Dependencies
- React with TypeScript
- Recharts for data visualization
- Shadcn UI components
- Lucide React icons
- Tailwind CSS for styling

### Performance Considerations
- Lazy loading for large datasets
- Efficient state management
- Optimized re-renders
- Responsive chart rendering

## Maintenance & Updates

### Regular Tasks
- Data accuracy verification (monthly)
- Metric recalculations (quarterly)
- System performance monitoring (continuous)
- User feedback collection (ongoing)
- Feature enhancements (as needed)

### Data Update Schedule
- Student data: End of each semester
- Faculty data: Beginning of academic year
- Staff data: Quarterly
- PWD data: As services are utilized
- Indigenous People data: Continuous tracking

## Support & Documentation

For questions or issues regarding the GAD Parity system, contact:
- PMO Dashboard Administrator
- GAD Focal Person
- IT Support Team

---

**Last Updated**: October 13, 2025
**Version**: 2.0
**Status**: Active Development
