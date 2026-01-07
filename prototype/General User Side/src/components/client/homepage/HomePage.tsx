import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
// RBAC imports for permission-based UI
import { isAdmin as checkIsAdmin, hasPermission } from "../../../utils/supabase/client";
// Import CSU images
import csuMainBuilding from "figma:asset/b35b32a5178c477e7fcd218b38e5ada30776d086.png";
import csuAcademicFacilities from "figma:asset/a9ff58f3a16f96603636f5aa70c1af14f0c1660f.png";
// Import announcement images
import sunaImage from "figma:asset/61c3e64166b879b008d434a87dc426a6055d2fd4.png";
import csuCertificationsImage from "figma:asset/50c74750c88fc405afe075afb9fb15dc76221cbd.png";
import likhaSummitImage from "figma:asset/f749e43f45eafb715c03b72ce96894a1d40b444e.png";
import {
  Building2,
  GraduationCap,
  Wrench,
  Users,
  BarChart3,
  Download,
  Shield,
  ArrowRight,
  Award,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Eye,
  FileText,
  Heart,
  Calendar,
  Clock,
  Bell,
  Star,
} from "lucide-react";
import { ClientNavbar } from "../components/ClientNavbar";
import { HeroSection } from "../components/HeroSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { toast } from "sonner@2.0.3";
import { ClientAuthModal } from "../components/ClientAuthModal";
import {
  NavigationProps,
  EditableSection,
  GalleryImage,
} from "../types";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Announcement interfaces
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "high" | "medium" | "low";
  category: string;
  author: string;
  image?: string;
  status: "published" | "draft";
}

interface HomePageProps extends NavigationProps {}

// Enhanced Custom Arrow Components for Hero Carousel - Always visible and properly positioned
const CustomPrevArrow = ({
  onClick,
}: {
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 z-50
               bg-white/95 hover:bg-white border-2 border-emerald-600/30 hover:border-emerald-600
               text-emerald-700 hover:text-emerald-800 
               w-16 h-16 md:w-18 md:h-18 
               rounded-full shadow-2xl hover:shadow-emerald-200/50
               flex items-center justify-center 
               transition-all duration-300 ease-out
               backdrop-blur-md
               group
               hover:scale-110 active:scale-95
               focus:outline-none focus:ring-4 focus:ring-emerald-200/50"
    aria-label="Previous slide"
    title="Previous slide (← key)"
  >
    <ChevronLeft className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
  </button>
);

const CustomNextArrow = ({
  onClick,
}: {
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 z-50
               bg-white/95 hover:bg-white border-2 border-emerald-600/30 hover:border-emerald-600
               text-emerald-700 hover:text-emerald-800 
               w-16 h-16 md:w-18 md:h-18 
               rounded-full shadow-2xl hover:shadow-emerald-200/50
               flex items-center justify-center 
               transition-all duration-300 ease-out
               backdrop-blur-md
               group
               hover:scale-110 active:scale-95
               focus:outline-none focus:ring-4 focus:ring-emerald-200/50"
    aria-label="Next slide"
    title="Next slide (→ key)"
  >
    <ChevronRight className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" />
  </button>
);

export function HomePage({
  onNavigate,
  onSignIn,
  onSignOut,
  onNavigateToDashboard,
  userRole = "Client",
  userProfile,
  requireAuth,
  onAuthModalSignIn,
  demoMode = false,
}: HomePageProps) {
  // RBAC: Check user permissions for admin features
  const isAdmin = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return checkIsAdmin(user);
  }, [userProfile]);

  const canEdit = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return hasPermission(user, 'canEdit');
  }, [userProfile]);

  const canCreate = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return hasPermission(user, 'canCreate');
  }, [userProfile]);

  const canDelete = useMemo(() => {
    if (!userProfile) return false;
    const user = { user_metadata: userProfile };
    return hasPermission(user, 'canDelete');
  }, [userProfile]);

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [editingSection, setEditingSection] = useState<
    string | null
  >(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Hero carousel state management
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [currentStatsSlide, setCurrentStatsSlide] = useState(0);
  const [currentGallerySlide, setCurrentGallerySlide] =
    useState(0);

  // Carousel refs (automated carousels, no play/pause controls)
  const heroSliderRef = useRef<Slider>(null);
  const statsSliderRef = useRef<Slider>(null);
  const gallerySliderRef = useRef<Slider>(null);
  const [editableSections, setEditableSections] = useState<
    EditableSection[]
  >([
    {
      id: "hero-title",
      title: "Hero Title",
      content: "CSU Project Management Office",
      editable: true,
    },
    {
      id: "hero-subtitle",
      title: "Hero Subtitle",
      content: "Monitoring & Evaluation Dashboard",
      editable: true,
    },
    {
      id: "hero-description",
      title: "Hero Description",
      content:
        "Comprehensive project management system for Caraga State University's infrastructure development, academic programs, and institutional advancement initiatives.",
      editable: true,
    },
    {
      id: "about-title",
      title: "About Section Title",
      content: "About Our Project Management Office",
      editable: true,
    },
    {
      id: "about-description",
      title: "About Section Description",
      content: "Caraga State University's Project Management Office serves as the central hub for institutional development, ensuring transparent, efficient, and sustainable project delivery across all university operations.",
      editable: true,
    },
  ]);

  // Hero carousel images - Updated with authentic CSU imagery only
  const [heroImages, setHeroImages] = useState([
    {
      id: "1",
      src: csuMainBuilding,
      title: "CSU Main Campus Building",
      description:
        "The iconic main campus building showcasing Caraga State University's commitment to modern education and institutional excellence",
    },
    {
      id: "2", 
      src: csuAcademicFacilities,
      title: "CSU Academic Facilities",
      description:
        "State-of-the-art academic facilities supporting quality education, research, and student development at Caraga State University",
    },
  ]);

  // Announcements state management with CRUD functionality - Updated with latest CSU news
  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([
    {
      id: "1",
      title: "Likha Summit 2025",
      content:
        "Caraga State University proudly hosts the Likha Summit 2025 under the theme 'Driving Sustainable Futures Through Research and Innovations.' This prestigious event brings together international partners and stakeholders to showcase groundbreaking research and innovative solutions for sustainable development.",
      date: "2025-10-02",
      priority: "high" as const,
      category: "Research & Innovation",
      author: "CSU Research Office",
      image: likhaSummitImage,
      status: "published" as const,
    },
    {
      id: "2",
      title: "1st State of the University Address (SUnA)",
      content:
        "Dr. Rolyn C. Daguil, CSU's 3rd University President and LIKHA Developer, delivers the inaugural State of the University Address on September 30, 2025. This landmark address outlines the university's strategic direction, achievements, and commitment to excellence in higher education.",
      date: "2025-09-30",
      priority: "high" as const,
      category: "University Leadership",
      author: "Office of the President",
      image: sunaImage,
      status: "published" as const,
    },
    {
      id: "3",
      title: "CSU in Times Higher Education Impact Rankings 2025",
      content:
        "Caraga State University demonstrates its commitment to excellence through international recognition in the Times Higher Education Impact Rankings 2025. This achievement showcases CSU's dedication to competence, service, and uprightness in advancing quality education and sustainable development.",
      date: "2025-09-15",
      priority: "high" as const,
      category: "International Recognition",
      author: "CSU Quality Assurance",
      image: csuCertificationsImage,
      status: "published" as const,
    },
    {
      id: "4",
      title: "PMO Launches Monitoring & Evaluation Dashboard",
      content:
        "The Project Management Office introduces an innovative digital dashboard system for transparent project monitoring and evaluation. This platform enhances accountability and provides real-time insights into university development initiatives, ensuring efficient resource utilization and stakeholder engagement.",
      date: "2025-09-01",
      priority: "medium" as const,
      category: "Digital Innovation",
      author: "PMO Development Team",
      image: likhaSummitImage,
      status: "published" as const,
    },
  ]);

  // Announcement form state
  const [showAnnouncementForm, setShowAnnouncementForm] =
    useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: "medium" as const,
    category: "",
    author: "",
    image: "",
  });

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // Hero image management state
  const [showHeroImageForm, setShowHeroImageForm] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState<any | null>(null);
  const [heroImageForm, setHeroImageForm] = useState({
    title: "",
    description: "",
    src: "",
  });

  // Gallery state and management - Enhanced with authentic CSU imagery and recent achievements
  const [galleryImages, setGalleryImages] = useState<
    GalleryImage[]
  >([
    {
      id: "1",
      src: likhaSummitImage,
      title: "Likha Summit 2025",
      description:
        "International research summit showcasing CSU's commitment to driving sustainable futures through innovation and collaborative partnerships",
    },
    {
      id: "2",
      src: sunaImage,
      title: "State of the University Address 2025",
      description:
        "Dr. Rolyn C. Daguil delivers the inaugural SUnA, outlining CSU's vision for excellence and institutional advancement",
    },
    {
      id: "3",
      src: csuCertificationsImage,
      title: "CSU Excellence & Recognition",
      description:
        "Caraga State University's accreditations and certifications demonstrating commitment to competence, service, and uprightness",
    },
    {
      id: "4",
      src: csuMainBuilding,
      title: "CSU Main Campus Building",
      description:
        "The iconic main campus building of Caraga State University showcasing modern architectural excellence and institutional pride",
    },
    {
      id: "5",
      src: csuAcademicFacilities,
      title: "CSU Academic Facilities",
      description:
        "State-of-the-art academic facilities supporting quality education and student development at Caraga State University",
    },
    {
      id: "6",
      src: csuMainBuilding,
      title: "Campus Development Projects",
      description:
        "Ongoing infrastructure development and enhancement projects managed by the PMO for institutional advancement",
    },
  ]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [newImageForm, setNewImageForm] = useState({
    title: "",
    description: "",
    src: "",
  });
  const [selectedImage, setSelectedImage] =
    useState<GalleryImage | null>(null);

  // Stats management state
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [editingStats, setEditingStats] = useState<any | null>(null);
  const [statsForm, setStatsForm] = useState({
    title: "",
    value: "",
    description: "",
    category: "",
    color: "text-emerald-600",
  });

  // About section management
  const [editingAboutSection, setEditingAboutSection] = useState<string | null>(null);
  const [aboutFeatures, setAboutFeatures] = useState([
    {
      id: "1",
      icon: Shield,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
      title: "Transparency First",
      description: "We maintain complete transparency in all project activities through real-time monitoring, public reporting, and stakeholder engagement initiatives.",
    },
    {
      id: "2",
      icon: BarChart3,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      title: "Data-Driven Excellence",
      description: "Our decisions are backed by comprehensive data analytics, performance metrics, and evidence-based project management methodologies.",
    },
    {
      id: "3",
      icon: Users,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      title: "Community Impact",
      description: "Every project we undertake prioritizes community needs, sustainable development, and long-term institutional growth for all stakeholders.",
    },
  ]);

  // About feature management
  const [showAboutFeatureForm, setShowAboutFeatureForm] = useState(false);
  const [editingAboutFeature, setEditingAboutFeature] = useState<any | null>(null);
  const [aboutFeatureForm, setAboutFeatureForm] = useState({
    title: "",
    description: "",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-100",
  });

  // Manual navigation functions for hero carousel
  const goToNextSlide = () => {
    heroSliderRef.current?.slickNext();
  };

  const goToPrevSlide = () => {
    heroSliderRef.current?.slickPrev();
  };

  const goToSlide = (slideIndex: number) => {
    heroSliderRef.current?.slickGoTo(slideIndex);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPrevSlide();
      } else if (event.key === "ArrowRight") {
        goToNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () =>
      window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Enhanced Hero carousel configuration with custom navigation - Fixed timing
  const heroCarouselSettings = {
    dots: true, // Enable dots for better navigation
    infinite: true,
    speed: 1500, // Slower, smoother transition
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 15000, // Much longer viewing time to reduce repetition
    pauseOnHover: true, // Allow user interaction
    pauseOnFocus: true,
    fade: true, // Elegant fade transition
    cssEase: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    dotsClass: "slick-dots hero-carousel-dots",
    arrows: false, // Disable default arrows to prevent conflicts
    beforeChange: (current: number, next: number) =>
      setCurrentHeroSlide(next),
  };

  // Stats carousel configuration - Automated, formal presentation
  const statsCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true, // Always automated
    autoplaySpeed: 5000, // Slower for better readability
    pauseOnHover: true,
    pauseOnFocus: true,
    fade: false,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    dotsClass: "slick-dots slick-dots-clean",
    arrows: true,
    centerMode: false,
    centerPadding: "0px",
    beforeChange: (current: number, next: number) =>
      setCurrentStatsSlide(next),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false, // Hide arrows on mobile for clean appearance
        },
      },
    ],
  };

  // Gallery carousel configuration - Redesigned with appropriate sizing
  const galleryCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 600, // Smoother transitions
    slidesToShow: 2, // Reduced to 2 for better visibility and spacing
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500, // Faster timing for better engagement
    pauseOnHover: true,
    pauseOnFocus: true,
    fade: false,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    dotsClass: "slick-dots slick-dots-clean",
    arrows: true,
    centerMode: false,
    centerPadding: "0px",
    beforeChange: (current: number, next: number) =>
      setCurrentGallerySlide(next),
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2, // Maintain 2 on large screens for better spacing
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Keep 2 on tablets
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1, // Single slide on mobile
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  // Announcement management functions
  const handleAddAnnouncement = () => {
    if (!requireAuth?.("manage announcements")) return;

    if (
      !announcementForm.title ||
      !announcementForm.content ||
      !announcementForm.category ||
      !announcementForm.author
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: announcementForm.title,
      content: announcementForm.content,
      date: new Date().toISOString().split("T")[0],
      priority: announcementForm.priority,
      category: announcementForm.category,
      author: announcementForm.author,
      image: announcementForm.image,
      status: "published",
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "medium",
      category: "",
      author: "",
      image: "",
    });
    setShowAnnouncementForm(false);
    toast.success("Announcement added successfully");
  };

  const handleEditAnnouncement = (
    announcement: Announcement,
  ) => {
    if (!requireAuth?.("manage announcements")) return;

    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      category: announcement.category,
      author: announcement.author,
      image: announcement.image || "",
    });
    setShowAnnouncementForm(true);
  };

  const handleUpdateAnnouncement = () => {
    if (!editingAnnouncement) return;

    const updatedAnnouncement: Announcement = {
      ...editingAnnouncement,
      title: announcementForm.title,
      content: announcementForm.content,
      priority: announcementForm.priority,
      category: announcementForm.category,
      author: announcementForm.author,
      image: announcementForm.image,
    };

    setAnnouncements((prev) =>
      prev.map((ann) =>
        ann.id === editingAnnouncement.id
          ? updatedAnnouncement
          : ann,
      ),
    );

    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "medium",
      category: "",
      author: "",
      image: "",
    });
    setShowAnnouncementForm(false);
    toast.success("Announcement updated successfully");
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (!requireAuth?.("manage announcements")) return;

    setAnnouncements((prev) =>
      prev.filter((ann) => ann.id !== announcementId),
    );
    toast.success("Announcement deleted successfully");
  };

  const handleAnnouncementImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload to a server
    const reader = new FileReader();
    reader.onload = (e) => {
      setAnnouncementForm((prev) => ({
        ...prev,
        image: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const mockStats = {
          totalProjects: 127,
          activeProjects: 23,
          completedProjects: 94,
          categories: {
            construction: 45,
            operations: 32,
            repairs: 28,
            research: 22,
          },
        };

        await new Promise((resolve) =>
          setTimeout(resolve, 1000),
        );
        setStatsData(mockStats);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleEditSection = (sectionId: string) => {
    if (!requireAuth?.("edit content")) return;
    setEditingSection(sectionId);
  };

  const handleSaveSection = (
    sectionId: string,
    newContent: string,
  ) => {
    setEditableSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, content: newContent }
          : section,
      ),
    );
    setEditingSection(null);
    toast.success("Content updated successfully");
  };

  const getEditableContent = (sectionId: string) => {
    return (
      editableSections.find(
        (section) => section.id === sectionId,
      )?.content || ""
    );
  };

  // Gallery management functions
  const handleAddImage = () => {
    if (!requireAuth?.("manage gallery")) return;

    if (
      !newImageForm.title ||
      !newImageForm.description ||
      !newImageForm.src
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const newImage: GalleryImage = {
      id: Date.now().toString(),
      ...newImageForm,
    };

    setGalleryImages((prev) => [...prev, newImage]);
    setNewImageForm({ title: "", description: "", src: "" });
    setShowImageUpload(false);
    toast.success("Image added to gallery");
  };

  const handleRemoveImage = (imageId: string) => {
    if (!requireAuth?.("manage gallery")) return;

    setGalleryImages((prev) =>
      prev.filter((img) => img.id !== imageId),
    );
    toast.success("Image removed from gallery");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload to a server
    // For now, we'll use a placeholder
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImageForm((prev) => ({
        ...prev,
        src: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Stats management functions
  const handleAddStats = () => {
    if (!requireAuth?.("manage stats")) return;

    if (
      !statsForm.title ||
      !statsForm.value ||
      !statsForm.description ||
      !statsForm.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newStats = {
      id: Date.now().toString(),
      title: statsForm.title,
      value: statsForm.value,
      description: statsForm.description,
      category: statsForm.category,
      color: statsForm.color,
      icon: Building2, // Default icon, can be made configurable
    };

    setQuickStats((prev) => [...prev, newStats]);
    setStatsForm({
      title: "",
      value: "",
      description: "",
      category: "",
      color: "text-emerald-600",
    });
    setShowStatsForm(false);
    toast.success("Stats entry added successfully");
  };

  const handleEditStats = (stats: any) => {
    if (!requireAuth?.("manage stats")) return;

    setEditingStats(stats);
    setStatsForm({
      title: stats.title,
      value: stats.value,
      description: stats.description,
      category: stats.category,
      color: stats.color,
    });
    setShowStatsForm(true);
  };

  const handleUpdateStats = () => {
    if (!editingStats) return;

    const updatedStats = {
      ...editingStats,
      title: statsForm.title,
      value: statsForm.value,
      description: statsForm.description,
      category: statsForm.category,
      color: statsForm.color,
    };

    setQuickStats((prev) =>
      prev.map((stat) =>
        stat.id === editingStats.id ? updatedStats : stat,
      ),
    );

    setEditingStats(null);
    setStatsForm({
      title: "",
      value: "",
      description: "",
      category: "",
      color: "text-emerald-600",
    });
    setShowStatsForm(false);
    toast.success("Stats entry updated successfully");
  };

  const handleDeleteStats = (statsId: string) => {
    if (!requireAuth?.("manage stats")) return;

    setQuickStats((prev) => prev.filter((stat) => stat.id !== statsId));
    toast.success("Stats entry deleted successfully");
  };

  // About features management functions
  const handleAddAboutFeature = () => {
    if (!requireAuth?.("manage about features")) return;

    if (!aboutFeatureForm.title || !aboutFeatureForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newFeature = {
      id: Date.now().toString(),
      title: aboutFeatureForm.title,
      description: aboutFeatureForm.description,
      iconColor: aboutFeatureForm.iconColor,
      bgColor: aboutFeatureForm.bgColor,
      icon: Shield, // Default icon, can be made configurable
    };

    setAboutFeatures((prev) => [...prev, newFeature]);
    setAboutFeatureForm({
      title: "",
      description: "",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    });
    setShowAboutFeatureForm(false);
    toast.success("About feature added successfully");
  };

  const handleEditAboutFeature = (feature: any) => {
    if (!requireAuth?.("manage about features")) return;

    setEditingAboutFeature(feature);
    setAboutFeatureForm({
      title: feature.title,
      description: feature.description,
      iconColor: feature.iconColor,
      bgColor: feature.bgColor,
    });
    setShowAboutFeatureForm(true);
  };

  const handleUpdateAboutFeature = () => {
    if (!editingAboutFeature) return;

    const updatedFeature = {
      ...editingAboutFeature,
      title: aboutFeatureForm.title,
      description: aboutFeatureForm.description,
      iconColor: aboutFeatureForm.iconColor,
      bgColor: aboutFeatureForm.bgColor,
    };

    setAboutFeatures((prev) =>
      prev.map((feature) =>
        feature.id === editingAboutFeature.id ? updatedFeature : feature,
      ),
    );

    setEditingAboutFeature(null);
    setAboutFeatureForm({
      title: "",
      description: "",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    });
    setShowAboutFeatureForm(false);
    toast.success("About feature updated successfully");
  };

  const handleDeleteAboutFeature = (featureId: string) => {
    if (!requireAuth?.("manage about features")) return;

    setAboutFeatures((prev) => prev.filter((feature) => feature.id !== featureId));
    toast.success("About feature deleted successfully");
  };

  const [quickStats, setQuickStats] = useState([
    {
      id: "1",
      title: "Active Projects",
      value: "127",
      description:
        "Ongoing infrastructure and development projects across all categories",
      icon: Building2,
      color: "text-emerald-600",
      category: "infrastructure",
    },
    {
      id: "2",
      title: "Completed Programs",
      value: "94",
      description:
        "Successfully delivered academic and infrastructure programs",
      icon: Award,
      color: "text-emerald-600",
      category: "achievement",
    },
    {
      id: "3",
      title: "Research Projects",
      value: "22",
      description:
        "Active research and extension programs supporting university goals",
      icon: GraduationCap,
      color: "text-amber-600",
      category: "academic",
    },
    {
      id: "4",
      title: "GAD Initiatives",
      value: "18",
      description:
        "Gender and Development programs promoting equality and inclusion",
      icon: Users,
      color: "text-purple-600",
      category: "gad",
    },
    {
      id: "5",
      title: "Budget Managed",
      value: "₱2.8B",
      description:
        "Total project budget under PMO management and oversight",
      icon: BarChart3,
      color: "text-blue-600",
      category: "financial",
    },
    {
      id: "6",
      title: "Facility Improvements",
      value: "156",
      description:
        "Classroom and administrative facility enhancements completed",
      icon: Wrench,
      color: "text-amber-600",
      category: "facilities",
    },
    {
      id: "7",
      title: "Policy Documents",
      value: "89",
      description:
        "Institutional policies, agreements, and downloadable forms",
      icon: FileText,
      color: "text-indigo-600",
      category: "governance",
    },
    {
      id: "8",
      title: "Beneficiaries Served",
      value: "15,240",
      description:
        "Students, faculty, and community members directly served",
      icon: Heart,
      color: "text-rose-600",
      category: "community",
    },
  ]);

  const featuredCategories = [
    {
      id: "university-operations",
      title: "University Operations",
      description:
        "Academic programs, research initiatives, and extension services supporting the university mission.",
      icon: GraduationCap,
      stats: { projects: 32, status: "Active" },
      color: "emerald",
    },
    {
      id: "construction",
      title: "Construction & Infrastructure",
      description:
        "Major infrastructure development projects funded through various sources and partnerships.",
      icon: Building2,
      stats: { projects: 45, status: "Ongoing" },
      color: "blue",
    },
    {
      id: "gad-parity",
      title: "GAD Parity Reporting",
      description:
        "Gender equity analysis, reporting, and data management for institutional compliance.",
      icon: Users,
      stats: { reports: 12, status: "Updated" },
      color: "purple",
    },
    {
      id: "others",
      title: "Policies & Forms",
      description:
        "Governance frameworks, institutional agreements, and downloadable administrative forms.",
      icon: Shield,
      stats: { documents: 89, status: "Available" },
      color: "amber",
    },
  ];

  const EditableText = ({
    sectionId,
    children,
    className = "",
  }: {
    sectionId: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const [tempContent, setTempContent] = useState("");
    const isEditing = editingSection === sectionId;
    const content = getEditableContent(sectionId);

    useEffect(() => {
      if (isEditing) {
        setTempContent(content);
      }
    }, [isEditing, content]);

    if (!isAdmin) {
      return <div className={className}>{children}</div>;
    }

    return (
      <div className={`relative group ${className}`}>
        {isEditing ? (
          <div className="space-y-2">
            {sectionId.includes("description") ? (
              <Textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                className="w-full"
                rows={3}
              />
            ) : (
              <Input
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                className="w-full"
              />
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  handleSaveSection(sectionId, tempContent)
                }
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSection(null)}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {children}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditSection(sectionId)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientNavbar
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onNavigateToDashboard={onNavigateToDashboard}
        onAuthModalSignIn={onAuthModalSignIn}
        userProfile={userProfile}
        demoMode={demoMode}
      />

      {/* Enhanced Hero Section with Professional Navigation - Fixed positioning for navbar */}
      <section
        className="relative overflow-hidden mt-16 w-full"
        style={{ zIndex: 5 }}
      >
        <div className="relative w-full">
          <Slider
            ref={heroSliderRef}
            {...heroCarouselSettings}
            className="hero-carousel enhanced-carousel"
          >
            {heroImages.map((image, index) => (
            <div key={image.id} className="relative w-full">
              <div className="relative h-[38.5vh] md:h-[49.5vh] lg:h-[66vh] w-full overflow-hidden bg-emerald-900">
                <img
                  src={image.src}
                  alt={image.title}
                  className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[12s] ease-out"
                />
                {/* Green to black gradient overlay - Professional CSU branding */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-900/85 via-emerald-800/65 to-black/80" />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Hero Content Overlay with Enhanced Layout - Perfect alignment */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
                  <div className="max-w-6xl mx-auto text-center px-6 py-8 md:px-12 lg:px-16">


                    <EditableText
                      sectionId="hero-title"
                      className="mb-4"
                    >
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        {getEditableContent("hero-title")}
                      </h1>
                    </EditableText>

                    <EditableText
                      sectionId="hero-subtitle"
                      className="mb-6"
                    >
                      <h2 className="text-lg md:text-2xl lg:text-3xl font-medium text-emerald-100 mb-6">
                        {getEditableContent("hero-subtitle")}
                      </h2>
                    </EditableText>

                    <EditableText
                      sectionId="hero-description"
                      className="mb-8"
                    >
                      <p className="text-base md:text-lg lg:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed mb-8">
                        {getEditableContent("hero-description")}
                      </p>
                    </EditableText>

                    {/* Clean Call-to-Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                      <Button
                        onClick={() =>
                          onNavigate?.("client-about-us")
                        }
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 
                                 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Learn More About PMO
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button
                        onClick={() =>
                          onNavigate?.(
                            "client-university-operations",
                          )
                        }
                        variant="outline"
                        size="lg"
                        className="border-2 border-white bg-white/10 backdrop-blur-sm text-white 
                                 hover:bg-white hover:text-emerald-800 px-8 py-3 font-medium
                                 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Explore Projects
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>

                    {/* Simplified Slide Indicator */}
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className="inline-flex items-center space-x-2 bg-black/30 backdrop-blur-sm 
                                    rounded-full px-4 py-2 border border-white/20"
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-sm font-medium text-white">
                          {String(index + 1)} / {String(heroImages.length)}
                        </span>
                        <span className="text-xs text-emerald-100">
                          {image.title}
                        </span>
                      </div>

                      {/* Clean Progress Bar */}
                      <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                          style={{
                            width: `${((index + 1) / heroImages.length) * 100}%`,
                          }}
                        ></div>
                      </div>

                      {/* Simplified Navigation Dots */}
                      <div className="flex items-center justify-center space-x-2">
                        {heroImages.map((img, imgIndex) => (
                          <button
                            key={img.id}
                            onClick={() => goToSlide(imgIndex)}
                            className={`w-3 h-3 rounded-full transition-all duration-200 
                                      ${
                                        imgIndex === index
                                          ? "bg-emerald-400 scale-125"
                                          : "bg-white/40 hover:bg-white/60"
                                      }`}
                            aria-label={`Go to slide ${imgIndex + 1}: ${img.title}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div
                  className="absolute top-10 left-10 w-20 h-20 border-2 border-emerald-400/30 rounded-full 
                              animate-pulse hidden lg:block z-20"
                ></div>
                <div
                  className="absolute bottom-20 right-20 w-16 h-16 border-2 border-amber-400/30 rounded-full 
                              animate-pulse hidden lg:block z-20"
                ></div>
              </div>
            </div>
          ))}
          </Slider>
          
          {/* Custom Navigation Arrows */}
          <CustomPrevArrow onClick={goToPrevSlide} />
          <CustomNextArrow onClick={goToNextSlide} />
        </div>
      </section>

      {/* Latest Announcements Section with Enhanced CRUD Functionality */}
      <section className="py-12 px-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Latest Announcements
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              Stay updated with the latest CSU/PMO news and important updates
            </p>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm({
                    title: "",
                    content: "",
                    priority: "medium",
                    category: "",
                    author: "",
                    image: "",
                  });
                  setShowAnnouncementForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            )}
          </div>

          {/* Enhanced Announcement Display with Carousel Support */}
          {announcements.length > 4 ? (
            <div className="announcement-carousel-container mb-6">
              <Slider
                {...{
                  dots: true,
                  infinite: true,
                  speed: 600,
                  slidesToShow: 4,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 6000,
                  pauseOnHover: true,
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
                        arrows: false,
                      },
                    },
                  ],
                }}
                className="enhanced-carousel"
              >
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="px-2">
                    <Card className="homepage-card-hover border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 h-full">
                      {announcement.image && (
                        <div className="relative h-40 overflow-hidden bg-gray-50 dark:bg-gray-700">
                          <img
                            src={announcement.image}
                            alt={announcement.title}
                            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <CardContent className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {announcement.category}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(announcement.date)}
                          </div>
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight">
                          {announcement.title}
                        </h3>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed flex-grow">
                          {announcement.content}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate">
                            <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{announcement.author}</span>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedAnnouncement(announcement)}
                              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditAnnouncement(announcement)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
              {announcements.slice(0, 4).map((announcement) => (
                <Card
                  key={announcement.id}
                  className="homepage-card-hover border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
                >
                  {announcement.image && (
                    <div className="relative h-40 overflow-hidden bg-gray-50 dark:bg-gray-700">
                      <img
                        src={announcement.image}
                        alt={announcement.title}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-1"
                      >
                        {announcement.category}
                      </Badge>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(announcement.date)}
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {announcement.title}
                    </h3>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                      {announcement.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500 truncate">
                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {announcement.author}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setSelectedAnnouncement(announcement)
                          }
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditAnnouncement(
                                  announcement,
                                )
                              }
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteAnnouncement(
                                  announcement.id,
                                )
                              }
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Quick Stats with CRUD Functionality */}
      <section className="py-14 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              PMO at a Glance
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              Key metrics and achievements across our project portfolio
            </p>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditingStats(null);
                  setStatsForm({
                    title: "",
                    value: "",
                    description: "",
                    category: "",
                    color: "text-emerald-600",
                  });
                  setShowStatsForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stats Entry
              </Button>
            )}
          </div>

          <div className="stats-carousel-container relative mb-8">
            <Slider
              ref={statsSliderRef}
              {...statsCarouselSettings}
              className="stats-carousel enhanced-carousel"
            >
              {quickStats.map((stat, index) => (
                <div key={stat.id} className="px-2">
                  <Card className="homepage-card-hover border-gray-200 dark:border-gray-700 h-full bg-white dark:bg-gray-800 shadow-sm relative group">
                    <CardContent className="p-5 text-center">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                          stat.color === "text-emerald-600"
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-700"
                            : stat.color === "text-amber-600"
                              ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-700"
                              : stat.color === "text-purple-600"
                                ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-700"
                                : stat.color === "text-blue-600"
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-700"
                                  : stat.color === "text-indigo-600"
                                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700"
                                    : stat.color === "text-rose-600"
                                      ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-700"
                                      : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                        }`}
                      >
                        <stat.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {stat.value}
                      </h3>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">
                        {stat.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed px-1">
                        {stat.description}
                      </p>

                      {/* Admin controls */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStats(stat)}
                              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStats(stat.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Enhanced PMO Overview Section with CRUD Functionality */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <EditableText
              sectionId="about-title"
              className="mb-4"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {getEditableContent("about-title") || "About Our Project Management Office"}
              </h2>
            </EditableText>
            <EditableText
              sectionId="about-description"
              className="mb-6"
            >
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                {getEditableContent("about-description") || 
                 "Caraga State University's Project Management Office serves as the central hub for institutional development, ensuring transparent, efficient, and sustainable project delivery across all university operations."}
              </p>
            </EditableText>
            {isAdmin && (
              <Button
                onClick={() => {
                  setEditingAboutFeature(null);
                  setAboutFeatureForm({
                    title: "",
                    description: "",
                    iconColor: "text-emerald-600",
                    bgColor: "bg-emerald-100",
                  });
                  setShowAboutFeatureForm(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add About Feature
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aboutFeatures.map((feature) => (
              <Card key={feature.id} className="client-card-hover border-gray-200 text-center relative group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAboutFeature(feature)}
                          className="h-7 w-7 p-0 hover:bg-gray-100"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAboutFeature(feature.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Explore Our Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover the different areas of PMO operations and
              services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredCategories.map((category) => (
              <Card
                key={category.id}
                className="client-card-hover border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer group"
                onClick={() =>
                  onNavigate?.(`client-${category.id}`)
                }
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        category.color === "emerald"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                          : category.color === "blue"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : category.color === "purple"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <category.icon className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {category.stats.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {category.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Object.keys(category.stats)[0] ===
                        "projects" &&
                        `${category.stats.projects} Projects`}
                      {Object.keys(category.stats)[0] ===
                        "reports" &&
                        `${category.stats.reports} Reports`}
                      {Object.keys(category.stats)[0] ===
                        "documents" &&
                        `${category.stats.documents} Documents`}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PMO Gallery Showcase - Enhanced with Appropriate Sizing */}
      <section className="py-16 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                PMO in Action
              </h2>
              {isAdmin && (
                <Dialog
                  open={showImageUpload}
                  onOpenChange={setShowImageUpload}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Add New Gallery Image
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Title
                        </label>
                        <Input
                          value={newImageForm.title}
                          onChange={(e) =>
                            setNewImageForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Image title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          value={newImageForm.description}
                          onChange={(e) =>
                            setNewImageForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Image description"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Image
                        </label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleAddImage}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Add Image
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setShowImageUpload(false)
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Showcasing our university projects, achievements,
              and community engagement initiatives through
              visual documentation
            </p>
          </div>

          {/* Redesigned Gallery Carousel with Appropriate Sizing */}
          <div className="gallery-carousel-container relative mb-10">
            <Slider
              ref={gallerySliderRef}
              {...galleryCarouselSettings}
              className="gallery-carousel enhanced-carousel"
            >
              {galleryImages.map((image) => (
                <div key={image.id} className="px-4">
                  <Card className="homepage-card-hover border-gray-200 h-full overflow-hidden group bg-white shadow-sm">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setSelectedImage(image)
                          }
                          className="bg-white/95 hover:bg-white text-gray-800 p-2 h-8 w-8 rounded-full shadow-md"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveImage(image.id)
                            }
                            className="bg-red-500/95 hover:bg-red-600 text-white p-2 h-8 w-8 rounded-full shadow-md"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 text-lg leading-tight">
                        {image.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {image.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <Dialog
          open={showAnnouncementForm}
          onOpenChange={setShowAnnouncementForm}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Add New Announcement"}
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement
                  ? "Update the announcement details below"
                  : "Create a new announcement for the homepage"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category *
                  </label>
                  <Input
                    value={announcementForm.category}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g., Construction, Research, GAD"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Author *
                </label>
                <Input
                  value={announcementForm.author}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  placeholder="Author name or department"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content *
                </label>
                <Textarea
                  value={announcementForm.content}
                  onChange={(e) =>
                    setAnnouncementForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Announcement content"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Featured Image (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAnnouncementImageUpload}
                />
                {announcementForm.image && (
                  <img
                    src={announcementForm.image}
                    alt="Preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={
                    editingAnnouncement
                      ? handleUpdateAnnouncement
                      : handleAddAnnouncement
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAnnouncement
                    ? "Update"
                    : "Publish"}{" "}
                  Announcement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <Dialog
          open={!!selectedAnnouncement}
          onOpenChange={() => setSelectedAnnouncement(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <DialogTitle className="text-xl mb-2">
                    {selectedAnnouncement.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(selectedAnnouncement.date)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {selectedAnnouncement.author}
                    </div>
                    <Badge variant="outline">
                      {selectedAnnouncement.category}
                    </Badge>
                  </div>
                </div>
                <Badge
                  className={getPriorityColor(
                    selectedAnnouncement.priority,
                  )}
                >
                  {selectedAnnouncement.priority.toUpperCase()}
                </Badge>
              </div>
              <DialogDescription>
                View detailed announcement information and content
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {selectedAnnouncement.image && (
                <img
                  src={selectedAnnouncement.image}
                  alt={selectedAnnouncement.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setSelectedAnnouncement(null);
                      handleEditAnnouncement(
                        selectedAnnouncement,
                      );
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      handleDeleteAnnouncement(
                        selectedAnnouncement.id,
                      );
                      setSelectedAnnouncement(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage.title}</DialogTitle>
              <DialogDescription>
                Preview gallery image in full size
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
              <p className="text-gray-600">
                {selectedImage.description}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Stats Form Dialog */}
      {showStatsForm && (
        <Dialog
          open={showStatsForm}
          onOpenChange={setShowStatsForm}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStats ? "Edit Stats Entry" : "Add New Stats Entry"}
              </DialogTitle>
              <DialogDescription>
                {editingStats
                  ? "Update the statistics entry details below"
                  : "Create a new statistics entry for the PMO dashboard"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium">Title</label>
                  <Input
                    value={statsForm.title}
                    onChange={(e) =>
                      setStatsForm({
                        ...statsForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter stats title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Value</label>
                  <Input
                    value={statsForm.value}
                    onChange={(e) =>
                      setStatsForm({
                        ...statsForm,
                        value: e.target.value,
                      })
                    }
                    placeholder="Enter stats value"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Description</label>
                <Textarea
                  value={statsForm.description}
                  onChange={(e) =>
                    setStatsForm({
                      ...statsForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter stats description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium">Category</label>
                  <Input
                    value={statsForm.category}
                    onChange={(e) =>
                      setStatsForm({
                        ...statsForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="Enter category"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Color</label>
                  <select
                    value={statsForm.color}
                    onChange={(e) =>
                      setStatsForm({
                        ...statsForm,
                        color: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="text-emerald-600">Emerald</option>
                    <option value="text-amber-600">Amber</option>
                    <option value="text-purple-600">Purple</option>
                    <option value="text-blue-600">Blue</option>
                    <option value="text-indigo-600">Indigo</option>
                    <option value="text-rose-600">Rose</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={editingStats ? handleUpdateStats : handleAddStats}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingStats ? "Update" : "Add"} Stats
                </Button>
                <Button
                  onClick={() => {
                    setShowStatsForm(false);
                    setEditingStats(null);
                    setStatsForm({
                      title: "",
                      value: "",
                      description: "",
                      category: "",
                      color: "text-emerald-600",
                    });
                  }}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* About Feature Form Dialog */}
      {showAboutFeatureForm && (
        <Dialog
          open={showAboutFeatureForm}
          onOpenChange={setShowAboutFeatureForm}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAboutFeature ? "Edit About Feature" : "Add New About Feature"}
              </DialogTitle>
              <DialogDescription>
                {editingAboutFeature
                  ? "Update the about feature details below"
                  : "Create a new feature for the about section"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium">Title</label>
                <Input
                  value={aboutFeatureForm.title}
                  onChange={(e) =>
                    setAboutFeatureForm({
                      ...aboutFeatureForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter feature title"
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Description</label>
                <Textarea
                  value={aboutFeatureForm.description}
                  onChange={(e) =>
                    setAboutFeatureForm({
                      ...aboutFeatureForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter feature description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-medium">Icon Color</label>
                  <select
                    value={aboutFeatureForm.iconColor}
                    onChange={(e) =>
                      setAboutFeatureForm({
                        ...aboutFeatureForm,
                        iconColor: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="text-emerald-600">Emerald</option>
                    <option value="text-blue-600">Blue</option>
                    <option value="text-purple-600">Purple</option>
                    <option value="text-amber-600">Amber</option>
                    <option value="text-indigo-600">Indigo</option>
                    <option value="text-rose-600">Rose</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-medium">Background Color</label>
                  <select
                    value={aboutFeatureForm.bgColor}
                    onChange={(e) =>
                      setAboutFeatureForm({
                        ...aboutFeatureForm,
                        bgColor: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="bg-emerald-100">Emerald</option>
                    <option value="bg-blue-100">Blue</option>
                    <option value="bg-purple-100">Purple</option>
                    <option value="bg-amber-100">Amber</option>
                    <option value="bg-indigo-100">Indigo</option>
                    <option value="bg-rose-100">Rose</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={editingAboutFeature ? handleUpdateAboutFeature : handleAddAboutFeature}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAboutFeature ? "Update" : "Add"} Feature
                </Button>
                <Button
                  onClick={() => {
                    setShowAboutFeatureForm(false);
                    setEditingAboutFeature(null);
                    setAboutFeatureForm({
                      title: "",
                      description: "",
                      iconColor: "text-emerald-600",
                      bgColor: "bg-emerald-100",
                    });
                  }}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Call to Action Section - Fixed Arrow Alignment */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Us in Building Excellence
          </h2>
          <p className="text-xl text-emerald-50 mb-8 leading-relaxed">
            Partner with CSU's Project Management Office to
            drive innovation, transparency, and sustainable
            development across our university community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate?.("client-about-us")}
              size="lg"
              variant="outline"
              className="bg-white/10 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 button-with-arrow"
            >
              <Phone className="mr-2 h-5 w-5" />
              Contact PMO
              <ArrowRight className="ml-2 h-5 w-5 arrow-icon" />
            </Button>
            <Button
              onClick={() =>
                onNavigate?.(
                  "client-construction-infrastructure",
                )
              }
              size="lg"
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3 button-with-arrow"
            >
              <Building2 className="mr-2 h-5 w-5" />
              View Projects
              <ArrowRight className="ml-2 h-5 w-5 arrow-icon" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Authentication Modal */}
      {showAuthModal && (
        <ClientAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={onAuthModalSignIn}
          demoMode={demoMode}
        />
      )}
    </div>
  );
}