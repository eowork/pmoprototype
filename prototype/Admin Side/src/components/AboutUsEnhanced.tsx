import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Building, 
  Users, 
  Target, 
  Award, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  Shield,
  BookOpen,
  UserCheck,
  Contact,
  Eye,
  Compass,
  Edit3,
  Save,
  X,
  ZoomIn,
  Maximize2,
  AlertTriangle,
  Lightbulb,
  Handshake,
  RefreshCw,
  Plus,
  Trash2,
  TrendingUp,
  Zap,
  Globe,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import orgChartImage from 'figma:asset/62d142e23d84eb7ec051488f719a701962c7c4de.png';

interface AboutUsEnhancedProps {
  currentSection?: string;
  userRole?: string;
}

interface ContactInfo {
  id: string;
  type: 'address' | 'phone' | 'email' | 'hours' | 'online';
  label: string;
  value: string;
  icon: any;
}

interface Objective {
  id: string;
  category: 'strategic' | 'performance';
  title: string;
  description: string;
  target?: string;
}

interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'emerald' | 'amber';
}

interface OrgComposition {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface HeaderContent {
  title: string;
  subtitle: string;
  description: string;
  stats: {
    projects: string;
    value: string;
    rate: string;
    experience: string;
  };
}

interface HeaderFormData extends HeaderContent {
  _backup?: HeaderContent;
}

// Icon mapping for dropdowns
const ICON_OPTIONS = [
  { value: 'Shield', label: 'Shield', component: Shield },
  { value: 'CheckCircle', label: 'Check Circle', component: CheckCircle },
  { value: 'Lightbulb', label: 'Lightbulb', component: Lightbulb },
  { value: 'Handshake', label: 'Handshake', component: Handshake },
  { value: 'Users', label: 'Users', component: Users },
  { value: 'Award', label: 'Award', component: Award },
  { value: 'Target', label: 'Target', component: Target },
  { value: 'BookOpen', label: 'Book', component: BookOpen },
  { value: 'Globe', label: 'Globe', component: Globe },
  { value: 'Briefcase', label: 'Briefcase', component: Briefcase },
  { value: 'MapPin', label: 'Location', component: MapPin },
  { value: 'Phone', label: 'Phone', component: Phone },
  { value: 'Mail', label: 'Mail', component: Mail },
];

const getIconComponent = (iconName: string) => {
  const icon = ICON_OPTIONS.find(opt => opt.value === iconName);
  return icon?.component || Shield;
};

// Enhanced local storage keys with versioning
const STORAGE_KEYS = {
  HEADER_CONTENT: 'csu_pmo_about_header_content_v4',
  MISSION_TEXT: 'csu_pmo_about_mission_v4',
  VISION_TEXT: 'csu_pmo_about_vision_v4',
  QUALITY_POLICY_TEXT: 'csu_pmo_about_quality_policy_v4',
  OBJECTIVES: 'csu_pmo_about_objectives_v4',
  CORE_VALUES: 'csu_pmo_about_core_values_v4',
  ORG_COMPOSITION: 'csu_pmo_about_org_composition_v4',
  CONTACT_INFO: 'csu_pmo_about_contact_info_v4',
  LAST_SAVED: 'csu_pmo_about_last_saved_v4'
};

export function AboutUsEnhanced({ currentSection, userRole = 'Client' }: AboutUsEnhancedProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Enhanced Header Content
  const [headerContent, setHeaderContent] = useState<HeaderFormData>({
    title: "Project Management Office",
    subtitle: "Caraga State University",
    description: "Leading excellence in project management and fostering transparency in university development initiatives across the Caraga region since 2018.",
    stats: {
      projects: "142",
      value: "₱2.8B",
      rate: "94.2%",
      experience: "6+"
    }
  });
  
  // Editable content states
  const [missionText, setMissionText] = useState("As a transformative university, CSU is a responsible steward of problem solvers and content value creators who are driven to create a sustainable future, for the region, the nation, and beyond.");
  const [visionText, setVisionText] = useState("A socially-engaged digital, innovation, and entrepreneurial university excelling globally in science, engineering, and the arts by 2028.");
  const [qualityPolicyText, setQualityPolicyText] = useState("Caraga State University, as a premier institution of higher learning endeavours to continually improve its management system in the following key results areas:\n1. Outcomes-based learning and teaching;\n2. Responsive research and community engagement;\n3. Viable resource generation and mobilization;\n4. and good governance.\n\nTowards an effective human capital formation and sustainable development of Caraga Region and beyond.");

  // Backup states
  const [missionBackup, setMissionBackup] = useState(missionText);
  const [visionBackup, setVisionBackup] = useState(visionText);
  const [qualityPolicyBackup, setQualityPolicyBackup] = useState(qualityPolicyText);
  const [objectivesBackup, setObjectivesBackup] = useState<Objective[]>([]);
  const [coreValuesBackup, setCoreValuesBackup] = useState<CoreValue[]>([]);
  const [orgCompositionBackup, setOrgCompositionBackup] = useState<OrgComposition[]>([]);
  const [contactInfoBackup, setContactInfoBackup] = useState<ContactInfo[]>([]);

  // CRUD-enabled objectives
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: '1',
      category: 'strategic',
      title: 'Transparency Excellence',
      description: 'Ensure 100% transparency through real-time monitoring and public reporting',
      target: '100%'
    },
    {
      id: '2',
      category: 'strategic',
      title: 'Delivery Excellence',
      description: 'Maintain 95% on-time project completion rate across all categories',
      target: '95%'
    },
    {
      id: '3',
      category: 'performance',
      title: 'Budget Precision',
      description: 'Budget variance within ±5% of approved allocations',
      target: '±5%'
    },
    {
      id: '4',
      category: 'performance',
      title: 'Stakeholder Excellence',
      description: 'Stakeholder satisfaction rating of 90% or higher',
      target: '90%'
    }
  ]);

  // CRUD-enabled core values
  const [coreValues, setCoreValues] = useState<CoreValue[]>([
    {
      id: '1',
      title: 'Transparency',
      description: 'Open and honest communication in all project activities and public reporting.',
      icon: 'Shield',
      color: 'emerald'
    },
    {
      id: '2',
      title: 'Excellence',
      description: 'Commitment to delivering high-quality results that exceed stakeholder expectations.',
      icon: 'CheckCircle',
      color: 'emerald'
    },
    {
      id: '3',
      title: 'Innovation',
      description: 'Embracing new technologies and methodologies to improve outcomes and efficiency.',
      icon: 'Lightbulb',
      color: 'amber'
    },
    {
      id: '4',
      title: 'Collaboration',
      description: 'Working together with stakeholders to achieve shared goals and mutual success.',
      icon: 'Handshake',
      color: 'amber'
    }
  ]);

  // CRUD-enabled organizational composition
  const [orgComposition, setOrgComposition] = useState<OrgComposition[]>([
    {
      id: '1',
      title: 'Leadership',
      description: 'Executive oversight and strategic direction for all PMO initiatives',
      icon: 'Shield'
    },
    {
      id: '2',
      title: 'Project Teams',
      description: 'Specialized teams dedicated to project execution and delivery',
      icon: 'Users'
    },
    {
      id: '3',
      title: 'Support Staff',
      description: 'Administrative and technical support for seamless operations',
      icon: 'Award'
    }
  ]);

  // CRUD-enabled contact info
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    {
      id: '1',
      type: 'address',
      label: 'Address',
      value: 'Project Management Office\nCaraga State University\nAmpayon, Butuan City\nAgusan del Norte, 8600\nPhilippines',
      icon: MapPin
    },
    {
      id: '2',
      type: 'phone',
      label: 'Phone',
      value: 'Main Office: +63 85 341-3162\nDirect Line: +63 85 341-5711\nEmergency: +63 917 123-4567\nFax: +63 85 341-5700',
      icon: Phone
    },
    {
      id: '3',
      type: 'email',
      label: 'Email',
      value: 'General: pmo@carsu.edu.ph\nProjects: projects@carsu.edu.ph\nDirector: director.pmo@carsu.edu.ph\nSupport: support.pmo@carsu.edu.ph',
      icon: Mail
    }
  ]);

  const canEdit = userRole === 'Admin' || userRole === 'Staff';

  // Local storage functions
  const loadFromStorage = useCallback(() => {
    try {
      const savedHeader = localStorage.getItem(STORAGE_KEYS.HEADER_CONTENT);
      const savedMission = localStorage.getItem(STORAGE_KEYS.MISSION_TEXT);
      const savedVision = localStorage.getItem(STORAGE_KEYS.VISION_TEXT);
      const savedQualityPolicy = localStorage.getItem(STORAGE_KEYS.QUALITY_POLICY_TEXT);
      const savedObjectives = localStorage.getItem(STORAGE_KEYS.OBJECTIVES);
      const savedCoreValues = localStorage.getItem(STORAGE_KEYS.CORE_VALUES);
      const savedOrgComposition = localStorage.getItem(STORAGE_KEYS.ORG_COMPOSITION);
      const savedContactInfo = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
      const savedTimestamp = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);

      if (savedHeader) setHeaderContent(JSON.parse(savedHeader));
      if (savedMission) setMissionText(savedMission);
      if (savedVision) setVisionText(savedVision);
      if (savedQualityPolicy) setQualityPolicyText(savedQualityPolicy);
      if (savedObjectives) setObjectives(JSON.parse(savedObjectives));
      if (savedCoreValues) setCoreValues(JSON.parse(savedCoreValues));
      if (savedOrgComposition) setOrgComposition(JSON.parse(savedOrgComposition));
      if (savedContactInfo) setContactInfo(JSON.parse(savedContactInfo));
      if (savedTimestamp) setLastSaved(new Date(savedTimestamp));
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }, []);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HEADER_CONTENT, JSON.stringify(headerContent));
      localStorage.setItem(STORAGE_KEYS.MISSION_TEXT, missionText);
      localStorage.setItem(STORAGE_KEYS.VISION_TEXT, visionText);
      localStorage.setItem(STORAGE_KEYS.QUALITY_POLICY_TEXT, qualityPolicyText);
      localStorage.setItem(STORAGE_KEYS.OBJECTIVES, JSON.stringify(objectives));
      localStorage.setItem(STORAGE_KEYS.CORE_VALUES, JSON.stringify(coreValues));
      localStorage.setItem(STORAGE_KEYS.ORG_COMPOSITION, JSON.stringify(orgComposition));
      localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(contactInfo));
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, now);
      setLastSaved(new Date(now));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }, [headerContent, missionText, visionText, qualityPolicyText, objectives, coreValues, orgComposition, contactInfo]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const trackChanges = () => {
    setHasUnsavedChanges(true);
  };

  const handleEditStart = (section: string) => {
    setEditingSection(section);
    setHasUnsavedChanges(false);
    
    // Create backups
    if (section === 'mission') setMissionBackup(missionText);
    if (section === 'vision') setVisionBackup(visionText);
    if (section === 'quality-policy') setQualityPolicyBackup(qualityPolicyText);
    if (section === 'objectives') setObjectivesBackup([...objectives]);
    if (section === 'core-values') setCoreValuesBackup([...coreValues]);
    if (section === 'org-composition') setOrgCompositionBackup([...orgComposition]);
    if (section === 'contact-info') setContactInfoBackup([...contactInfo]);
    if (section === 'header') {
      setHeaderContent(prev => ({ ...prev, _backup: { ...prev } }));
    }
  };

  const handleSave = async (sectionName: string) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      saveToStorage();
      setEditingSection(null);
      setHasUnsavedChanges(false);
      toast.success(`${sectionName} saved successfully`);
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (sectionName: string) => {
    if (editingSection === 'mission') setMissionText(missionBackup);
    if (editingSection === 'vision') setVisionText(visionBackup);
    if (editingSection === 'quality-policy') setQualityPolicyText(qualityPolicyBackup);
    if (editingSection === 'objectives') setObjectives([...objectivesBackup]);
    if (editingSection === 'core-values') setCoreValues([...coreValuesBackup]);
    if (editingSection === 'org-composition') setOrgComposition([...orgCompositionBackup]);
    if (editingSection === 'contact-info') setContactInfo([...contactInfoBackup]);
    if (editingSection === 'header' && headerContent._backup) {
      setHeaderContent(headerContent._backup);
    }
    
    setEditingSection(null);
    setHasUnsavedChanges(false);
    toast.info(`${sectionName} editing cancelled`);
  };

  // Header content handlers
  const updateHeaderContent = (field: keyof HeaderContent, value: any) => {
    setHeaderContent(prev => ({ ...prev, [field]: value }));
    trackChanges();
  };

  const updateHeaderStats = (field: string, value: string) => {
    setHeaderContent(prev => ({
      ...prev,
      stats: { ...prev.stats, [field]: value }
    }));
    trackChanges();
  };

  // Text content handlers
  const handleMissionChange = (value: string) => {
    setMissionText(value);
    trackChanges();
  };

  const handleVisionChange = (value: string) => {
    setVisionText(value);
    trackChanges();
  };

  const handleQualityPolicyChange = (value: string) => {
    setQualityPolicyText(value);
    trackChanges();
  };

  // Objectives CRUD
  const updateObjective = (id: string, updates: Partial<Objective>) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ));
    trackChanges();
  };

  const addObjective = () => {
    const newObjective: Objective = {
      id: Date.now().toString(),
      category: 'strategic',
      title: 'New Objective',
      description: 'Description of the new objective',
      target: '100%'
    };
    setObjectives([...objectives, newObjective]);
    trackChanges();
    toast.success('New objective added');
  };

  const deleteObjective = (id: string) => {
    if (objectives.length <= 1) {
      toast.error('Cannot delete the last objective');
      return;
    }
    setObjectives(objectives.filter(obj => obj.id !== id));
    trackChanges();
    toast.success('Objective removed');
  };

  // Core Values CRUD
  const updateCoreValue = (id: string, updates: Partial<CoreValue>) => {
    setCoreValues(coreValues.map(value => 
      value.id === id ? { ...value, ...updates } : value
    ));
    trackChanges();
  };

  const addCoreValue = () => {
    const newValue: CoreValue = {
      id: Date.now().toString(),
      title: 'New Value',
      description: 'Description of the new core value',
      icon: 'Shield',
      color: 'emerald'
    };
    setCoreValues([...coreValues, newValue]);
    trackChanges();
    toast.success('New core value added');
  };

  const deleteCoreValue = (id: string) => {
    if (coreValues.length <= 1) {
      toast.error('Cannot delete the last core value');
      return;
    }
    setCoreValues(coreValues.filter(value => value.id !== id));
    trackChanges();
    toast.success('Core value removed');
  };

  // Organizational Composition CRUD
  const updateOrgComposition = (id: string, updates: Partial<OrgComposition>) => {
    setOrgComposition(orgComposition.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
    trackChanges();
  };

  const addOrgComposition = () => {
    const newComp: OrgComposition = {
      id: Date.now().toString(),
      title: 'New Component',
      description: 'Description of the organizational component',
      icon: 'Users'
    };
    setOrgComposition([...orgComposition, newComp]);
    trackChanges();
    toast.success('New organizational component added');
  };

  const deleteOrgComposition = (id: string) => {
    if (orgComposition.length <= 1) {
      toast.error('Cannot delete the last organizational component');
      return;
    }
    setOrgComposition(orgComposition.filter(comp => comp.id !== id));
    trackChanges();
    toast.success('Organizational component removed');
  };

  // Contact Info CRUD
  const updateContactInfo = (id: string, updates: Partial<ContactInfo>) => {
    setContactInfo(contactInfo.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
    trackChanges();
  };

  const addContactInfo = () => {
    const newContact: ContactInfo = {
      id: Date.now().toString(),
      type: 'phone',
      label: 'New Contact',
      value: 'Contact information',
      icon: Phone
    };
    setContactInfo([...contactInfo, newContact]);
    trackChanges();
    toast.success('New contact information added');
  };

  const deleteContactInfo = (id: string) => {
    if (contactInfo.length <= 1) {
      toast.error('Cannot delete the last contact information');
      return;
    }
    setContactInfo(contactInfo.filter(contact => contact.id !== id));
    trackChanges();
    toast.success('Contact information removed');
  };

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Hero Header Section - CSU Branded with CRUD */}
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center">
                  <Building className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <CardTitle>Header Information</CardTitle>
                  <CardDescription>Main header and statistics</CardDescription>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editingSection === 'header' 
                    ? handleCancel('Header')
                    : handleEditStart('header')
                  }
                >
                  {editingSection === 'header' ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {editingSection === 'header' ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Title</label>
                    <Input
                      value={headerContent.title}
                      onChange={(e) => updateHeaderContent('title', e.target.value)}
                      className="mt-1"
                      placeholder="Office Title"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-sm">Subtitle</label>
                    <Input
                      value={headerContent.subtitle}
                      onChange={(e) => updateHeaderContent('subtitle', e.target.value)}
                      className="mt-1"
                      placeholder="University Name"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm">Description</label>
                  <Textarea
                    value={headerContent.description}
                    onChange={(e) => updateHeaderContent('description', e.target.value)}
                    className="mt-1 min-h-24"
                    placeholder="Brief description of the office"
                    maxLength={500}
                  />
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h4>Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm">Total Projects</label>
                      <Input
                        value={headerContent.stats.projects}
                        onChange={(e) => updateHeaderStats('projects', e.target.value)}
                        className="mt-1"
                        placeholder="142"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Project Value</label>
                      <Input
                        value={headerContent.stats.value}
                        onChange={(e) => updateHeaderStats('value', e.target.value)}
                        className="mt-1"
                        placeholder="₱2.8B"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Success Rate</label>
                      <Input
                        value={headerContent.stats.rate}
                        onChange={(e) => updateHeaderStats('rate', e.target.value)}
                        className="mt-1"
                        placeholder="94.2%"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Experience</label>
                      <Input
                        value={headerContent.stats.experience}
                        onChange={(e) => updateHeaderStats('experience', e.target.value)}
                        className="mt-1"
                        placeholder="6+"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center pt-4 border-t border-border">
                  <Button onClick={() => handleSave('Header')} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => handleCancel('Header')} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg" 
                         style={{ background: 'linear-gradient(135deg, var(--csu-emerald-600), var(--csu-amber-600))' }}>
                      <Building className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-1.5">CSU PMO</Badge>
                  <h1 className="text-4xl md:text-5xl tracking-tight">{headerContent.title}</h1>
                  <p className="text-xl text-muted-foreground">{headerContent.subtitle}</p>
                  <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    {headerContent.description}
                  </p>
                </div>
                
                {/* Statistics - Minimal Professional Design */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div className="text-center p-5 bg-white rounded-xl border border-border hover:border-emerald-300 transition-colors">
                    <div className="text-3xl text-emerald-700 mb-1">{headerContent.stats.projects}</div>
                    <div className="text-sm text-muted-foreground">Total Projects</div>
                  </div>
                  <div className="text-center p-5 bg-white rounded-xl border border-border hover:border-amber-300 transition-colors">
                    <div className="text-3xl text-amber-700 mb-1">{headerContent.stats.value}</div>
                    <div className="text-sm text-muted-foreground">Project Value</div>
                  </div>
                  <div className="text-center p-5 bg-white rounded-xl border border-border hover:border-emerald-300 transition-colors">
                    <div className="text-3xl text-emerald-700 mb-1">{headerContent.stats.rate}</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-5 bg-white rounded-xl border border-border hover:border-amber-300 transition-colors">
                    <div className="text-3xl text-amber-700 mb-1">{headerContent.stats.experience}</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation - Enhanced Design */}
        <Card className="bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/50">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scrollToSection('vision-mission')}
                className="gap-2 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all"
              >
                <Eye className="w-4 h-4" />
                Vision & Mission
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scrollToSection('core-values')}
                className="gap-2 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-700 transition-all"
              >
                <Shield className="w-4 h-4" />
                Core Values
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scrollToSection('personnel-org-chart')}
                className="gap-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all"
              >
                <Users className="w-4 h-4" />
                Organization
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scrollToSection('office-objectives')}
                className="gap-2 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition-all"
              >
                <Target className="w-4 h-4" />
                Objectives
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => scrollToSection('pmo-contact-details')}
                className="gap-2 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-700 transition-all"
              >
                <Contact className="w-4 h-4" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vision & Mission Section - Enhanced Formal Design */}
        <div id="vision-mission" className="space-y-6">
          {/* Vision Card */}
          <Card className="bg-gradient-to-br from-emerald-50/30 to-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Vision</CardTitle>
                    <CardDescription>Future aspirations and strategic direction</CardDescription>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingSection === 'vision' 
                      ? handleCancel('Vision')
                      : handleEditStart('vision')
                    }
                  >
                    {editingSection === 'vision' ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {editingSection === 'vision' ? (
                <div className="space-y-4">
                  <Textarea
                    value={visionText}
                    onChange={(e) => handleVisionChange(e.target.value)}
                    className="min-h-32 bg-white"
                    placeholder="Enter vision statement..."
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave('Vision')} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCancel('Vision')} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 p-6 rounded-lg border border-emerald-100">
                  <p className="leading-relaxed text-foreground">{visionText}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mission Card */}
          <Card className="bg-gradient-to-br from-amber-50/30 to-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Mission</CardTitle>
                    <CardDescription>Core purpose and institutional commitment</CardDescription>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editingSection === 'mission' 
                      ? handleCancel('Mission') 
                      : handleEditStart('mission')
                    }
                  >
                    {editingSection === 'mission' ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {editingSection === 'mission' ? (
                <div className="space-y-4">
                  <Textarea
                    value={missionText}
                    onChange={(e) => handleMissionChange(e.target.value)}
                    className="min-h-32 bg-white"
                    placeholder="Enter mission statement..."
                    maxLength={1000}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave('Mission')} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCancel('Mission')} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 p-6 rounded-lg border border-amber-100">
                  <p className="leading-relaxed text-foreground">{missionText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quality Policy Section - Enhanced Formal Design */}
        <Card className="bg-gradient-to-br from-blue-50/30 to-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quality Policy</CardTitle>
                  <CardDescription>Commitment to excellence and continuous improvement</CardDescription>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editingSection === 'quality-policy' 
                    ? handleCancel('Quality Policy') 
                    : handleEditStart('quality-policy')
                  }
                >
                  {editingSection === 'quality-policy' ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {editingSection === 'quality-policy' ? (
              <div className="space-y-4">
                <Textarea
                  value={qualityPolicyText}
                  onChange={(e) => handleQualityPolicyChange(e.target.value)}
                  className="min-h-48 bg-white"
                  placeholder="Enter quality policy statement..."
                  maxLength={2000}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave('Quality Policy')} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCancel('Quality Policy')} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 p-6 rounded-lg border border-blue-100">
                <p className="leading-relaxed text-foreground whitespace-pre-line">{qualityPolicyText}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Core Values Section with FULL CRUD - Enhanced Design */}
        <Card id="core-values" className="bg-gradient-to-br from-slate-50/50 to-white">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shadow-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg">Core Values</h3>
                  <p className="text-sm text-muted-foreground">Principles that guide our work and decisions</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  {editingSection === 'core-values' && (
                    <Button size="sm" onClick={addCoreValue}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Value
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingSection === 'core-values' 
                      ? handleCancel('Core Values')
                      : handleEditStart('core-values')
                    }
                  >
                    {editingSection === 'core-values' ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {editingSection === 'core-values' ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {coreValues.map((value) => (
                    <div key={value.id} className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Core Value</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCoreValue(value.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div>
                        <label className="text-sm">Title</label>
                        <Input
                          value={value.title}
                          onChange={(e) => updateCoreValue(value.id, { title: e.target.value })}
                          className="mt-1"
                          placeholder="Value Title"
                          maxLength={50}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm">Description</label>
                        <Textarea
                          value={value.description}
                          onChange={(e) => updateCoreValue(value.id, { description: e.target.value })}
                          className="mt-1 min-h-20"
                          placeholder="Value description"
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <label className="text-sm">Icon</label>
                        <Select 
                          value={value.icon} 
                          onValueChange={(val) => updateCoreValue(value.id, { icon: val })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center pt-6 border-t border-border">
                  <Button onClick={() => handleSave('Core Values')} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => handleCancel('Core Values')} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {coreValues.map((value) => {
                  const IconComponent = getIconComponent(value.icon);
                  
                  return (
                    <div key={value.id} className="p-4 bg-muted/30 rounded-lg border border-border hover:border-emerald-200 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-amber-100 rounded-lg flex items-center justify-center mb-3">
                        <IconComponent className="w-5 h-5 text-emerald-700" />
                      </div>
                      <h4 className="mb-2">{value.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizational Structure Section with CRUD - Enhanced Design */}
        <Card id="personnel-org-chart" className="bg-gradient-to-br from-violet-50/30 to-white">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Organizational Structure</CardTitle>
                <CardDescription>Our team structure and leadership hierarchy</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Section Introduction */}
              <div className="border-l-4 border-emerald-600 pl-4">
                <p className="text-muted-foreground leading-relaxed">
                  The PMO is structured with clear lines of authority and responsibility to ensure 
                  effective project governance and coordination across all university initiatives. 
                  Our organizational structure promotes collaboration, accountability, and innovation 
                  while maintaining the highest standards of project management excellence.
                </p>
              </div>

              {/* Organizational Chart Image with Full View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <h4>Organizational Chart</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImageClick}
                    className="gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Full View
                  </Button>
                </div>
                
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm cursor-pointer"
                       onClick={handleImageClick}>
                    <ImageWithFallback 
                      src={orgChartImage}
                      alt="PMO Organizational Chart - Caraga State University"
                      className="w-full h-auto object-contain max-h-[600px]"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => toast.error('Failed to load organizational chart')}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-card/95 backdrop-blur-sm px-3 py-2 rounded-md border border-border shadow-lg">
                        <div className="flex items-center gap-2 text-foreground text-sm">
                          <ZoomIn className="w-4 h-4" />
                          <span>Click to view full screen</span>
                        </div>
                      </div>
                    </div>
                    
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                          <p className="text-muted-foreground text-sm">Loading chart...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Organizational Composition with FULL CRUD */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <h4>Organizational Composition</h4>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      {editingSection === 'org-composition' && (
                        <Button size="sm" onClick={addOrgComposition}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Component
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editingSection === 'org-composition' 
                          ? handleCancel('Organizational Composition')
                          : handleEditStart('org-composition')
                        }
                      >
                        {editingSection === 'org-composition' ? (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {editingSection === 'org-composition' ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orgComposition.map((comp) => (
                        <div key={comp.id} className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Component</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOrgComposition(comp.id)}
                              className="text-destructive hover:text-destructive h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div>
                            <label className="text-sm">Title</label>
                            <Input
                              value={comp.title}
                              onChange={(e) => updateOrgComposition(comp.id, { title: e.target.value })}
                              className="mt-1"
                              placeholder="Component Title"
                              maxLength={50}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm">Description</label>
                            <Textarea
                              value={comp.description}
                              onChange={(e) => updateOrgComposition(comp.id, { description: e.target.value })}
                              className="mt-1 min-h-20"
                              placeholder="Component description"
                              maxLength={200}
                            />
                          </div>

                          <div>
                            <label className="text-sm">Icon</label>
                            <Select 
                              value={comp.icon} 
                              onValueChange={(val) => updateOrgComposition(comp.id, { icon: val })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ICON_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 justify-center pt-6 border-t border-border">
                      <Button onClick={() => handleSave('Organizational Composition')} disabled={saving}>
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => handleCancel('Organizational Composition')} disabled={saving}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {orgComposition.map((comp) => {
                      const IconComponent = getIconComponent(comp.icon);
                      
                      return (
                        <div key={comp.id} className="p-4 bg-card rounded-lg border border-border hover:border-emerald-500 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <IconComponent className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div className="space-y-1">
                              <h5>{comp.title}</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {comp.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objectives Section with FULL CRUD - Enhanced Design */}
        <Card id="office-objectives" className="bg-gradient-to-br from-amber-50/30 to-white">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center shadow-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg">Strategic Objectives</h3>
                  <p className="text-sm text-muted-foreground">Goals and performance targets driving our success</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  {editingSection === 'objectives' && (
                    <Button size="sm" onClick={addObjective}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Objective
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingSection === 'objectives' 
                      ? handleCancel('Objectives')
                      : handleEditStart('objectives')
                    }
                  >
                    {editingSection === 'objectives' ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {editingSection === 'objectives' ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {objectives.map((objective) => (
                    <div key={objective.id} className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Objective</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteObjective(objective.id)}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm">Category</label>
                          <Select 
                            value={objective.category} 
                            onValueChange={(val: 'strategic' | 'performance') => updateObjective(objective.id, { category: val })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="strategic">Strategic</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm">Target</label>
                          <Input
                            value={objective.target || ''}
                            onChange={(e) => updateObjective(objective.id, { target: e.target.value })}
                            className="mt-1"
                            placeholder="e.g., 100%"
                            maxLength={20}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm">Title</label>
                        <Input
                          value={objective.title}
                          onChange={(e) => updateObjective(objective.id, { title: e.target.value })}
                          className="mt-1"
                          placeholder="Objective Title"
                          maxLength={100}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm">Description</label>
                        <Textarea
                          value={objective.description}
                          onChange={(e) => updateObjective(objective.id, { description: e.target.value })}
                          className="mt-1 min-h-20"
                          placeholder="Objective description"
                          maxLength={300}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center pt-6 border-t border-border">
                  <Button onClick={() => handleSave('Objectives')} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => handleCancel('Objectives')} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {objectives.map((objective) => {
                  const bgColor = objective.category === 'strategic' ? 'bg-emerald-50' : 'bg-amber-50';
                  const borderColor = objective.category === 'strategic' ? 'border-emerald-200' : 'border-amber-200';
                  const badgeColor = objective.category === 'strategic' ? 'bg-emerald-600' : 'bg-amber-600';
                  
                  return (
                    <div key={objective.id} className={`p-5 ${bgColor} rounded-lg border ${borderColor}`}>
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`${badgeColor} text-white`}>
                          {objective.category === 'strategic' ? 'Strategic' : 'Performance'}
                        </Badge>
                        {objective.target && (
                          <div className="text-2xl text-emerald-700">{objective.target}</div>
                        )}
                      </div>
                      <h4 className="mb-2">{objective.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {objective.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information Section with FULL CRUD - Enhanced Design */}
        <Card id="pmo-contact-details" className="bg-gradient-to-br from-teal-50/30 to-white">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
                  <Contact className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">Get in touch with our PMO team</p>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2">
                  {editingSection === 'contact-info' && (
                    <Button size="sm" onClick={addContactInfo}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Contact
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editingSection === 'contact-info' 
                      ? handleCancel('Contact Information')
                      : handleEditStart('contact-info')
                    }
                  >
                    {editingSection === 'contact-info' ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {editingSection === 'contact-info' ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contactInfo.map((contact) => {
                    const IconComponent = contact.icon;
                    return (
                      <div key={contact.id} className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-4 h-4 text-emerald-700" />
                            </div>
                            <span className="text-sm">Contact Item</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContactInfo(contact.id)}
                            className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div>
                          <label className="text-sm">Label</label>
                          <Input
                            value={contact.label}
                            onChange={(e) => updateContactInfo(contact.id, { label: e.target.value })}
                            className="mt-1"
                            placeholder="e.g., Phone, Email, Address"
                            maxLength={50}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm">Contact Information</label>
                          <Textarea
                            value={contact.value}
                            onChange={(e) => updateContactInfo(contact.id, { value: e.target.value })}
                            className="mt-1 min-h-20"
                            placeholder="Enter contact details (use line breaks for multiple items)"
                            maxLength={500}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-center pt-6 border-t border-border">
                  <Button onClick={() => handleSave('Contact Information')} disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => handleCancel('Contact Information')} disabled={saving}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {contactInfo.map((contact) => {
                  const IconComponent = contact.icon;
                  return (
                    <div key={contact.id} className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-emerald-700" />
                        </div>
                        <h4>{contact.label}</h4>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {contact.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Image Modal for Organizational Chart - FULL VIEW */}
        {showImageModal && (
          <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
            <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] p-0 flex flex-col">
              <DialogHeader className="p-6 pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      PMO Organizational Chart
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      Complete organizational structure - Caraga State University PMO
                    </DialogDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageModal(false)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-auto p-6 pt-3">
                <div className="flex justify-center items-start min-h-full">
                  <ImageWithFallback 
                    src={orgChartImage}
                    alt="PMO Organizational Chart - Full Resolution"
                    className="max-w-full h-auto border border-border rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
