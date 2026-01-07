import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner@2.0.3';
import { 
  Scale,
  Users,
  Award,
  Bell,
  FileText,
  BookOpen,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  Upload,
  Image as ImageIcon,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  Sparkles,
  LineChart,
  Shield,
  ChevronUp,
  GraduationCap,
  Building2,
  Accessibility,
  Globe
} from 'lucide-react';
import { ClientNavbar } from '../components/ClientNavbar';
import { NavigationProps, EditableSection } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import Slider from 'react-slick';

// ===== INTERFACES =====

// GAD Announcement Interface
interface GADAnnouncement {
  id: string;
  title: string;
  description: string;
  content: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Draft" | "Published" | "Archived";
  category: 
    | "Policy Update"
    | "Event Announcement" 
    | "Program Launch"
    | "Training"
    | "Research";
  author: string;
  authorRole: string;
  publishedDate: string;
  images: string[];
  attachments: {
    name: string;
    url: string;
    size: string;
    type: string;
  }[];
  viewCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Program Highlight Interface with Multi-Image Support
interface ProgramHighlight {
  id: string;
  title: string;
  description: string;
  impact: string;
  status: "Planned" | "Ongoing" | "Completed";
  completion: number;
  budget: number;
  beneficiaries: number;
  images: string[];
  mainImageIndex: number;
  createdAt: string;
  updatedAt: string;
}

// GAD Resource Interface
interface GADResource {
  id: string;
  title: string;
  description: string;
  type: "Policy Document" | "Training Manual" | "Research Report" | "Guidelines" | "Assessment Tool";
  downloadUrl: string;
  fileSize: string;
  lastUpdated: string;
  downloadCount: number;
  author: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Key Metric Interface
interface KeyMetric {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  target: string;
  status: "excellent" | "good" | "needs-improvement";
  category: string;
  editable: boolean;
}

interface GADParityKnowledgeManagementPageProps extends NavigationProps {
  currentSection?: string;
}

// ===== CUSTOM CAROUSEL COMPONENTS =====

const CustomPrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="carousel-arrow-prev"
    aria-label="Previous slide"
    title="Previous"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
);

const CustomNextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="carousel-arrow-next"
    aria-label="Next slide"
    title="Next"
  >
    <ChevronRight className="w-6 h-6" />
  </button>
);

// ===== MOCK DATA =====

const GAD_DATA = {
  heroMessage: {
    title: "GAD Parity & Knowledge Management",
    subtitle: "Gender and Development Framework Implementation"
  },
  
  keyMetrics: [
    {
      id: "metric-1",
      title: "Gender Parity Index",
      value: "0.87",
      subtitle: "Academic Programs",
      description: "Average gender balance across all academic programs",
      target: "≥ 0.90",
      status: "good" as const,
      category: "Education",
      editable: true,
    },
    {
      id: "metric-2", 
      title: "Female Leadership",
      value: "42%",
      subtitle: "Administrative Positions",
      description: "Women in key leadership and decision-making roles",
      target: "≥ 50%",
      status: "needs-improvement" as const,
      category: "Leadership",
      editable: true,
    },
    {
      id: "metric-3",
      title: "GAD Budget Allocation",
      value: "8.2%",
      subtitle: "Total University Budget",
      description: "Percentage of budget allocated to GAD programs",
      target: "≥ 5%",
      status: "excellent" as const,
      category: "Finance",
      editable: true,
    }
  ] as KeyMetric[],

  parityData: {
    admission: [
      { subject: "Engineering", male: 65, female: 35 },
      { subject: "Education", male: 25, female: 75 },
      { subject: "Business", male: 48, female: 52 },
      { subject: "Health Sciences", male: 30, female: 70 },
      { subject: "Arts & Sciences", male: 45, female: 55 },
      { subject: "Agriculture", male: 60, female: 40 },
    ],
    graduation: [
      { subject: "Engineering", male: 62, female: 38 },
      { subject: "Education", male: 22, female: 78 },
      { subject: "Business", male: 46, female: 54 },
      { subject: "Health Sciences", male: 28, female: 72 },
      { subject: "Arts & Sciences", male: 43, female: 57 },
      { subject: "Agriculture", male: 58, female: 42 },
    ]
  },

  parityInsights: {
    overall: {
      admissionParityIndex: 0.87,
      graduationParityIndex: 0.89,
      yearOverYearChange: "+3.2%",
      trend: "improving" as const
    },
    strengths: [
      {
        title: "Education Excellence", 
        description: "Strong female representation in Education programs with high completion rates.",
        impact: "78% female graduation rate demonstrates program effectiveness"
      },
      {
        title: "Health Sciences Leadership",
        description: "Exceptional gender balance and academic performance in health-related fields.",
        impact: "72% female graduates leading healthcare innovation"
      }
    ],
    improvements: [
      {
        title: "Engineering Engagement",
        description: "Significant gender gap in engineering programs requiring targeted outreach.",
        action: "Implement STEM mentorship programs and scholarship initiatives for female students"
      },
      {
        title: "Agriculture Modernization", 
        description: "Traditional gender patterns persist in agricultural programs.",
        action: "Develop agri-tech programs highlighting technology and sustainability aspects"
      }
    ]
  },

  announcements: [
    {
      id: "ann-1",
      title: "International Women's Day Celebration 2024",
      description: "Join us in celebrating the achievements of women in academia and recognizing outstanding contributions to gender equality.",
      content: "This year's celebration will feature keynote speeches, panel discussions, and recognition ceremonies.",
      priority: "High" as const,
      status: "Published" as const,
      category: "Event Announcement" as const,
      author: "Dr. Maria Santos",
      authorRole: "GAD Focal Person",
      publishedDate: "2024-12-01",
      images: [
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop"
      ],
      attachments: [],
      viewCount: 2340,
      featured: true,
      createdAt: "2024-11-28",
      updatedAt: "2024-12-01",
    },
    {
      id: "ann-2", 
      title: "Gender Sensitivity Training Workshop",
      description: "Mandatory training session for all faculty and staff to enhance understanding of gender issues and inclusive practices.",
      content: "The comprehensive training covers gender terminology, inclusive language, and best practices for creating supportive environments.",
      priority: "Medium" as const,
      status: "Published" as const,
      category: "Training" as const,
      author: "Prof. Elena Rodriguez",
      authorRole: "Training Coordinator",
      publishedDate: "2024-11-28",
      images: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
      ],
      attachments: [
        {
          name: "Training Module 1.pdf",
          url: "#",
          size: "2.3 MB",
          type: "PDF"
        }
      ],
      viewCount: 1876,
      featured: false,
      createdAt: "2024-11-25",
      updatedAt: "2024-11-28",
    },
    {
      id: "ann-3",
      title: "Research Grant for Gender Studies",
      description: "New funding opportunities available for research projects focusing on gender equality and women's empowerment in higher education.",
      content: "The grant program supports innovative research that addresses gender disparities and promotes inclusive practices.",
      priority: "High" as const,
      status: "Published" as const,
      category: "Research" as const,
      author: "Dr. Carmen Lopez",
      authorRole: "Research Director",
      publishedDate: "2024-11-25",
      images: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop"
      ],
      attachments: [],
      viewCount: 1420,
      featured: false,
      createdAt: "2024-11-22",
      updatedAt: "2024-11-25",
    }
  ] as GADAnnouncement[],

  programHighlights: [
    {
      id: "highlight-1",
      title: "Women in STEM Excellence Program",
      description: "Comprehensive initiative to increase female participation and success in Science, Technology, Engineering, and Mathematics fields.",
      impact: "200+ female students supported with 85% completion rate and improved career prospects in STEM industries.",
      status: "Ongoing" as const,
      completion: 75,
      budget: 2500000,
      beneficiaries: 245,
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop"
      ],
      mainImageIndex: 0,
      createdAt: "2024-01-15",
      updatedAt: "2024-11-30",
    },
    {
      id: "highlight-2",
      title: "Leadership Development for Women Faculty",
      description: "Strategic program designed to prepare women faculty members for leadership roles in academic and administrative positions.",
      impact: "40 women faculty trained, with 12 promoted to leadership positions including department heads and program directors.",
      status: "Completed" as const,
      completion: 100,
      budget: 1800000,
      beneficiaries: 52,
      images: [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
      ],
      mainImageIndex: 0,
      createdAt: "2024-02-01",
      updatedAt: "2024-10-31",
    },
    {
      id: "highlight-3",
      title: "Gender-Responsive Campus Infrastructure",
      description: "Comprehensive renovation and development of campus facilities to ensure gender-sensitive and inclusive physical environments.",
      impact: "Enhanced safety and accessibility for all students with improved lighting, gender-neutral facilities, and nursing stations.",
      status: "Planned" as const,
      completion: 25,
      budget: 5200000,
      beneficiaries: 8500,
      images: [
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop"
      ],
      mainImageIndex: 0,
      createdAt: "2024-03-10",
      updatedAt: "2024-11-15",
    }
  ] as ProgramHighlight[],

  resources: [
    {
      id: "resource-1",
      title: "GAD Implementation Guidelines 2024",
      description: "Comprehensive manual for implementing gender and development programs across all university departments and academic units.",
      type: "Guidelines" as const,
      downloadUrl: "#",
      fileSize: "4.2 MB",
      lastUpdated: "December 1, 2024",
      downloadCount: 1247,
      author: "University GAD Committee",
      category: "Implementation",
      icon: BookOpen,
    },
    {
      id: "resource-2",
      title: "Gender-Sensitive Language Manual",
      description: "Style guide for inclusive communication and gender-sensitive language in academic and administrative contexts.",
      type: "Training Manual" as const,
      downloadUrl: "#", 
      fileSize: "1.8 MB",
      lastUpdated: "November 28, 2024",
      downloadCount: 892,
      author: "Communication Department",
      category: "Language",
      icon: FileText,
    },
    {
      id: "resource-3",
      title: "Campus Safety Assessment Framework",
      description: "Evaluation tool for assessing and improving campus safety from a gender perspective, including physical and social safety measures.",
      type: "Assessment Tool" as const,
      downloadUrl: "#",
      fileSize: "2.1 MB", 
      lastUpdated: "November 25, 2024",
      downloadCount: 634,
      author: "Campus Safety Committee",
      category: "Safety",
      icon: Shield,
    },
    {
      id: "resource-4",
      title: "Annual Gender Parity Report 2024",
      description: "Detailed analysis of gender representation across academic programs, faculty positions, and student leadership roles.",
      type: "Research Report" as const,
      downloadUrl: "#",
      fileSize: "6.5 MB",
      lastUpdated: "November 20, 2024", 
      downloadCount: 1523,
      author: "Institutional Research Office",
      category: "Research",
      icon: BarChart3,
    }
  ] as GADResource[],

  // FACULTY DATA - Undergraduate and Professional Schools
  facultyData: {
    distribution: [
      { subject: "CAA", male: 68, female: 32, total: 42 },
      { subject: "CED", male: 35, female: 65, total: 58 },
      { subject: "CCIS", male: 72, female: 28, total: 38 },
      { subject: "CMNS", male: 58, female: 42, total: 45 },
      { subject: "CHASS", male: 42, female: 58, total: 52 },
      { subject: "COFES", male: 65, female: 35, total: 36 },
      { subject: "CEGS", male: 75, female: 25, total: 48 },
    ],
    professional: [
      { subject: "School of Medicine", male: 52, female: 48, total: 34 },
      { subject: "Graduate School", male: 48, female: 52, total: 28 },
    ],
    fullDetails: [
      { name: "CAA (College of Agriculture and Agri-Industries)", male: 68, female: 32, total: 42 },
      { name: "CED (College of Education)", male: 35, female: 65, total: 58 },
      { name: "CCIS (College of Computing and Information Sciences)", male: 72, female: 28, total: 38 },
      { name: "CMNS (College of Mathematics and Natural Sciences)", male: 58, female: 42, total: 45 },
      { name: "CHASS (College of Humanities, Arts and Social Sciences)", male: 42, female: 58, total: 52 },
      { name: "COFES (College of Forestry and Environmental Sciences)", male: 65, female: 35, total: 36 },
      { name: "CEGS (College of Engineering and Geo-Sciences)", male: 75, female: 25, total: 48 },
      { name: "School of Medicine", male: 52, female: 48, total: 34 },
      { name: "Graduate School", male: 48, female: 52, total: 28 },
    ]
  },

  // STAFF DATA
  staffData: {
    administrative: [
      { subject: "Executive Management", male: 55, female: 45, total: 22 },
      { subject: "Finance & Admin", male: 42, female: 58, total: 36 },
      { subject: "HR & Personnel", male: 38, female: 62, total: 28 },
      { subject: "Procurement", male: 48, female: 52, total: 24 },
      { subject: "Legal & Compliance", male: 52, female: 48, total: 16 },
      { subject: "Planning & Dev", male: 50, female: 50, total: 20 },
    ],
    support: [
      { subject: "Academic Support", male: 35, female: 65, total: 48 },
      { subject: "Student Services", male: 28, female: 72, total: 52 },
      { subject: "IT Services", male: 70, female: 30, total: 28 },
      { subject: "Library Services", male: 25, female: 75, total: 18 },
      { subject: "Facilities Mgmt", male: 65, female: 35, total: 32 },
      { subject: "Health Services", male: 30, female: 70, total: 22 },
    ]
  },

  // PWD DATA
  pwdData: {
    population: [
      { subject: "Students", male: 58, female: 42, total: 38 },
      { subject: "Faculty", male: 60, female: 40, total: 12 },
      { subject: "Staff", male: 52, female: 48, total: 15 },
      { subject: "Visiting Scholars", male: 55, female: 45, total: 8 },
      { subject: "Community Members", male: 50, female: 50, total: 25 },
      { subject: "Alumni Network", male: 54, female: 46, total: 18 },
    ],
    services: [
      { subject: "Accessibility Support", male: 50, female: 50, total: 65 },
      { subject: "Scholarship Programs", male: 45, female: 55, total: 28 },
      { subject: "Career Placement", male: 55, female: 45, total: 22 },
      { subject: "Counseling Services", male: 42, female: 58, total: 35 },
      { subject: "Assistive Technology", male: 52, female: 48, total: 40 },
      { subject: "Academic Accommodations", male: 48, female: 52, total: 55 },
    ]
  },

  // INDIGENOUS PEOPLE DATA
  indigenousData: {
    community: [
      { subject: "Students", male: 52, female: 48, total: 124 },
      { subject: "Faculty", male: 55, female: 45, total: 18 },
      { subject: "Staff", male: 48, female: 52, total: 14 },
      { subject: "Community Leaders", male: 58, female: 42, total: 32 },
      { subject: "Cultural Practitioners", male: 50, female: 50, total: 28 },
      { subject: "Alumni Network", male: 51, female: 49, total: 45 },
    ],
    programs: [
      { subject: "Scholarship Programs", male: 46, female: 54, total: 85 },
      { subject: "Cultural Programs", male: 50, female: 50, total: 156 },
      { subject: "Leadership Training", male: 60, female: 40, total: 22 },
      { subject: "Language Preservation", male: 48, female: 52, total: 38 },
      { subject: "Skills Development", male: 52, female: 48, total: 62 },
      { subject: "Livelihood Support", male: 54, female: 46, total: 48 },
    ]
  }
};

// ===== MAIN COMPONENT =====

export default function GADParityKnowledgeManagementPage({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  userRole = "Client",
  userProfile,
  requireAuth,
  onAuthModalSignIn,
  demoMode = false,
  currentSection = "overview",
}: GADParityKnowledgeManagementPageProps) {
  const [activeSection, setActiveSection] = useState(currentSection);
  const [isNavigating, setIsNavigating] = useState(false);
  const [yearFilter, setYearFilter] = useState<'2025' | '2024' | '2023'>('2025');
  const [activeTab, setActiveTab] = useState('students');

  // ===== YEAR-SPECIFIC DATA =====
  
  const getYearSpecificData = useMemo(() => {
    const yearDataMap: Record<string, any> = {
      '2025': {
        keyMetrics: [
          {
            id: "metric-1",
            title: "Gender Parity Index",
            value: "0.92",
            subtitle: "Academic Programs",
            description: "Average gender balance across all academic programs",
            target: "≥ 0.90",
            status: "excellent" as const,
            category: "Education",
            editable: true,
          },
          {
            id: "metric-2",
            title: "Female Leadership",
            value: "48%",
            subtitle: "Administrative Positions",
            description: "Women in key leadership and decision-making roles",
            target: "≥ 50%",
            status: "good" as const,
            category: "Leadership",
            editable: true,
          },
          {
            id: "metric-3",
            title: "GAD Budget Allocation",
            value: "8.8%",
            subtitle: "Total University Budget",
            description: "Percentage of budget allocated to GAD programs",
            target: "≥ 5%",
            status: "excellent" as const,
            category: "Finance",
            editable: true,
          }
        ],
        parityData: {
          admission: [
            { subject: "Engineering", male: 62, female: 38 },
            { subject: "Education", male: 23, female: 77 },
            { subject: "Business", male: 47, female: 53 },
            { subject: "Health Sciences", male: 28, female: 72 },
            { subject: "Arts & Sciences", male: 44, female: 56 },
            { subject: "Agriculture", male: 58, female: 42 },
          ],
          graduation: [
            { subject: "Engineering", male: 60, female: 40 },
            { subject: "Education", male: 20, female: 80 },
            { subject: "Business", male: 45, female: 55 },
            { subject: "Health Sciences", male: 26, female: 74 },
            { subject: "Arts & Sciences", male: 42, female: 58 },
            { subject: "Agriculture", male: 56, female: 44 },
          ]
        },
        parityInsights: {
          overall: {
            admissionParityIndex: 0.91,
            graduationParityIndex: 0.92,
            yearOverYearChange: "+5.1%",
            trend: "improving" as const
          },
          strengths: [
            {
              title: "Education Excellence",
              description: "Strong female representation in Education programs with high completion rates.",
              impact: "80% female graduation rate demonstrates program effectiveness"
            },
            {
              title: "Health Sciences Leadership",
              description: "Exceptional gender balance and academic performance in health-related fields.",
              impact: "74% female graduates leading healthcare innovation"
            }
          ],
          improvements: [
            {
              title: "Engineering Engagement",
              description: "Significant gender gap in engineering programs requiring targeted outreach.",
              action: "Implement STEM mentorship programs and scholarship initiatives for female students"
            },
            {
              title: "Agriculture Modernization",
              description: "Traditional gender patterns persist in agricultural programs.",
              action: "Develop agri-tech programs highlighting technology and sustainability aspects"
            }
          ]
        }
      },
      '2024': {
        keyMetrics: [
          {
            id: "metric-1",
            title: "Gender Parity Index",
            value: "0.87",
            subtitle: "Academic Programs",
            description: "Average gender balance across all academic programs",
            target: "≥ 0.90",
            status: "good" as const,
            category: "Education",
            editable: true,
          },
          {
            id: "metric-2",
            title: "Female Leadership",
            value: "42%",
            subtitle: "Administrative Positions",
            description: "Women in key leadership and decision-making roles",
            target: "≥ 50%",
            status: "needs-improvement" as const,
            category: "Leadership",
            editable: true,
          },
          {
            id: "metric-3",
            title: "GAD Budget Allocation",
            value: "8.2%",
            subtitle: "Total University Budget",
            description: "Percentage of budget allocated to GAD programs",
            target: "≥ 5%",
            status: "excellent" as const,
            category: "Finance",
            editable: true,
          }
        ],
        parityData: {
          admission: [
            { subject: "Engineering", male: 65, female: 35 },
            { subject: "Education", male: 25, female: 75 },
            { subject: "Business", male: 48, female: 52 },
            { subject: "Health Sciences", male: 30, female: 70 },
            { subject: "Arts & Sciences", male: 45, female: 55 },
            { subject: "Agriculture", male: 60, female: 40 },
          ],
          graduation: [
            { subject: "Engineering", male: 62, female: 38 },
            { subject: "Education", male: 22, female: 78 },
            { subject: "Business", male: 46, female: 54 },
            { subject: "Health Sciences", male: 28, female: 72 },
            { subject: "Arts & Sciences", male: 43, female: 57 },
            { subject: "Agriculture", male: 58, female: 42 },
          ]
        },
        parityInsights: {
          overall: {
            admissionParityIndex: 0.87,
            graduationParityIndex: 0.89,
            yearOverYearChange: "+3.2%",
            trend: "improving" as const
          },
          strengths: [
            {
              title: "Education Excellence",
              description: "Strong female representation in Education programs with high completion rates.",
              impact: "78% female graduation rate demonstrates program effectiveness"
            },
            {
              title: "Health Sciences Leadership",
              description: "Exceptional gender balance and academic performance in health-related fields.",
              impact: "72% female graduates leading healthcare innovation"
            }
          ],
          improvements: [
            {
              title: "Engineering Engagement",
              description: "Significant gender gap in engineering programs requiring targeted outreach.",
              action: "Implement STEM mentorship programs and scholarship initiatives for female students"
            },
            {
              title: "Agriculture Modernization",
              description: "Traditional gender patterns persist in agricultural programs.",
              action: "Develop agri-tech programs highlighting technology and sustainability aspects"
            }
          ]
        }
      },
      '2023': {
        keyMetrics: [
          {
            id: "metric-1",
            title: "Gender Parity Index",
            value: "0.84",
            subtitle: "Academic Programs",
            description: "Average gender balance across all academic programs",
            target: "≥ 0.90",
            status: "good" as const,
            category: "Education",
            editable: true,
          },
          {
            id: "metric-2",
            title: "Female Leadership",
            value: "38%",
            subtitle: "Administrative Positions",
            description: "Women in key leadership and decision-making roles",
            target: "≥ 50%",
            status: "needs-improvement" as const,
            category: "Leadership",
            editable: true,
          },
          {
            id: "metric-3",
            title: "GAD Budget Allocation",
            value: "7.5%",
            subtitle: "Total University Budget",
            description: "Percentage of budget allocated to GAD programs",
            target: "≥ 5%",
            status: "excellent" as const,
            category: "Finance",
            editable: true,
          }
        ],
        parityData: {
          admission: [
            { subject: "Engineering", male: 68, female: 32 },
            { subject: "Education", male: 27, female: 73 },
            { subject: "Business", male: 50, female: 50 },
            { subject: "Health Sciences", male: 32, female: 68 },
            { subject: "Arts & Sciences", male: 46, female: 54 },
            { subject: "Agriculture", male: 63, female: 37 },
          ],
          graduation: [
            { subject: "Engineering", male: 65, female: 35 },
            { subject: "Education", male: 24, female: 76 },
            { subject: "Business", male: 48, female: 52 },
            { subject: "Health Sciences", male: 30, female: 70 },
            { subject: "Arts & Sciences", male: 45, female: 55 },
            { subject: "Agriculture", male: 60, female: 40 },
          ]
        },
        parityInsights: {
          overall: {
            admissionParityIndex: 0.84,
            graduationParityIndex: 0.86,
            yearOverYearChange: "+2.1%",
            trend: "improving" as const
          },
          strengths: [
            {
              title: "Education Excellence",
              description: "Strong female representation in Education programs with high completion rates.",
              impact: "76% female graduation rate demonstrates program effectiveness"
            },
            {
              title: "Health Sciences Leadership",
              description: "Exceptional gender balance and academic performance in health-related fields.",
              impact: "70% female graduates leading healthcare innovation"
            }
          ],
          improvements: [
            {
              title: "Engineering Engagement",
              description: "Significant gender gap in engineering programs requiring targeted outreach.",
              action: "Implement STEM mentorship programs and scholarship initiatives for female students"
            },
            {
              title: "Agriculture Modernization",
              description: "Traditional gender patterns persist in agricultural programs.",
              action: "Develop agri-tech programs highlighting technology and sustainability aspects"
            }
          ]
        }
      }
    };
    
    return yearDataMap[yearFilter] || yearDataMap['2025'];
  }, [yearFilter]);

  // ===== FIXED RBAC IMPLEMENTATION =====
  
  // FIXED: Direct role-based permission checks without double-wrapping
  const isAdmin = useMemo(() => {
    const result = userProfile?.role === 'Admin';
    console.log('🔐 GAD Parity RBAC - isAdmin:', { 
      userProfile: userProfile?.name, 
      role: userProfile?.role, 
      result 
    });
    return result;
  }, [userProfile]);

  const canEdit = useMemo(() => {
    const result = userProfile?.role === 'Admin' || userProfile?.role === 'Staff';
    console.log('🔐 GAD Parity RBAC - canEdit:', { 
      userProfile: userProfile?.name, 
      role: userProfile?.role, 
      result 
    });
    return result;
  }, [userProfile]);

  const canCreate = useMemo(() => {
    const result = userProfile?.role === 'Admin' || userProfile?.role === 'Staff';
    console.log('🔐 GAD Parity RBAC - canCreate:', { 
      userProfile: userProfile?.name, 
      role: userProfile?.role, 
      result 
    });
    return result;
  }, [userProfile]);

  const canDelete = useMemo(() => {
    const result = userProfile?.role === 'Admin';
    console.log('🔐 GAD Parity RBAC - canDelete:', { 
      userProfile: userProfile?.name, 
      role: userProfile?.role, 
      result 
    });
    return result;
  }, [userProfile]);

  // ===== COMPREHENSIVE DEBUG LOG =====
  useEffect(() => {
    console.log('🔐 GAD Parity RBAC Status:', {
      userRole,
      userProfile,
      isAdmin,
      canCreate,
      canEdit,
      canDelete,
      hasUserProfile: !!userProfile,
      permissions: {
        canCreate,
        canEdit, 
        canDelete,
        canView: true
      }
    });
  }, [userProfile, userRole, isAdmin, canCreate, canEdit, canDelete]);

  // ===== STATE MANAGEMENT =====
  
  // Enhanced CRUD State Management
  const [keyMetrics, setKeyMetrics] = useState<KeyMetric[]>(GAD_DATA.keyMetrics);
  const [announcements, setAnnouncements] = useState<GADAnnouncement[]>(GAD_DATA.announcements);
  const [programHighlights, setProgramHighlights] = useState<ProgramHighlight[]>(GAD_DATA.programHighlights);
  const [resources, setResources] = useState<GADResource[]>(GAD_DATA.resources);
  
  // Metric CRUD state
  const [editingMetric, setEditingMetric] = useState<KeyMetric | null>(null);
  const [showMetricDialog, setShowMetricDialog] = useState(false);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  
  // Announcement CRUD state
  const [editingAnnouncement, setEditingAnnouncement] = useState<GADAnnouncement | null>(null);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [announcementImages, setAnnouncementImages] = useState<string[]>([]);
  const [announcementAttachments, setAnnouncementAttachments] = useState<GADAnnouncement['attachments']>([]);
  
  // Program Highlight CRUD state
  const [editingHighlight, setEditingHighlight] = useState<ProgramHighlight | null>(null);
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);
  const [isAddingHighlight, setIsAddingHighlight] = useState(false);
  const [highlightImages, setHighlightImages] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  
  // Resource CRUD state
  const [editingResource, setEditingResource] = useState<GADResource | null>(null);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [isAddingResource, setIsAddingResource] = useState(false);
  
  // Content editing state
  const [editableContent, setEditableContent] = useState<EditableSection[]>([
    {
      id: "hero-title",
      title: "Hero Title",
      content: GAD_DATA.heroMessage.title,
      editable: true,
    },
    {
      id: "hero-subtitle", 
      title: "Hero Subtitle",
      content: GAD_DATA.heroMessage.subtitle,
      editable: true,
    }
  ]);
  
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // ===== NAVIGATION LOGIC =====
  
  const navigationSections = [
    { id: "parity-analysis", label: "Parity Analysis", icon: BarChart3 },
    { id: "parity-insights", label: "Insights", icon: Sparkles },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "program-highlights", label: "Programs", icon: Award },
    { id: "resources", label: "Resources", icon: BookOpen },
  ];

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  // Enhanced scroll function
  const scrollToSection = (sectionId: string, fromButton = false) => {
    if (fromButton) {
      setIsNavigating(true);
      setActiveSection(sectionId);
    }

    const performEnhancedScroll = () => {
      const element = document.getElementById(sectionId);

      if (!element) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setActiveSection("overview");
        return;
      }

      const clientNavbar = document.querySelector(".client-navbar");
      const stickyNav = document.querySelector("[data-sticky-nav]");

      let totalOffset = 30;

      if (clientNavbar) {
        totalOffset += clientNavbar.getBoundingClientRect().height;
      }

      if (stickyNav && stickyNav !== clientNavbar) {
        totalOffset += stickyNav.getBoundingClientRect().height;
      }

      const elementRect = element.getBoundingClientRect();
      const elementPosition = elementRect.top + window.pageYOffset;
      const targetPosition = Math.max(0, elementPosition - totalOffset);

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (!fromButton) {
          setActiveSection(sectionId);
        }

        element.classList.add("section-highlight");
        setTimeout(() => {
          element.classList.remove("section-highlight");
        }, 1500);

        if (fromButton) {
          setIsNavigating(false);
        }
      }, 500);
    };

    requestAnimationFrame(() => {
      setTimeout(performEnhancedScroll, 50);
    });
  };

  const handleSectionChange = (sectionId: string) => {
    scrollToSection(sectionId, true);
  };

  // Enhanced scroll detection
  useEffect(() => {
    let isScrolling = false;
    let scrollTimer: NodeJS.Timeout;

    const handleScrollDetection = () => {
      if (isScrolling || isNavigating) return;

      const clientNavbar = document.querySelector(".client-navbar");
      const stickyNav = document.querySelector("[data-sticky-nav]");

      let offset = 150;

      if (clientNavbar) {
        offset += clientNavbar.getBoundingClientRect().height;
      }

      if (stickyNav) {
        offset += stickyNav.getBoundingClientRect().height;
      }

      const sections = navigationSections.map(section => section.id);
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom >= offset) {
            if (activeSection !== sectionId) {
              setActiveSection(sectionId);
            }
            break;
          }
        }
      }
    };

    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimer);
      
      handleScrollDetection();
      
      scrollTimer = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [activeSection, isNavigating, navigationSections]);

  // ===== UTILITY FUNCTIONS =====
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getPriorityColor = (priority: GADAnnouncement['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHighlightStatusColor = (status: ProgramHighlight['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ongoing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planned': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ===== CRUD FUNCTIONS =====

  // Content editing functions
  const handleSaveContent = (sectionId: string, newContent: string) => {
    setEditableContent(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, content: newContent }
          : section
      )
    );
    setEditingSection(null);
    toast.success('Content updated successfully');
  };

  // Metric CRUD Functions
  const handleAddMetric = () => {
    if (!canCreate) {
      toast.error('You do not have permission to create metrics');
      return;
    }
    
    setEditingMetric(null);
    setIsAddingMetric(true);
    setShowMetricDialog(true);
  };

  const handleEditMetric = (metric: KeyMetric) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit metrics');
      return;
    }
    
    setEditingMetric(metric);
    setIsAddingMetric(false);
    setShowMetricDialog(true);
  };

  const handleSaveMetric = (metricData: Partial<KeyMetric>) => {
    if (isAddingMetric) {
      const newMetric: KeyMetric = {
        id: `metric-${Date.now()}`,
        title: metricData.title || '',
        value: metricData.value || '',
        subtitle: metricData.subtitle || '',
        description: metricData.description || '',
        target: metricData.target || '',
        status: metricData.status || 'needs-improvement',
        category: metricData.category || '',
        editable: true,
      };
      setKeyMetrics([...keyMetrics, newMetric]);
      toast.success('Metric created successfully');
    } else if (editingMetric) {
      setKeyMetrics(keyMetrics.map(metric => 
        metric.id === editingMetric.id 
          ? { ...metric, ...metricData }
          : metric
      ));
      toast.success('Metric updated successfully');
    }
    
    setShowMetricDialog(false);
    setEditingMetric(null);
    setIsAddingMetric(false);
  };

  const handleDeleteMetric = (id: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete metrics');
      return;
    }
    
    setKeyMetrics(keyMetrics.filter(metric => metric.id !== id));
    toast.success('Metric deleted successfully');
  };

  // Announcement CRUD Functions
  const handleAddAnnouncement = () => {
    if (!canCreate) {
      toast.error('You do not have permission to create announcements');
      return;
    }
    
    setEditingAnnouncement(null);
    setIsAddingAnnouncement(true);
    setShowAnnouncementDialog(true);
    setAnnouncementImages([]);
    setAnnouncementAttachments([]);
  };

  const handleEditAnnouncement = (announcement: GADAnnouncement) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit announcements');
      return;
    }
    
    setEditingAnnouncement(announcement);
    setIsAddingAnnouncement(false);
    setShowAnnouncementDialog(true);
    setAnnouncementImages(announcement.images);
    setAnnouncementAttachments(announcement.attachments);
  };

  const handleSaveAnnouncement = (announcementData: Partial<GADAnnouncement>) => {
    if (isAddingAnnouncement) {
      const newAnnouncement: GADAnnouncement = {
        id: `ann-${Date.now()}`,
        title: announcementData.title || '',
        description: announcementData.description || '',
        content: announcementData.content || '',
        priority: announcementData.priority || 'Medium',
        status: announcementData.status || 'Draft',
        category: announcementData.category || 'Event Announcement',
        author: announcementData.author || userProfile?.name || 'Unknown',
        authorRole: announcementData.authorRole || userProfile?.role || 'Staff',
        publishedDate: announcementData.publishedDate || new Date().toISOString().split('T')[0],
        images: announcementImages,
        attachments: announcementAttachments,
        viewCount: 0,
        featured: announcementData.featured || false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      toast.success('Announcement created successfully');
    } else if (editingAnnouncement) {
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { 
              ...ann, 
              ...announcementData,
              images: announcementImages,
              attachments: announcementAttachments,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : ann
      ));
      toast.success('Announcement updated successfully');
    }
    
    setShowAnnouncementDialog(false);
    setEditingAnnouncement(null);
    setIsAddingAnnouncement(false);
    setAnnouncementImages([]);
    setAnnouncementAttachments([]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete announcements');
      return;
    }

    setAnnouncements(announcements.filter(ann => ann.id !== id));
    toast.success('Announcement deleted successfully');
  };

  // Program Highlight CRUD Functions
  const handleAddHighlight = () => {
    if (!canCreate) {
      toast.error('You do not have permission to create program highlights');
      return;
    }
    
    setEditingHighlight(null);
    setIsAddingHighlight(true);
    setShowHighlightDialog(true);
    setHighlightImages([]);
    setMainImageIndex(0);
  };

  const handleEditHighlight = (highlight: ProgramHighlight) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit program highlights');
      return;
    }
    
    setEditingHighlight(highlight);
    setIsAddingHighlight(false);
    setShowHighlightDialog(true);
    setHighlightImages(highlight.images);
    setMainImageIndex(highlight.mainImageIndex);
  };

  const handleSaveHighlight = (highlightData: Partial<ProgramHighlight>) => {
    if (isAddingHighlight) {
      const newHighlight: ProgramHighlight = {
        id: `highlight-${Date.now()}`,
        title: highlightData.title || '',
        description: highlightData.description || '',
        impact: highlightData.impact || '',
        status: highlightData.status || 'Planned',
        completion: highlightData.completion || 0,
        budget: highlightData.budget || 0,
        beneficiaries: highlightData.beneficiaries || 0,
        images: highlightImages,
        mainImageIndex: mainImageIndex,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setProgramHighlights([newHighlight, ...programHighlights]);
      toast.success('Program highlight created successfully');
    } else if (editingHighlight) {
      setProgramHighlights(programHighlights.map(highlight => 
        highlight.id === editingHighlight.id 
          ? { 
              ...highlight, 
              ...highlightData,
              images: highlightImages,
              mainImageIndex: mainImageIndex,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : highlight
      ));
      toast.success('Program highlight updated successfully');
    }
    
    setShowHighlightDialog(false);
    setEditingHighlight(null);
    setIsAddingHighlight(false);
    setHighlightImages([]);
    setMainImageIndex(0);
  };

  const handleDeleteHighlight = (id: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete program highlights');
      return;
    }

    setProgramHighlights(programHighlights.filter(highlight => highlight.id !== id));
    toast.success('Program highlight deleted successfully');
  };

  const handleAddHighlightImage = (imageUrl: string) => {
    setHighlightImages([...highlightImages, imageUrl]);
  };

  const handleRemoveHighlightImage = (index: number) => {
    const newImages = highlightImages.filter((_, i) => i !== index);
    setHighlightImages(newImages);
    if (mainImageIndex >= newImages.length) {
      setMainImageIndex(0);
    }
  };

  const handleSetMainImage = (index: number) => {
    setMainImageIndex(index);
    toast.success('Main image updated');
  };

  // Resource CRUD Functions
  const handleAddResource = () => {
    if (!canCreate) {
      toast.error('You do not have permission to create resources');
      return;
    }
    
    setEditingResource(null);
    setIsAddingResource(true);
    setShowResourceDialog(true);
  };

  const handleEditResource = (resource: GADResource) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit resources');
      return;
    }
    
    setEditingResource(resource);
    setIsAddingResource(false);
    setShowResourceDialog(true);
  };

  const handleSaveResource = (resourceData: Partial<GADResource>) => {
    if (isAddingResource) {
      const newResource: GADResource = {
        id: `resource-${Date.now()}`,
        title: resourceData.title || '',
        description: resourceData.description || '',
        type: resourceData.type || 'Guidelines',
        downloadUrl: resourceData.downloadUrl || '#',
        fileSize: resourceData.fileSize || '1.0 MB',
        lastUpdated: new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        downloadCount: 0,
        author: resourceData.author || userProfile?.name || 'Unknown',
        category: resourceData.category || 'General',
        icon: resourceData.icon || BookOpen,
      };
      setResources([newResource, ...resources]);
      toast.success('Resource created successfully');
    } else if (editingResource) {
      setResources(resources.map(resource => 
        resource.id === editingResource.id 
          ? { 
              ...resource, 
              ...resourceData,
              lastUpdated: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            }
          : resource
      ));
      toast.success('Resource updated successfully');
    }
    
    setShowResourceDialog(false);
    setEditingResource(null);
    setIsAddingResource(false);
  };

  const handleDeleteResource = (id: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete resources');
      return;
    }

    setResources(resources.filter(resource => resource.id !== id));
    toast.success('Resource deleted successfully');
  };

  const handleImageUpload = (files: FileList | null, type: 'announcement' | 'highlight') => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'announcement') {
          setAnnouncementImages(prev => [...prev, imageUrl]);
        } else {
          handleAddHighlightImage(imageUrl);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ===== RENDER =====

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <ClientNavbar
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        userRole={userRole}
        userProfile={userProfile}
        requireAuth={requireAuth}
        onAuthModalSignIn={onAuthModalSignIn}
        demoMode={demoMode}
      />

      {/* Sticky Year Indicator */}
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-700">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  Viewing Year:
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  {yearFilter}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Change Year</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Enhanced Background */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1629019324504-2e1fdf96e5e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB1bml2ZXJzaXR5JTIwZXF1YWxpdHklMjBkaXZlcnNpdHl8ZW58MXx8fHwxNzU5ODA1MDAyfDA&ixlib=rb-4.1.0&q=80&w=1080')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 border-2 border-white/30">
              <Scale className="h-8 w-8 text-white" />
            </div>
          </div>

          {editingSection === "hero-title" ? (
            <div className="space-y-4 mb-6">
              <Input
                defaultValue={editableContent.find(s => s.id === "hero-title")?.content}
                className="text-center text-3xl font-bold bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveContent("hero-title", e.currentTarget.value);
                  }
                }}
              />
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector("input") as HTMLInputElement;
                    handleSaveContent("hero-title", input.value);
                  }}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSection(null)}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {editableContent.find(s => s.id === "hero-title")?.content}
              </h1>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setEditingSection("hero-title")}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {editingSection === "hero-subtitle" ? (
            <div className="space-y-4 mb-8">
              <Input
                defaultValue={editableContent.find(s => s.id === "hero-subtitle")?.content}
                className="text-center text-lg bg-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveContent("hero-subtitle", e.currentTarget.value);
                  }
                }}
              />
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.querySelectorAll("input")[1] as HTMLInputElement;
                    handleSaveContent("hero-subtitle", input.value);
                  }}
                  className="bg-white text-purple-600 hover:bg-white/90"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSection(null)}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group mb-8">
              <h2 className="text-xl md:text-2xl text-white/90 drop-shadow-md">
                {editableContent.find(s => s.id === "hero-subtitle")?.content}
              </h2>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 text-white hover:bg-white/30"
                  onClick={() => setEditingSection("hero-subtitle")}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Year Filter */}
          <div className="mt-10 mb-8">
            <Card className="border-white/20 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Label htmlFor="gad-year-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filter by Year:
                    </Label>
                  </div>
                  <div className="flex-1 max-w-md">
                    <Select value={yearFilter} onValueChange={(value: any) => setYearFilter(value)}>
                      <SelectTrigger id="gad-year-filter" className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing data for: <span className="font-medium text-purple-600 dark:text-purple-400">{yearFilter}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {getYearSpecificData.keyMetrics.map((metric) => (
              <Card key={metric.id} className="relative group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all">
                <CardHeader className="text-center pb-2">
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-300 mb-1">{metric.value}</div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{metric.title}</CardTitle>
                  <CardDescription className="text-purple-700 dark:text-purple-400">{metric.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{metric.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Target: {metric.target}</span>
                    <Badge className={
                      metric.status === 'excellent' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' :
                      metric.status === 'good' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
                    }>
                      {metric.status === 'excellent' ? 'Excellent' : 
                       metric.status === 'good' ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </CardContent>
                {(canEdit || canDelete) && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMetric(metric)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMetric(metric.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {canCreate && (
            <Button
              onClick={handleAddMetric}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Metric
            </Button>
          )}
        </div>
      </section>

      {/* Sticky Navigation */}
      <div data-sticky-nav className="sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-purple-200 dark:border-purple-700 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navigationSections.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    nav-section-button min-w-fit whitespace-nowrap transition-all duration-150
                    ${isActive 
                      ? 'active bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 shadow-lg' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-300 dark:border-gray-600'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Parity Analysis with Demographic Tabs */}
        <section id="parity-analysis" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Gender Parity Analysis</h2>
            <p className="text-lg text-gray-600">
              Comprehensive analysis of gender distribution across different university populations.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 bg-purple-50 p-2 h-auto mb-6">
              <TabsTrigger
                value="students"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Students</span>
              </TabsTrigger>
              <TabsTrigger
                value="faculty"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Faculty</span>
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3"
              >
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Staff</span>
              </TabsTrigger>
              <TabsTrigger
                value="pwd"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3"
              >
                <Accessibility className="h-4 w-4" />
                <span className="hidden sm:inline">PWD</span>
              </TabsTrigger>
              <TabsTrigger
                value="indigenous"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Indigenous</span>
              </TabsTrigger>
            </TabsList>

            {/* STUDENTS TAB */}
            <TabsContent value="students" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Admission Parity Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Admission Gender Parity
                </CardTitle>
                <CardDescription>
                  Gender distribution in student admissions by academic program
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={getYearSpecificData.parityData.admission}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {getYearSpecificData.parityData.admission.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Graduation Parity Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Graduation Gender Parity
                </CardTitle>
                <CardDescription>
                  Gender distribution in graduation rates by academic program
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={getYearSpecificData.parityData.graduation}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {getYearSpecificData.parityData.graduation.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Students Key Insights Table */}
          <Card className="border-purple-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Key Performance Insights - Students
              </CardTitle>
              <CardDescription>
                Critical metrics for student gender parity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap">Metric</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Target</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-purple-50/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">Admission Parity Index</p>
                        <p className="text-xs text-gray-600 mt-1">Average gender balance across admissions</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-purple-600">
                      {getYearSpecificData.parityInsights.overall.admissionParityIndex}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">≥ 0.90</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-purple-50/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">Graduation Parity Index</p>
                        <p className="text-xs text-gray-600 mt-1">Average gender balance across graduations</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-purple-600">
                      {getYearSpecificData.parityInsights.overall.graduationParityIndex}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">≥ 0.90</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-purple-50/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">Year-over-Year Improvement</p>
                        <p className="text-xs text-gray-600 mt-1">Annual progress in gender parity</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-purple-600">
                      {getYearSpecificData.parityInsights.overall.yearOverYearChange}
                    </TableCell>
                    <TableCell className="text-center text-gray-600">≥ 0%</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                    </TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Students Comprehensive Distribution Table */}
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle>Comprehensive Student Distribution</CardTitle>
              <CardDescription>Complete gender representation across admission and graduation data</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap min-w-[200px]">Academic Program</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Male %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Female %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Gender Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getYearSpecificData.parityData.admission.map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      return (
                        <TableRow key={`admission-${idx}`} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.subject}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                              Admission
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {getYearSpecificData.parityData.graduation.map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      return (
                        <TableRow key={`graduation-${idx}`} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.subject}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Graduation
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACULTY TAB */}
        <TabsContent value="faculty" className="space-y-6">
          {/* Single Comprehensive Faculty Chart */}
          <Card className="border-purple-200 hover:border-purple-300">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Faculty Gender Distribution
              </CardTitle>
              <CardDescription>
                Comprehensive gender distribution across all colleges and professional schools
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={450}>
                <RadarChart data={GAD_DATA.facultyData.fullDetails.map(item => ({
                  subject: item.name.includes('(') ? item.name.split('(')[0].trim() : item.name,
                  male: item.male,
                  female: item.female
                }))}>
                  <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <Radar
                    name="Male %"
                    dataKey="male"
                    stroke="#7c3aed"
                    fill="#7c3aed"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Female %"
                    dataKey="female"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9d5ff',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-6">
                {GAD_DATA.facultyData.fullDetails.map((program, idx) => {
                  const variance = Math.abs(50 - Math.max(program.male, program.female));
                  const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                  const isUndergrad = idx < 7; // First 7 are undergraduate
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={
                          isUndergrad 
                            ? 'bg-blue-50 text-blue-600 border-blue-200 text-xs' 
                            : 'bg-green-50 text-green-600 border-green-200 text-xs'
                        }>
                          {isUndergrad ? 'Undergraduate' : 'Professional'}
                        </Badge>
                        <span className="text-sm font-medium">{program.name.split('(')[0].trim()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                        <Badge variant="outline" className={
                          status === 'excellent' ? 'text-purple-600 border-purple-200' :
                          status === 'good' ? 'text-blue-600 border-blue-200' :
                          'text-yellow-600 border-yellow-200'
                        }>
                          {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Faculty Key Insights Table */}
          <Card className="border-purple-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Key Performance Insights - Faculty
              </CardTitle>
              <CardDescription>
                Critical metrics for faculty gender parity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap">Metric</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Target</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Faculty Parity Index</p>
                          <p className="text-xs text-gray-600 mt-1">Overall gender balance</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">0.82</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 0.85</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Female Leadership</p>
                          <p className="text-xs text-gray-600 mt-1">Department heads and deans</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">42%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 50%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">Improving</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Research Success Rate</p>
                          <p className="text-xs text-gray-600 mt-1">Female faculty grant awards</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">48%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 45%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Faculty Detailed Table */}
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle>Comprehensive Faculty Distribution</CardTitle>
              <CardDescription>Complete gender representation across all colleges and schools</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap min-w-[250px]">College / School</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Total Faculty</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Male %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Female %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Gender Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {GAD_DATA.facultyData.fullDetails.map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      const isUndergrad = idx < 7; // First 7 are undergraduate
                      return (
                        <TableRow key={idx} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              isUndergrad 
                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                : 'bg-green-50 text-green-600 border-green-200'
                            }>
                              {isUndergrad ? 'Undergraduate' : 'Professional'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{data.total}</TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAFF TAB */}
        <TabsContent value="staff" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Administrative Staff Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Administrative Staff
                </CardTitle>
                <CardDescription>
                  Gender distribution across administrative departments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.staffData.administrative}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.staffData.administrative.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Support Services Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Support Services Staff
                </CardTitle>
                <CardDescription>
                  Gender distribution in academic and technical support
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.staffData.support}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.staffData.support.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Key Insights Table */}
          <Card className="border-purple-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Key Performance Insights - Staff
              </CardTitle>
              <CardDescription>
                Critical metrics for staff gender parity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap">Metric</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Target</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Staff Parity Index</p>
                          <p className="text-xs text-gray-600 mt-1">Overall gender balance</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">0.88</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 0.85</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Senior Management</p>
                          <p className="text-xs text-gray-600 mt-1">Female representation in leadership</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">45%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 50%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Equal Pay Compliance</p>
                          <p className="text-xs text-gray-600 mt-1">Gender pay equity across levels</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">98%</TableCell>
                      <TableCell className="text-center text-gray-600">100%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Staff Combined Detailed Table */}
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle>Comprehensive Staff Distribution</CardTitle>
              <CardDescription>Complete gender representation across all departments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap min-w-[200px]">Department</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Total Staff</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Male %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Female %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Gender Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...GAD_DATA.staffData.administrative, ...GAD_DATA.staffData.support].map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      const isAdministrative = idx < GAD_DATA.staffData.administrative.length;
                      return (
                        <TableRow key={idx} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.subject}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              isAdministrative 
                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                : 'bg-green-50 text-green-600 border-green-200'
                            }>
                              {isAdministrative ? 'Administrative' : 'Support Services'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{data.total}</TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PWD TAB */}
        <TabsContent value="pwd" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* PWD Population Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-purple-600" />
                  PWD Population Distribution
                </CardTitle>
                <CardDescription>
                  Gender distribution across PWD university population
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.pwdData.population}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.pwdData.population.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* PWD Services Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  PWD Support Services
                </CardTitle>
                <CardDescription>
                  Gender distribution in accessibility and support programs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.pwdData.services}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.pwdData.services.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PWD Key Insights Table */}
          <Card className="border-purple-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Key Performance Insights - PWD
              </CardTitle>
              <CardDescription>
                Critical metrics for PWD gender parity and accessibility
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap">Metric</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Target</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">PWD Parity Index</p>
                          <p className="text-xs text-gray-600 mt-1">Overall gender balance</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">0.86</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 0.85</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Accessibility Compliance</p>
                          <p className="text-xs text-gray-600 mt-1">Gender-inclusive facilities</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">94%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 90%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Support Utilization</p>
                          <p className="text-xs text-gray-600 mt-1">Services engagement by all genders</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">89%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 80%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* PWD Detailed Table */}
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle>Comprehensive PWD Distribution</CardTitle>
              <CardDescription>Complete gender representation across all PWD categories and services</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap min-w-[220px]">Category / Service</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Total Beneficiaries</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Male %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Female %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Gender Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...GAD_DATA.pwdData.population, ...GAD_DATA.pwdData.services].map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      const isPopulation = idx < GAD_DATA.pwdData.population.length;
                      return (
                        <TableRow key={idx} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.subject}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              isPopulation 
                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                : 'bg-green-50 text-green-600 border-green-200'
                            }>
                              {isPopulation ? 'Population' : 'Support Service'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{data.total}</TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INDIGENOUS PEOPLE TAB */}
        <TabsContent value="indigenous" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Indigenous Community Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Indigenous Community Distribution
                </CardTitle>
                <CardDescription>
                  Gender distribution across indigenous university community
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.indigenousData.community}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.indigenousData.community.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Indigenous Programs Chart */}
            <Card className="border-purple-200 hover:border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Indigenous Support Programs
                </CardTitle>
                <CardDescription>
                  Gender distribution in cultural and development programs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={GAD_DATA.indigenousData.programs}>
                    <PolarGrid stroke="#e9d5ff" strokeWidth={1} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <Radar
                      name="Male %"
                      dataKey="male"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Female %"
                      dataKey="female"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {GAD_DATA.indigenousData.programs.map((program, idx) => {
                    const variance = Math.abs(50 - Math.max(program.male, program.female));
                    const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <span className="text-sm font-medium">{program.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{program.male}% / {program.female}%</span>
                          <Badge variant="outline" className={
                            status === 'excellent' ? 'text-purple-600 border-purple-200' :
                            status === 'good' ? 'text-blue-600 border-blue-200' :
                            'text-yellow-600 border-yellow-200'
                          }>
                            {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indigenous Key Insights Table */}
          <Card className="border-purple-200 mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Key Performance Insights - Indigenous People
              </CardTitle>
              <CardDescription>
                Critical metrics for indigenous people gender parity
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap">Metric</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Value</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Target</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">IP Parity Index</p>
                          <p className="text-xs text-gray-600 mt-1">Overall gender balance</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">0.92</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 0.85</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Female Enrollment</p>
                          <p className="text-xs text-gray-600 mt-1">IP female student participation</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">48%</TableCell>
                      <TableCell className="text-center text-gray-600">≥ 45%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-purple-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">Cultural Program Participation</p>
                          <p className="text-xs text-gray-600 mt-1">Equal engagement in activities</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-purple-600">50%</TableCell>
                      <TableCell className="text-center text-gray-600">50%</TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Indigenous Detailed Table */}
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
              <CardTitle>Comprehensive Indigenous People Distribution</CardTitle>
              <CardDescription>Complete gender representation across all categories and programs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50/50">
                      <TableHead className="whitespace-nowrap min-w-[220px]">Category / Program</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Category</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Total Participants</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Male %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Female %</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Gender Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...GAD_DATA.indigenousData.community, ...GAD_DATA.indigenousData.programs].map((data, idx) => {
                      const variance = Math.abs(50 - Math.max(data.male, data.female));
                      const status = variance <= 10 ? 'excellent' : variance <= 20 ? 'good' : 'improving';
                      const isCommunity = idx < GAD_DATA.indigenousData.community.length;
                      return (
                        <TableRow key={idx} className="hover:bg-purple-50/30">
                          <TableCell className="font-medium">{data.subject}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              isCommunity 
                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                : 'bg-green-50 text-green-600 border-green-200'
                            }>
                              {isCommunity ? 'Community' : 'Cultural Program'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{data.total}</TableCell>
                          <TableCell className="text-center text-purple-600 font-medium">{data.male}%</TableCell>
                          <TableCell className="text-center text-purple-400 font-medium">{data.female}%</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={
                              status === 'excellent' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                              status === 'good' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-600 border-amber-200'
                            }>
                              {variance <= 10 ? 'Balanced' : variance <= 20 ? 'Good' : 'Improving'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>

        {/* GAD Parity Insights & Analysis - Dynamic based on active tab */}
        <section id="parity-insights" className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full mb-4">
              <Sparkles className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Parity Insights & Analysis</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive evaluation of {
                activeTab === 'students' ? 'student admission and graduation' :
                activeTab === 'faculty' ? 'faculty gender distribution' :
                activeTab === 'staff' ? 'staff gender representation' :
                activeTab === 'pwd' ? 'PWD accessibility and inclusion' :
                'indigenous people participation'
              } metrics, trends, and actionable insights for continuous improvement.
            </p>
          </div>

          {/* Dynamic Parity Summary based on active tab */}
          <Card className="mb-8 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-8">
              {activeTab === 'students' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">
                      {getYearSpecificData.parityInsights.overall.admissionParityIndex.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Admission Parity Index</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
                      {getYearSpecificData.parityInsights.overall.trend === 'stable' ? 'Stable' : 'Improving'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">
                      {getYearSpecificData.parityInsights.overall.graduationParityIndex.toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Graduation Parity Index</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">
                      {getYearSpecificData.parityInsights.overall.trend === 'stable' ? 'Stable' : 'Improving'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">
                      {getYearSpecificData.parityInsights.overall.yearOverYearChange}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Year-over-Year Change</div>
                    <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Positive Growth
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">6</div>
                    <div className="text-sm text-purple-700 font-medium">Programs Monitored</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                      <LineChart className="h-3 w-3 mr-1" />
                      Active Tracking
                    </Badge>
                  </div>
                </div>
              )}

              {activeTab === 'faculty' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">0.82</div>
                    <div className="text-sm text-purple-700 font-medium">Faculty Parity Index</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">42%</div>
                    <div className="text-sm text-purple-700 font-medium">Female Leadership</div>
                    <Badge className="mt-2 bg-amber-100 text-amber-800 border-amber-200">Improving</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">7+2</div>
                    <div className="text-sm text-purple-700 font-medium">UG Colleges + Professional</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Monitored</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">48%</div>
                    <div className="text-sm text-purple-700 font-medium">Research Success Rate</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                </div>
              )}

              {activeTab === 'staff' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">0.88</div>
                    <div className="text-sm text-purple-700 font-medium">Staff Parity Index</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">45%</div>
                    <div className="text-sm text-purple-700 font-medium">Senior Management</div>
                    <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">Good</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">12</div>
                    <div className="text-sm text-purple-700 font-medium">Departments</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Monitored</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">98%</div>
                    <div className="text-sm text-purple-700 font-medium">Equal Pay Compliance</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                </div>
              )}

              {activeTab === 'pwd' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">0.86</div>
                    <div className="text-sm text-purple-700 font-medium">PWD Parity Index</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">94%</div>
                    <div className="text-sm text-purple-700 font-medium">Accessibility Compliance</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">12</div>
                    <div className="text-sm text-purple-700 font-medium">Support Categories</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Monitored</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">89%</div>
                    <div className="text-sm text-purple-700 font-medium">Support Utilization</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                </div>
              )}

              {activeTab === 'indigenous' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">0.92</div>
                    <div className="text-sm text-purple-700 font-medium">IP Parity Index</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">48%</div>
                    <div className="text-sm text-purple-700 font-medium">Female Enrollment</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">12</div>
                    <div className="text-sm text-purple-700 font-medium">Programs & Categories</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Monitored</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-900 mb-2">50%</div>
                    <div className="text-sm text-purple-700 font-medium">Cultural Participation</div>
                    <Badge className="mt-2 bg-purple-100 text-purple-800 border-purple-200">Excellent</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <Card className="border-green-200 hover:border-green-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
                <CardDescription>
                  Programs and initiatives demonstrating excellence in gender balance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getYearSpecificData.parityInsights.strengths.map((strength, idx) => (
                  <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">{strength.title}</h4>
                    <p className="text-sm text-green-700 mb-2">{strength.description}</p>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <Sparkles className="h-3 w-3" />
                      <span className="font-medium">{strength.impact}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card className="border-orange-200 hover:border-orange-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>
                  Programs requiring targeted interventions and strategic initiatives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getYearSpecificData.parityInsights.improvements.map((improvement, idx) => (
                  <div key={idx} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">{improvement.title}</h4>
                    <p className="text-sm text-orange-700 mb-3">{improvement.description}</p>
                    <div className="bg-white p-2 rounded border border-orange-300">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-orange-900 mb-1">Recommended Action</div>
                          <div className="text-xs text-orange-700">{improvement.action}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Parity Index Scale Reference */}
          <Card className="mt-8 bg-gradient-to-r from-gray-50 to-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Scale className="h-5 w-5 text-purple-600" />
                Parity Index Scale Reference
              </CardTitle>
              <CardDescription>
                Understanding our gender parity measurement methodology and performance benchmarks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-100 border border-purple-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    <div>
                      <div className="font-semibold text-purple-900">Excellent (≥ 0.90)</div>
                      <div className="text-sm text-purple-700">Near-perfect gender balance</div>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">Benchmark</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <div>
                      <div className="font-semibold text-blue-900">Good (0.75 - 0.89)</div>
                      <div className="text-sm text-blue-700">Strong gender balance with minor variance</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Target</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <div>
                      <div className="font-semibold text-yellow-900">Fair (0.60 - 0.74)</div>
                      <div className="text-sm text-yellow-700">Moderate imbalance requiring attention</div>
                    </div>
                  </div>
                  <Badge className="bg-yellow-600 text-white">Monitor</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-100 border border-orange-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                    <div>
                      <div className="font-semibold text-orange-900">Needs Improvement (&lt; 0.60)</div>
                      <div className="text-sm text-orange-700">Significant gap requiring intervention</div>
                    </div>
                  </div>
                  <Badge className="bg-orange-600 text-white">Priority</Badge>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium text-gray-900 mb-1">Calculation Methodology</p>
                    <p>The Gender Parity Index is calculated as the ratio of female to male enrollment or graduation rates. A value of 1.0 indicates perfect parity, while values above or below indicate imbalance in either direction.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Data Implementation Note */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <FileText className="h-5 w-5 text-blue-600" />
                Administrative Data Management Requirements
              </CardTitle>
              <CardDescription className="text-blue-700">
                Comprehensive list of attributes that must be implemented in the admin dashboard for complete GAD monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Students Tab - Required Attributes
                </h4>
                <div className="text-sm text-gray-700 space-y-1 ml-6">
                  <p>• <span className="font-medium">Admission Data:</span> Program/College, Academic Year, Total Admitted, Male Count, Female Count, Male %, Female %, Gender Parity Index</p>
                  <p>• <span className="font-medium">Graduation Data:</span> Program/College, Academic Year, Total Graduates, Male Count, Female Count, Male %, Female %, Completion Rate</p>
                  <p>• <span className="font-medium">Metrics:</span> Overall Admission Parity Index, Graduation Parity Index, Year-over-Year Change, Programs Monitored</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Faculty Tab - Required Attributes
                </h4>
                <div className="text-sm text-gray-700 space-y-1 ml-6">
                  <p>• <span className="font-medium">Faculty Distribution:</span> College/School Name, Total Faculty, Male Count, Female Count, Male %, Female %, Position Level, Department</p>
                  <p>• <span className="font-medium">Professional Schools:</span> School/Program Name, Total Faculty, Male Count, Female Count, Leadership Roles, Research Grants</p>
                  <p>• <span className="font-medium">Metrics:</span> Faculty Parity Index, Female Leadership %, Research Success Rate, Promotion Equity, Publication Rates</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Staff Tab - Required Attributes
                </h4>
                <div className="text-sm text-gray-700 space-y-1 ml-6">
                  <p>• <span className="font-medium">Administrative Staff:</span> Department, Position Title, Total Staff, Male Count, Female Count, Male %, Female %, Job Level, Salary Grade</p>
                  <p>• <span className="font-medium">Support Services:</span> Service Type, Total Staff, Male Count, Female Count, Service Hours, Training Completed</p>
                  <p>• <span className="font-medium">Metrics:</span> Staff Parity Index, Senior Management %, Equal Pay Compliance, Promotion Rate, Training Access</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  PWD Tab - Required Attributes
                </h4>
                <div className="text-sm text-gray-700 space-y-1 ml-6">
                  <p>• <span className="font-medium">Population Data:</span> Category (Students/Faculty/Staff), Disability Type, Total Count, Male Count, Female Count, Male %, Female %</p>
                  <p>• <span className="font-medium">Support Services:</span> Service Name, Total Beneficiaries, Male Count, Female Count, Utilization Rate, Accessibility Level</p>
                  <p>• <span className="font-medium">Metrics:</span> PWD Parity Index, Accessibility Compliance %, Support Utilization %, Facility Access, Technology Access</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Indigenous People Tab - Required Attributes
                </h4>
                <div className="text-sm text-gray-700 space-y-1 ml-6">
                  <p>• <span className="font-medium">Community Data:</span> Category (Students/Faculty/Staff/Leaders), Tribal Affiliation, Total Count, Male Count, Female Count, Male %, Female %</p>
                  <p>• <span className="font-medium">Support Programs:</span> Program Name, Total Participants, Male Count, Female Count, Scholarship Recipients, Cultural Events</p>
                  <p>• <span className="font-medium">Metrics:</span> IP Parity Index, Female Enrollment %, Cultural Participation %, Leadership Representation, Retention Rate</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-700 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-purple-900 mb-2">Implementation Note</p>
                    <p className="text-purple-800 mb-2">
                      All attributes listed above are currently implemented with sample data for demonstration purposes. 
                      The admin dashboard must include full CRUD (Create, Read, Update, Delete) functionality for each attribute category.
                    </p>
                    <p className="text-purple-800">
                      Data should be collected and updated regularly to ensure accurate gender parity monitoring and reporting across all university populations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Announcements Carousel - 3 Cards with Full CRUD */}
        <section id="announcements" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Announcements</h2>
              <p className="text-lg text-gray-600">
                Stay informed about GAD initiatives and upcoming events.
              </p>
              {!canCreate && !userProfile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">
                    Sign in as <span className="font-semibold">Admin</span> or <span className="font-semibold">Staff</span> to manage content
                  </span>
                </div>
              )}
            </div>
            {canCreate && (
              <Button onClick={handleAddAnnouncement} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            )}
          </div>

          <div className="gad-carousel-wrapper">
            <Slider {...carouselSettings} className="gad-carousel">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="carousel-slide-padding">
                  <Card className="client-card-hover border-gray-200 hover:border-purple-300 h-full">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img 
                        src={announcement.images[0] || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop'} 
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{announcement.title}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{announcement.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(announcement.publishedDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          {announcement.viewCount} views
                        </div>
                      </div>

                      {(canEdit || canDelete) && (
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                          {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Program Highlights Carousel - 3 Cards with Full CRUD and Multi-Image Support */}
        <section id="program-highlights" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Program Highlights</h2>
              <p className="text-lg text-gray-600">
                Key achievements and ongoing initiatives promoting gender equality.
              </p>
              {!canCreate && !userProfile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">
                    Sign in as <span className="font-semibold">Admin</span> or <span className="font-semibold">Staff</span> to manage highlights
                  </span>
                </div>
              )}
            </div>
            {canCreate && (
              <Button onClick={handleAddHighlight} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button>
            )}
          </div>

          <div className="gad-carousel-wrapper">
            <Slider {...carouselSettings} className="gad-carousel">
              {programHighlights.map((highlight) => (
                <div key={highlight.id} className="carousel-slide-padding">
                  <Card className="client-card-hover border-gray-200 hover:border-purple-300 h-full">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img 
                        src={highlight.images[highlight.mainImageIndex] || highlight.images[0]}
                        alt={highlight.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className={getHighlightStatusColor(highlight.status)}>
                          {highlight.status}
                        </Badge>
                      </div>
                      {highlight.images.length > 1 && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {highlight.images.length} photos
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{highlight.title}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                      <p className="text-sm text-gray-600 line-clamp-3 flex-1">{highlight.description}</p>
                      
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-semibold text-sm text-purple-900 mb-1">Impact Achieved</div>
                        <div className="text-sm text-purple-700">{highlight.impact}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Beneficiaries</span>
                          <div className="font-semibold text-purple-900">{highlight.beneficiaries.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget</span>
                          <div className="font-semibold text-purple-900">₱{(highlight.budget / 1000000).toFixed(1)}M</div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <Progress value={highlight.completion} className="mb-2" />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{highlight.completion}% Complete</span>
                        </div>
                      </div>

                      {(canEdit || canDelete) && (
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                          {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => handleEditHighlight(highlight)}>
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteHighlight(highlight.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Resources with Purple Theme and Full CRUD */}
        <section id="resources" className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Resources & Documentation</h2>
              <p className="text-lg text-gray-600">
                Access policy frameworks and implementation guides.
              </p>
              {!canCreate && !userProfile && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <Info className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">
                    Sign in as <span className="font-semibold">Admin</span> or <span className="font-semibold">Staff</span> to manage resources
                  </span>
                </div>
              )}
            </div>
            {canCreate && (
              <Button onClick={handleAddResource} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              
              return (
                <Card key={resource.id} className="client-card-hover border-gray-200 hover:border-purple-300 relative group">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                          {resource.type}
                        </Badge>
                      </div>
                      {(canEdit || canDelete) && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditResource(resource)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResource(resource.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-6 text-base leading-relaxed">
                      {resource.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        <div>Updated: {resource.lastUpdated}</div>
                        <div>{resource.downloadCount.toLocaleString()} downloads</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {resource.fileSize}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Resource
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* ===== CRUD DIALOGS ===== */}

      {/* Metric Dialog */}
      <Dialog open={showMetricDialog} onOpenChange={() => setShowMetricDialog(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddingMetric ? 'Add New Metric' : 'Edit Metric'}
            </DialogTitle>
            <DialogDescription>
              {isAddingMetric 
                ? 'Create a new key performance metric for GAD monitoring.'
                : 'Update the metric information and targets.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveMetric({
              title: formData.get('title') as string,
              value: formData.get('value') as string,
              subtitle: formData.get('subtitle') as string,
              description: formData.get('description') as string,
              target: formData.get('target') as string,
              status: formData.get('status') as KeyMetric['status'],
              category: formData.get('category') as string,
            });
          }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingMetric?.title}
                    placeholder="e.g., Gender Parity Index"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="value">Current Value</Label>
                  <Input
                    id="value"
                    name="value"
                    defaultValue={editingMetric?.value}
                    placeholder="e.g., 0.87 or 42%"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    defaultValue={editingMetric?.subtitle}
                    placeholder="e.g., Academic Programs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    name="target"
                    defaultValue={editingMetric?.target}
                    placeholder="e.g., ≥ 0.90"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingMetric?.description}
                  placeholder="Detailed description of what this metric measures..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingMetric?.category}
                    placeholder="e.g., Education, Leadership"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingMetric?.status || 'needs-improvement'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowMetricDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {isAddingMetric ? 'Create Metric' : 'Update Metric'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={() => setShowAnnouncementDialog(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddingAnnouncement ? 'Create New Announcement' : 'Edit Announcement'}
            </DialogTitle>
            <DialogDescription>
              {isAddingAnnouncement 
                ? 'Share important GAD updates and events with the community.'
                : 'Update the announcement information and content.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveAnnouncement({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              content: formData.get('content') as string,
              priority: formData.get('priority') as GADAnnouncement['priority'],
              status: formData.get('status') as GADAnnouncement['status'],
              category: formData.get('category') as GADAnnouncement['category'],
              author: formData.get('author') as string,
              authorRole: formData.get('authorRole') as string,
              publishedDate: formData.get('publishedDate') as string,
              featured: formData.get('featured') === 'on',
            });
          }}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingAnnouncement?.title}
                    placeholder="Announcement title..."
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingAnnouncement?.description}
                    placeholder="Brief description for preview..."
                    rows={2}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="content">Full Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={editingAnnouncement?.content}
                    placeholder="Detailed announcement content..."
                    rows={4}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue={editingAnnouncement?.priority || 'Medium'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingAnnouncement?.status || 'Draft'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingAnnouncement?.category || 'Event Announcement'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Policy Update">Policy Update</SelectItem>
                      <SelectItem value="Event Announcement">Event Announcement</SelectItem>
                      <SelectItem value="Program Launch">Program Launch</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="publishedDate">Published Date</Label>
                  <Input
                    id="publishedDate"
                    name="publishedDate"
                    type="date"
                    defaultValue={editingAnnouncement?.publishedDate}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    defaultValue={editingAnnouncement?.author || userProfile?.name}
                    placeholder="Author name..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="authorRole">Author Role</Label>
                  <Input
                    id="authorRole"
                    name="authorRole"
                    defaultValue={editingAnnouncement?.authorRole || userProfile?.role}
                    placeholder="Author role/position..."
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 md:col-span-2">
                  <Switch
                    id="featured"
                    name="featured"
                    defaultChecked={editingAnnouncement?.featured}
                  />
                  <Label htmlFor="featured">Featured announcement</Label>
                </div>
              </div>
              
              {/* Image Management */}
              <div>
                <Label>Images</Label>
                <div className="mt-2 space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files, 'announcement')}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">Upload multiple images for this announcement</p>
                  </div>
                  
                  {announcementImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {announcementImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Announcement image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setAnnouncementImages(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowAnnouncementDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {isAddingAnnouncement ? 'Create Announcement' : 'Update Announcement'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Program Highlight Dialog with Multi-Image Support */}
      <Dialog open={showHighlightDialog} onOpenChange={() => setShowHighlightDialog(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddingHighlight ? 'Create New Program Highlight' : 'Edit Program Highlight'}
            </DialogTitle>
            <DialogDescription>
              {isAddingHighlight 
                ? 'Showcase a significant GAD program or achievement.'
                : 'Update the program highlight information and progress.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveHighlight({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              impact: formData.get('impact') as string,
              status: formData.get('status') as ProgramHighlight['status'],
              completion: parseInt(formData.get('completion') as string) || 0,
              budget: parseInt(formData.get('budget') as string) || 0,
              beneficiaries: parseInt(formData.get('beneficiaries') as string) || 0,
            });
          }}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Program Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingHighlight?.title}
                    placeholder="Program name..."
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingHighlight?.description}
                    placeholder="Program description and objectives..."
                    rows={3}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="impact">Impact Achieved</Label>
                  <Textarea
                    id="impact"
                    name="impact"
                    defaultValue={editingHighlight?.impact}
                    placeholder="Describe the impact and outcomes..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={editingHighlight?.status || 'Planned'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="completion">Completion (%)</Label>
                  <Input
                    id="completion"
                    name="completion"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingHighlight?.completion}
                    placeholder="0-100"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="budget">Budget (PHP)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    defaultValue={editingHighlight?.budget}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="beneficiaries">Beneficiaries</Label>
                  <Input
                    id="beneficiaries"
                    name="beneficiaries"
                    type="number"
                    min="0"
                    defaultValue={editingHighlight?.beneficiaries}
                    placeholder="Number of people benefiting"
                    required
                  />
                </div>
              </div>
              
              {/* Multi-Image Management */}
              <div>
                <Label>Program Images</Label>
                <div className="mt-2 space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files, 'highlight')}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">Upload multiple images (maximum 5). Click on an image to set it as the main image.</p>
                  </div>
                  
                  {highlightImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {highlightImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Program image ${index + 1}`}
                            className={`w-full h-24 object-cover rounded border-2 cursor-pointer transition-all ${
                              index === mainImageIndex 
                                ? 'border-purple-500 ring-2 ring-purple-300' 
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                            onClick={() => handleSetMainImage(index)}
                          />
                          {index === mainImageIndex && (
                            <div className="absolute top-1 left-1">
                              <Badge className="bg-purple-600 text-white text-xs">Main</Badge>
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveHighlightImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowHighlightDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {isAddingHighlight ? 'Create Highlight' : 'Update Highlight'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resource Dialog */}
      <Dialog open={showResourceDialog} onOpenChange={() => setShowResourceDialog(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isAddingResource ? 'Add New Resource' : 'Edit Resource'}
            </DialogTitle>
            <DialogDescription>
              {isAddingResource 
                ? 'Add a new GAD resource or document for download.'
                : 'Update the resource information and metadata.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSaveResource({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              type: formData.get('type') as GADResource['type'],
              downloadUrl: formData.get('downloadUrl') as string,
              fileSize: formData.get('fileSize') as string,
              author: formData.get('author') as string,
              category: formData.get('category') as string,
            });
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingResource?.title}
                  placeholder="Resource name..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingResource?.description}
                  placeholder="Detailed description of the resource..."
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Resource Type</Label>
                  <Select name="type" defaultValue={editingResource?.type || 'Guidelines'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Policy Document">Policy Document</SelectItem>
                      <SelectItem value="Training Manual">Training Manual</SelectItem>
                      <SelectItem value="Research Report">Research Report</SelectItem>
                      <SelectItem value="Guidelines">Guidelines</SelectItem>
                      <SelectItem value="Assessment Tool">Assessment Tool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="fileSize">File Size</Label>
                  <Input
                    id="fileSize"
                    name="fileSize"
                    defaultValue={editingResource?.fileSize}
                    placeholder="e.g., 2.5 MB"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="downloadUrl">Download URL</Label>
                <Input
                  id="downloadUrl"
                  name="downloadUrl"
                  type="url"
                  defaultValue={editingResource?.downloadUrl}
                  placeholder="https://..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author/Creator</Label>
                  <Input
                    id="author"
                    name="author"
                    defaultValue={editingResource?.author || userProfile?.name}
                    placeholder="Author name..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingResource?.category}
                    placeholder="e.g., Implementation, Research"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowResourceDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                {isAddingResource ? 'Create Resource' : 'Update Resource'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Styles */}
      <style jsx>{`
        .gad-carousel-wrapper {
          position: relative;
          margin: 0 auto;
          max-width: 100%;
          padding: 0 12px;
        }

        .carousel-slide-padding {
          padding: 0 12px;
        }

        .gad-carousel .slick-track {
          display: flex;
          align-items: stretch;
        }

        .gad-carousel .slick-slide {
          height: inherit;
        }

        .gad-carousel .slick-slide > div {
          height: 100%;
        }

        .gad-carousel .client-card-hover {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .carousel-arrow-prev,
        .carousel-arrow-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(124, 58, 237, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .carousel-arrow-prev {
          left: -60px;
        }

        .carousel-arrow-next {
          right: -60px;
        }

        .carousel-arrow-prev:hover,
        .carousel-arrow-next:hover {
          background: rgba(255, 255, 255, 1);
          border-color: rgba(124, 58, 237, 0.6);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.2);
        }

        .carousel-arrow-prev svg,
        .carousel-arrow-next svg {
          color: #7c3aed;
        }

        .gad-carousel .slick-dots {
          position: relative;
          bottom: -40px;
          display: flex !important;
          justify-content: center;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .gad-carousel .slick-dots li {
          margin: 0 4px;
        }

        .gad-carousel .slick-dots li button {
          width: 10px;
          height: 10px;
          padding: 0;
          background: #d1d5db;
          border: none;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .gad-carousel .slick-dots li.slick-active button {
          background: #7c3aed;
          transform: scale(1.3);
        }

        .gad-carousel .slick-dots li button:hover {
          background: #9ca3af;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .carousel-arrow-prev {
            left: -30px;
            width: 40px;
            height: 40px;
          }
          
          .carousel-arrow-next {
            right: -30px;
            width: 40px;
            height: 40px;
          }
          
          .gad-carousel-wrapper {
            padding: 0 6px;
          }
        }
      `}</style>
    </div>
  );
}