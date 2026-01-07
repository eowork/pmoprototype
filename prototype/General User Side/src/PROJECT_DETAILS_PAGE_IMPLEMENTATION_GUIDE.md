# Project Details Page Implementation Guide
## Comprehensive AI Prompt for Building a Project Management Details Interface

---

## Overview

This document provides comprehensive instructions for implementing a professional, formal project details page suitable for institutional project management systems. The design prioritizes transparency, accessibility, and intuitive navigation with a clean, modern aesthetic.

---

## 1. DESIGN PHILOSOPHY & REQUIREMENTS

### Core Principles
- **Formal & Professional**: Use clean lines, ample white space, and structured layouts
- **Transparency-First**: All information should be clearly visible without authentication barriers
- **Intuitive Navigation**: Multi-tab interface with clear visual hierarchy
- **Responsive Design**: Mobile-first approach with tablet and desktop optimizations
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation

### Color Scheme
- **Primary Color**: Emerald/Green (`#059669`, `#10b981`, `#047857`)
  - Used for: Active states, primary actions, status indicators
- **Secondary Color**: Amber/Gold (`#d97706`, `#f59e0b`, `#b45309`)
  - Used for: Accents, warning states, secondary highlights
- **Neutral Colors**: Grays for text and backgrounds
  - Text: `#111827` (dark), `#374151` (medium), `#6b7280` (light)
  - Backgrounds: `#ffffff` (white), `#f9fafb` (light gray), `#f3f4f6` (gray)
- **Status Colors**:
  - Success/Completed: Emerald (`#059669`)
  - In Progress: Blue (`#2563eb`)
  - Warning/Pending: Amber (`#f59e0b`)
  - Error/Cancelled: Red (`#dc2626`)
  - Neutral/On Hold: Gray (`#6b7280`)

---

## 2. PAGE STRUCTURE & LAYOUT

### Container Setup
```
Max Width: 1280px (7xl)
Horizontal Padding: 
  - Mobile: 1rem (px-4)
  - Tablet: 1.5rem (sm:px-6)
  - Desktop: 2rem (lg:px-8)
Vertical Padding: 2rem (py-8)
Background: White or light gray
```

### Layout Hierarchy
1. **Breadcrumb Navigation** (Top)
2. **Back Button** (Below breadcrumb)
3. **Project Header** (Title, Description, Status)
4. **Tab Navigation Bar** (5 tabs)
5. **Tab Content Area** (Dynamic content)

---

## 3. NAVIGATION COMPONENTS

### A. Breadcrumb Navigation

**Purpose**: Show user location in site hierarchy

**Structure**:
```
Home > [Category Name] > [Project Title]
```

**Implementation Requirements**:
- Use Shadcn UI Breadcrumb component
- First item: "Home" (clickable, navigates to homepage)
- Second item: Category name (clickable, navigates to category page)
- Third item: Project title (current page, non-clickable)
- Separator: Use forward slash or chevron icon
- Margin bottom: 1.5rem (mb-6)

**Styling**:
- Links: Gray text with emerald hover color
- Current page: Emerald text color
- Hover state: `hover:text-emerald-600`
- Cursor: Pointer on clickable items

### B. Back Button

**Purpose**: Quick navigation to previous page

**Implementation Requirements**:
- Use Shadcn UI Button component with "ghost" variant
- Icon: ArrowLeft from lucide-react (positioned left of text)
- Text: "Back to [Category Name]"
- Margin bottom: 1.5rem (mb-6)

**Styling**:
- Base color: Emerald text (`text-emerald-600`)
- Hover: Darker emerald text with light emerald background
- Classes: `hover:text-emerald-700 hover:bg-emerald-50`

---

## 4. PROJECT HEADER SECTION

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│  [Title]                           [Status Badge]│
│  [Description]                     [Progress %]  │
└─────────────────────────────────────────────────┘
```

### A. Title Area (Left Side)

**Title**:
- Typography: 3xl font size, bold weight
- Color: Dark gray (`text-gray-900`)
- Margin bottom: 0.5rem (mb-2)
- Line height: Tight (leading-tight)

**Description**:
- Typography: Large font size, regular weight
- Color: Medium gray (`text-gray-600`)
- Max lines: 2-3 lines with ellipsis if longer

### B. Status Area (Right Side)

**Status Badge**:
- Use Shadcn UI Badge component
- Dynamic background color based on status:
  - Completed: `bg-emerald-100 text-emerald-800 border-emerald-200`
  - In Progress: `bg-blue-100 text-blue-800 border-blue-200`
  - Planning: `bg-amber-100 text-amber-800 border-amber-200`
  - On Hold: `bg-gray-100 text-gray-800 border-gray-200`
  - Cancelled: `bg-red-100 text-red-800 border-red-200`
- Include border: 1px solid
- Font: Small, medium weight, uppercase

**Progress Indicator**:
- Text: Small, light gray (`text-sm text-gray-500`)
- Format: "[X]% Complete"
- Margin top: 0.25rem (mt-1)
- Aligned: Right

**Container**:
- Flexbox: `flex items-start justify-between`
- Margin bottom: 2rem (mb-8)

---

## 5. TAB NAVIGATION SYSTEM

### Tab Structure (5 Tabs)
1. **Overview** - Project summary, details, and key metrics
2. **Timeline** - Milestones, schedule, and progress tracking
3. **Gallery** - Project images and visual documentation
4. **Documents** - Files, reports, and documentation
5. **Team** - Team members and contact information

### Implementation Requirements

**Container**:
- Use Shadcn UI Tabs component
- Space between tabs and content: 1.5rem (space-y-6)

**Tab List**:
- Layout: Grid with 5 equal columns (`grid grid-cols-5`)
- Background: White (`bg-white`)
- Border: 1px emerald border (`border border-emerald-200`)
- Shadow: Small shadow (`shadow-sm`)

**Individual Tab Triggers**:
- Active State:
  - Background: Emerald 600 (`bg-emerald-600`)
  - Text: White (`text-white`)
  - Shadow: Medium shadow (`shadow-md`)
  - Data attribute: `data-[state=active]:bg-emerald-600`
- Inactive/Hover State:
  - Background: Emerald 50 on hover (`hover:bg-emerald-50`)
  - Text: Default color
  - Transition: All properties with ease timing
- Classes: `data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-emerald-50 transition-all`

**Tab Content Areas**:
- Each TabsContent has `space-y-6` for vertical spacing
- Lazy loading: Only render active tab content
- Smooth transitions between tabs

---

## 6. TAB CONTENT SPECIFICATIONS

### Tab 1: OVERVIEW

**Purpose**: Display comprehensive project information at a glance

**Layout Structure**:
```
┌─────────────────────────┬───────────────┐
│  Project Details        │  Key Metrics  │
│  (Left Column - 2/3)    │  (Right - 1/3)│
├─────────────────────────┴───────────────┤
│  Progress Tracking (Full Width)         │
├──────────────────────────────────────────┤
│  Financial Information (Optional)        │
└──────────────────────────────────────────┘
```

**Components to Include**:

1. **Project Details Card** (Left, 2/3 width):
   - Use Shadcn UI Card component
   - Header: "Project Information" with Building2 icon
   - Content:
     - Location (MapPin icon, address)
     - Project Type (Briefcase icon, category)
     - Start Date (Calendar icon, formatted date)
     - End Date (Calendar icon, formatted date)
     - Budget (currency icon, formatted amount)
     - Contractor/Implementer (UserCheck icon, name)
   - Each item: Icon + Label + Value layout
   - Vertical spacing: 1rem between items

2. **Key Metrics Card** (Right, 1/3 width):
   - Header: "Project Metrics" with BarChart3 icon
   - Content:
     - Overall Progress (Progress bar + percentage)
     - Days Remaining/Elapsed (numeric indicator)
     - Budget Utilization (percentage)
     - Team Size (number of members)
   - Use Progress component from Shadcn UI
   - Color-coded metrics based on status

3. **Progress Tracking Section** (Full width):
   - Header: "Current Status" with TrendingUp icon
   - Visual progress bar with percentage
   - Status description text
   - Recent updates or milestones (list format)
   - Last updated timestamp

4. **Project Description** (Full width):
   - Header: "About This Project" with FileText icon
   - Full description paragraph(s)
   - Rich text formatting support
   - Line clamp with "Read more" expansion

**Card Styling**:
- Background: White
- Border: 1px light gray (`border-gray-200`)
- Border radius: 0.75rem (rounded-lg)
- Shadow: Small (`shadow-sm`)
- Hover: Slight shadow increase
- Padding: 1.5rem (p-6)

### Tab 2: TIMELINE

**Purpose**: Show project milestones, phases, and schedule

**Layout**:
```
┌──────────────────────────────────────────┐
│  Timeline Visualization                  │
├──────────────────────────────────────────┤
│  ○─────●─────●─────○─────○               │
│  Start  Phase1 Phase2 Phase3 Complete    │
├──────────────────────────────────────────┤
│  Milestones List                         │
│  ✓ Milestone 1 - Completed               │
│  ◉ Milestone 2 - In Progress             │
│  ○ Milestone 3 - Upcoming                │
└──────────────────────────────────────────┘
```

**Components**:

1. **Visual Timeline** (Top section):
   - Horizontal timeline with nodes
   - Color-coded phases:
     - Completed: Emerald green with checkmark
     - In Progress: Blue with pulse animation
     - Upcoming: Gray outline
   - Connecting lines between nodes
   - Date labels below each node

2. **Milestones List**:
   - Card-based layout for each milestone
   - Include:
     - Milestone title (bold)
     - Description
     - Target date
     - Status badge
     - Completion indicator (icon)
     - Responsible party
   - Chronological order (earliest to latest)
   - Visual distinction for completed vs pending

3. **Schedule Information**:
   - Start date with Calendar icon
   - Target completion date
   - Actual completion date (if finished)
   - Total duration
   - Days ahead/behind schedule indicator

**Interactivity**:
- Click on milestone to expand details
- Hover effects on timeline nodes
- Responsive stacking on mobile

### Tab 3: GALLERY

**Purpose**: Visual documentation of project through images

**Layout**:
```
┌─────────┬─────────┬─────────┐
│  Image  │  Image  │  Image  │
│    1    │    2    │    3    │
├─────────┼─────────┼─────────┤
│  Image  │  Image  │  Image  │
│    4    │    5    │    6    │
└─────────┴─────────┴─────────┘
```

**Implementation**:

1. **Grid Layout**:
   - Responsive grid:
     - Mobile: 1 column
     - Tablet: 2 columns
     - Desktop: 3 columns
   - Gap: 1.5rem (gap-6)
   - Equal aspect ratio for all images (4:3 or 16:9)

2. **Image Cards**:
   - Use Shadcn UI Card component
   - Image container with AspectRatio component
   - Image alt text for accessibility
   - Caption below image (optional)
   - Date taken/uploaded
   - Category tag (e.g., "Progress", "Completion", "Planning")

3. **Image Display**:
   - Lazy loading for performance
   - Thumbnail view by default
   - Click to open full-size lightbox/modal
   - Use Dialog component for lightbox
   - Navigation arrows in lightbox (previous/next)
   - Close button with X icon

4. **Empty State**:
   - Show placeholder if no images
   - Icon: ImageIcon from lucide-react
   - Message: "No images available yet"
   - Subtle gray background

**Styling**:
- Image hover effect: Scale slightly with shadow increase
- Border radius: 0.5rem (rounded-lg)
- Smooth transitions
- Loading skeleton while images load

### Tab 4: DOCUMENTS

**Purpose**: Provide access to project-related files and documentation

**Layout**:
```
┌──────────────────────────────────────────┐
│  📄 Document Name 1          [Download]  │
│  PDF • 2.5 MB • Jan 15, 2024             │
├──────────────────────────────────────────┤
│  📊 Document Name 2          [Download]  │
│  Excel • 1.2 MB • Jan 20, 2024           │
└──────────────────────────────────────────┘
```

**Implementation**:

1. **Document List**:
   - Each document as a Card or list item
   - Include:
     - File icon (based on type: PDF, Word, Excel, Image, etc.)
     - Document title/name
     - File type badge
     - File size
     - Upload date
     - Download button
     - View button (for previewable files)
   - Alternating background for better readability

2. **Document Categories** (Optional):
   - Group by category:
     - Contracts & Agreements
     - Technical Drawings
     - Progress Reports
     - Financial Documents
     - Permits & Approvals
   - Collapsible sections using Accordion component

3. **Action Buttons**:
   - Download: Button with Download icon
   - View/Preview: Button with Eye icon
   - External link: Button with ExternalLink icon (if hosted elsewhere)
   - Styling: Ghost or outline variant
   - Emerald color on hover

4. **Search/Filter** (Optional):
   - Search input at top
   - Filter by document type
   - Filter by date range
   - Sort options (name, date, size)

**Empty State**:
- Icon: FileText
- Message: "No documents uploaded yet"
- Description: "Project documents will appear here"

**Accessibility**:
- Clear labels for screen readers
- Keyboard navigation support
- File type announced for assistive tech

### Tab 5: TEAM

**Purpose**: Display project team members and contact information

**Layout**:
```
┌─────────────────────┬─────────────────────┐
│  [Avatar]           │  [Avatar]           │
│  John Doe           │  Jane Smith         │
│  Project Manager    │  Lead Engineer      │
│  ✉ email@edu.ph     │  ✉ email@edu.ph     │
│  📞 +63 123 4567    │  📞 +63 123 4567    │
└─────────────────────┴─────────────────────┘
```

**Implementation**:

1. **Team Grid**:
   - Responsive grid:
     - Mobile: 1 column
     - Tablet: 2 columns
     - Desktop: 3 columns
   - Gap: 1.5rem (gap-6)

2. **Team Member Card**:
   - Use Shadcn UI Card component
   - Include:
     - Avatar (use Avatar component or initials)
     - Full name (bold, medium font)
     - Role/Position
     - Department/Office
     - Email (with Mail icon, clickable mailto link)
     - Phone (with Phone icon, clickable tel link)
   - Center-aligned content
   - Padding: 1.5rem

3. **Avatar Styling**:
   - Size: 4rem (w-16 h-16)
   - Circular (rounded-full)
   - Background: Emerald gradient if no image
   - Initials: White text, first + last name
   - Border: 2px white with shadow

4. **Contact Links**:
   - Email: Emerald color, hover underline
   - Phone: Emerald color, hover underline
   - Icon + text layout
   - Small font size (text-sm)

5. **Team Hierarchy** (Optional):
   - Group by role (Leadership, Technical, Support)
   - Use section headers
   - Different badge colors for different roles

**Hover Effects**:
- Card lift: `transform -translate-y-1`
- Shadow increase
- Smooth transition

---

## 7. RESPONSIVE DESIGN BREAKPOINTS

### Mobile (< 640px)
- Single column layouts for all grids
- Stack header components vertically
- Full-width cards
- Simplified navigation
- Touch-friendly button sizes (min 44px)

### Tablet (640px - 1024px)
- 2-column grids for gallery and team
- Side-by-side cards in overview (if space permits)
- Maintain tab navigation
- Adjusted padding and spacing

### Desktop (> 1024px)
- 3-column grids for gallery and team
- Full 2/3 + 1/3 layout for overview
- Maximum container width (1280px)
- Optimal spacing and white space

---

## 8. COMPONENT LIBRARY USAGE

### Required Shadcn UI Components
1. **Card** (`Card`, `CardHeader`, `CardTitle`, `CardContent`)
2. **Button** (various variants)
3. **Badge** (status indicators)
4. **Tabs** (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`)
5. **Progress** (progress bars)
6. **Breadcrumb** (navigation)
7. **Dialog** (image lightbox, modals)
8. **Avatar** (team members)
9. **Separator** (dividing sections)
10. **AspectRatio** (image containers)

### Icon Library
- Use **lucide-react** for all icons
- Common icons:
  - Building2, MapPin, Calendar, TrendingUp
  - CheckCircle, Clock, Users, FileText
  - Download, Image, BarChart3, Target
  - PlayCircle, CheckCircle2, Eye
  - Mail, Phone, ArrowLeft, ExternalLink
  - Briefcase, UserCheck, CalendarDays

---

## 9. INTERACTION PATTERNS

### Tab Navigation
- Click to switch tabs
- Keyboard navigation (Arrow keys)
- Active tab visual feedback
- Smooth content transitions
- URL hash updates (optional)

### Buttons & Links
- Clear hover states (color change + background)
- Active/pressed states
- Loading states for actions
- Disabled states when appropriate

### Cards
- Subtle hover elevation
- Click to expand (if applicable)
- Smooth transitions (0.3s ease)

### Images
- Lazy loading
- Fade-in animation on load
- Zoom on hover (subtle scale)
- Click to open full view

---

## 10. ACCESSIBILITY REQUIREMENTS

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Landmark regions (header, main, nav, section)
- Lists for grouped content (ul, ol)

### ARIA Labels
- `aria-label` for icon-only buttons
- `aria-current="page"` for active breadcrumb
- `aria-selected` for active tabs
- `aria-labelledby` for sections

### Keyboard Navigation
- Tab order follows visual order
- All interactive elements keyboard accessible
- Focus visible indicators
- Enter/Space for button activation

### Screen Reader Support
- Alt text for all images
- Hidden labels for icon buttons
- Status announcements for dynamic content
- Skip navigation links

### Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text and UI components
- Status not conveyed by color alone

---

## 11. PERFORMANCE OPTIMIZATION

### Lazy Loading
- Images loaded on demand
- Tab content rendered only when active
- Defer non-critical resources

### Code Splitting
- Separate bundles for each tab (if using build tools)
- Dynamic imports for heavy components

### Image Optimization
- Responsive images (srcset)
- WebP format with fallbacks
- Appropriate compression
- Max width constraints

### Caching
- Browser caching for static assets
- API response caching (if applicable)

---

## 12. STYLING CONVENTIONS

### Tailwind CSS Classes (Primary Framework)
```css
/* Spacing */
p-4, p-6, p-8 (padding)
m-4, m-6, m-8 (margin)
space-y-4, space-y-6 (vertical spacing)
gap-4, gap-6 (grid/flex gap)

/* Typography */
text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
font-normal, font-medium, font-semibold, font-bold

/* Colors */
text-gray-600, text-gray-900
bg-white, bg-gray-50
border-gray-200, border-emerald-200

/* Layout */
flex, grid
items-center, justify-between
max-w-7xl, mx-auto

/* Borders & Shadows */
rounded-lg, rounded-full
shadow-sm, shadow-md
border, border-2

/* Hover States */
hover:bg-emerald-50
hover:text-emerald-700
hover:shadow-lg
transition-all
```

### Custom CSS (If Needed)
- Use CSS custom properties for theme colors
- Prefix custom classes with project name
- Follow BEM or similar naming convention

---

## 13. DATA STRUCTURE EXPECTATIONS

### Project Object Schema
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  progress: number; // 0-100
  startDate: string; // ISO date
  endDate: string; // ISO date
  location: string;
  projectType: string;
  budget: number;
  contractor: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  documents: Document[];
  images: Image[];
}
```

### Supporting Types
```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  completedDate?: string;
}

interface Document {
  id: string;
  name: string;
  type: string; // 'pdf', 'docx', 'xlsx', etc.
  size: number; // bytes
  uploadDate: string;
  url: string;
  category?: string;
}

interface Image {
  id: string;
  url: string;
  caption?: string;
  uploadDate: string;
  category?: string;
}
```

---

## 14. IMPLEMENTATION CHECKLIST

### Phase 1: Structure
- [ ] Set up page container with max-width
- [ ] Implement breadcrumb navigation
- [ ] Add back button
- [ ] Create project header layout

### Phase 2: Tab System
- [ ] Set up Tabs component structure
- [ ] Style tab navigation with active states
- [ ] Create 5 tab content containers
- [ ] Add smooth transitions

### Phase 3: Overview Tab
- [ ] Build project details card
- [ ] Build key metrics card
- [ ] Add progress tracking section
- [ ] Implement responsive layout

### Phase 4: Timeline Tab
- [ ] Create visual timeline component
- [ ] Build milestones list
- [ ] Add status indicators
- [ ] Style timeline nodes

### Phase 5: Gallery Tab
- [ ] Set up responsive image grid
- [ ] Implement image cards
- [ ] Add lightbox/modal functionality
- [ ] Add empty state

### Phase 6: Documents Tab
- [ ] Create document list layout
- [ ] Add file type icons
- [ ] Implement download buttons
- [ ] Add empty state

### Phase 7: Team Tab
- [ ] Set up team member grid
- [ ] Create team member cards
- [ ] Add avatar components
- [ ] Add contact links

### Phase 8: Polish
- [ ] Add all hover effects
- [ ] Test responsive design
- [ ] Verify accessibility
- [ ] Optimize performance
- [ ] Test keyboard navigation

---

## 15. EXAMPLE COLOR USAGE

### Status-Based Coloring Function
```javascript
function getStatusBadgeColor(status) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Planning':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'On Hold':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
```

---

## 16. FINAL NOTES

### Customization Points
- Adjust tab names based on project type
- Add/remove sections in Overview as needed
- Customize document categories for your domain
- Modify team roles and hierarchy
- Add institution-specific branding

### Best Practices
- Keep content scannable with clear headings
- Use progressive disclosure (show summary, expand for details)
- Provide clear calls-to-action
- Maintain consistency across all tabs
- Test with real data, not just placeholders

### Integration Considerations
- Backend API endpoints for data fetching
- Authentication/authorization for privileged actions
- Real-time updates for progress tracking
- File upload/download functionality
- Email/notification integrations

---

## SUMMARY

This implementation guide provides a complete blueprint for building a professional project details page with:
- ✅ Clean, institutional design aesthetic
- ✅ Comprehensive 5-tab information architecture
- ✅ Responsive, mobile-first layout
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Performance optimization
- ✅ Consistent emerald/gold color theme
- ✅ Reusable component patterns
- ✅ Extensible data structure

**Key Takeaway**: Focus on clarity, consistency, and user experience. Every element should serve a purpose in helping users understand project status, access resources, and contact team members efficiently.

---

*This guide is designed to be used as a comprehensive AI prompt for generating similar project detail pages in any institutional or organizational project management system.*
