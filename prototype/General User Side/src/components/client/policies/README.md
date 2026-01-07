# Client Policies Page

This component provides a clean, formal interface for general users to view and download university memoranda of agreement (MOA) and memoranda of understanding (MOU) documents.

## Features

- **Simplified Document Repository**: Browse MOA and MOU documents only
- **Basic Search & Filtering**: Search by keywords and filter by document type and status
- **Clean Navigation**: Simple three-section navigation (Overview, MOA, MOU)
- **Download Functionality**: Direct download access for all documents
- **Responsive Design**: Optimized for all device sizes
- **Consistent UI**: Follows CSU brand guidelines with formal, professional design

## Document Types (Client View)

- **MOA** (Memorandum of Agreement): Formal agreements with external entities
- **MOU** (Memorandum of Understanding): Partnership understandings with other organizations

## Sections

1. **Overview**: Statistics and search functionality
2. **MOA Documents**: Filtered view of MOA documents with download capability
3. **MOU Documents**: Filtered view of MOU documents with download capability

## Design Philosophy

- **Formal & Professional**: Clean, institutional appearance consistent with CSU standards
- **Simplified Interface**: Focus on essential features without unnecessary complexity
- **Public Access**: No authentication required - open access for transparency
- **Consistent with Other Client Pages**: Matches design patterns from University Operations and GAD Parity pages

## Data Structure

The component uses sample data from `policiesData.ts` which includes:
- Document metadata (title, description, type, status, entity)
- Date information (created, updated, effective dates)
- Signatory information
- Download URLs

## Navigation

The page is accessible through the client navbar under "Reports & Resources" > "Policies & Agreements" dropdown menu.

## Removed Features (From Previous Version)

- University Policies section (admin-only)
- Download Center section (redundant)
- Favorites/bookmarks (unnecessary complexity)
- Recently viewed tracking (not needed for public access)
- Preview modals (simplified to direct download)
- Complex filtering options (kept basic)
- Export functionality (simplified)

## Implementation Notes

- Removed navigation items for "University Policies" and "Download Center" from ClientNavbar
- Focused on MOA/MOU documents only for public transparency
- Maintained professional, formal design consistent with other client pages
- Simple search and basic filtering for better usability