/**
 * Timeline Types - Centralized Timeline Event System
 * Supports synchronization between Gallery, Documents, and Timeline tabs
 */

export type TimelineEventType = 
  | 'milestone'           // Major project milestone
  | 'phase'               // Project phase
  | 'gallery_upload'      // Photo uploaded to gallery
  | 'document_upload'     // Document uploaded
  | 'financial_update'    // Financial data updated
  | 'physical_update'     // Physical progress updated
  | 'team_update'         // Team member added/changed
  | 'status_change';      // Project status changed

export type TimelineEventPriority = 'major' | 'minor';

export interface BaseTimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdBy: string;
  priority: TimelineEventPriority;
  
  // Linking to source
  sourceId?: string;          // ID of the source item (gallery/document/milestone)
  sourceType?: 'gallery' | 'document' | 'milestone' | 'phase';
  
  // Categorization
  phase?: string;             // Associated phase
  subTask?: string;           // Associated sub-task
  tags?: string[];            // Additional tags
  
  // Status
  status?: 'active' | 'completed' | 'pending' | 'cancelled';
  progress?: number;          // 0-100
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface MilestoneEvent extends BaseTimelineEvent {
  type: 'milestone';
  startDate?: string;
  endDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  durationDays?: number;
  varianceDays?: number;
}

export interface GalleryUploadEvent extends BaseTimelineEvent {
  type: 'gallery_upload';
  imageUrl: string;
  imageTitle: string;
  category: 'progress' | 'completed' | 'planning';
  containerId?: string;
}

export interface DocumentUploadEvent extends BaseTimelineEvent {
  type: 'document_upload';
  documentName: string;
  documentType: string;
  documentCategory?: 'report' | 'form' | 'assessment' | 'other';
  fileSize?: string;
}

export type TimelineEvent = 
  | MilestoneEvent 
  | GalleryUploadEvent 
  | DocumentUploadEvent 
  | BaseTimelineEvent;

export interface TimelineFilter {
  eventTypes?: TimelineEventType[];
  priority?: TimelineEventPriority[];
  dateFrom?: string;
  dateTo?: string;
  phase?: string;
  status?: string[];
  searchTerm?: string;
}

export interface TimelineSyncOptions {
  autoCreateTimelineEntry: boolean;
  defaultPriority: TimelineEventPriority;
  includeMetadata: boolean;
}
