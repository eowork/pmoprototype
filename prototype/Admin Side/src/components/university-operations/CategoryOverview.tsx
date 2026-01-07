import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  GraduationCap,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  FlaskConical,
  Lightbulb,
  BarChart3,
  Calendar,
  CheckCircle,
  Info,
  ArrowUpRight,
  Users,
  FileText,
  ChevronRight,
  Activity,
  PieChart,
  LineChart,
  Filter,
} from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { toast } from "sonner@2.0.3";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { InsightsManager } from "./admin/InsightsManager";

interface CategoryOverviewProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
  onProjectSelect: (project: any) => void;
  userEmail?: string;
}

// Enhanced University Operations data with multi-year quarterly reporting
const UNIVERSITY_OPERATIONS_DATA = {
  overview: {
    totalIndicators: 42,
    assessedIndicators: 38,
    overallAccomplishment: 87.2,
    targetAccomplishment: 85.0,
    assessmentCycle: "Q4 2024",
    lastUpdated: "December 2024",
    totalBeneficiaries: 12850,
    totalProjects: 147,
    completedProjects: 132,
    totalStudents: 8450,
    facultyMembers: 385,
  },

  // Multi-year quarterly data for enhanced filtering
  quarterlyData: {
    2022: [
      {
        quarter: "Q1 2022",
        actual: 78.5,
        target: 75.0,
        projects: 28,
        students: 7800,
      },
      {
        quarter: "Q2 2022",
        actual: 79.2,
        target: 76.0,
        projects: 30,
        students: 7850,
      },
      {
        quarter: "Q3 2022",
        actual: 80.1,
        target: 77.0,
        projects: 32,
        students: 7900,
      },
      {
        quarter: "Q4 2022",
        actual: 81.0,
        target: 78.0,
        projects: 34,
        students: 7950,
      },
    ],
    2023: [
      {
        quarter: "Q1 2023",
        actual: 82.3,
        target: 79.0,
        projects: 32,
        students: 8100,
      },
      {
        quarter: "Q2 2023",
        actual: 83.1,
        target: 80.0,
        projects: 34,
        students: 8150,
      },
      {
        quarter: "Q3 2023",
        actual: 83.8,
        target: 81.0,
        projects: 36,
        students: 8200,
      },
      {
        quarter: "Q4 2023",
        actual: 84.5,
        target: 82.0,
        projects: 38,
        students: 8250,
      },
    ],
    2024: [
      {
        quarter: "Q1 2024",
        actual: 85.2,
        target: 82.0,
        projects: 35,
        students: 8200,
      },
      {
        quarter: "Q2 2024",
        actual: 86.8,
        target: 83.0,
        projects: 38,
        students: 8350,
      },
      {
        quarter: "Q3 2024",
        actual: 87.2,
        target: 85.0,
        projects: 36,
        students: 8420,
      },
      {
        quarter: "Q4 2024",
        actual: 87.2,
        target: 85.0,
        projects: 38,
        students: 8450,
      },
    ],
  },

  performanceTrends: [
    {
      period: "Jan",
      higher: 87.5,
      advanced: 80.2,
      research: 92.1,
      extension: 89.3,
    },
    {
      period: "Feb",
      higher: 88.1,
      advanced: 81.0,
      research: 93.2,
      extension: 90.1,
    },
    {
      period: "Mar",
      higher: 88.7,
      advanced: 81.8,
      research: 94.0,
      extension: 90.8,
    },
    {
      period: "Apr",
      higher: 89.2,
      advanced: 82.1,
      research: 94.5,
      extension: 91.2,
    },
    {
      period: "May",
      higher: 89.0,
      advanced: 82.3,
      research: 94.2,
      extension: 91.5,
    },
    {
      period: "Jun",
      higher: 88.9,
      advanced: 82.0,
      research: 93.8,
      extension: 91.3,
    },
    {
      period: "Jul",
      higher: 89.1,
      advanced: 81.5,
      research: 94.1,
      extension: 91.0,
    },
    {
      period: "Aug",
      higher: 88.8,
      advanced: 81.8,
      research: 94.3,
      extension: 91.4,
    },
    {
      period: "Sep",
      higher: 88.6,
      advanced: 82.2,
      research: 94.0,
      extension: 91.6,
    },
    {
      period: "Oct",
      higher: 88.9,
      advanced: 82.5,
      research: 94.4,
      extension: 91.8,
    },
    {
      period: "Nov",
      higher: 88.7,
      advanced: 82.3,
      research: 94.2,
      extension: 91.5,
    },
    {
      period: "Dec",
      higher: 88.7,
      advanced: 82.3,
      research: 94.2,
      extension: 91.5,
    },
  ],

  kpiMetrics: [
    {
      label: "Student Satisfaction",
      value: 92.4,
      target: 90.0,
      trend: "up",
    },
    {
      label: "Faculty Development",
      value: 89.7,
      target: 85.0,
      trend: "up",
    },
    {
      label: "Research Output",
      value: 94.8,
      target: 90.0,
      trend: "up",
    },
    {
      label: "Community Impact",
      value: 91.2,
      target: 88.0,
      trend: "up",
    },
    {
      label: "International Collaboration",
      value: 76.3,
      target: 80.0,
      trend: "down",
    },
    {
      label: "Graduate Employment",
      value: 88.9,
      target: 85.0,
      trend: "up",
    },
  ],

  programs: [
    {
      id: "higher-education-program",
      name: "Higher Education Program",
      icon: BookOpen,
      indicators: 12,
      assessed: 11,
      actual: 88.7,
      target: 85.0,
      status: "Exceeding Target",
      objective:
        "Relevant and quality tertiary education ensured to achieve inclusive growth",
      beneficiaries: 4850,
      projects: 38,
      completion: 92.1,
      metrics: {
        enrollment: 92.3,
        faculty: 89.1,
        graduation: 94.2,
        employment: 85.7,
        satisfaction: 91.5,
        retention: 87.8,
      },
    },
    {
      id: "advanced-education-program",
      name: "Advanced Education Program",
      icon: Award,
      indicators: 8,
      assessed: 7,
      actual: 82.3,
      target: 80.0,
      status: "On Track",
      objective:
        "Higher Education Research Improved to promote economic productivity",
      beneficiaries: 2180,
      projects: 24,
      completion: 87.5,
      metrics: {
        graduate: 85.4,
        doctoral: 78.2,
        research: 89.7,
        qualification: 92.1,
        collaboration: 76.8,
        publications: 84.3,
      },
    },
    {
      id: "research-program",
      name: "Research Program",
      icon: FlaskConical,
      indicators: 15,
      assessed: 14,
      actual: 94.2,
      target: 90.0,
      status: "Exceeding Target",
      objective:
        "Higher Education Research Improved to promote innovation",
      beneficiaries: 3420,
      projects: 56,
      completion: 96.4,
      metrics: {
        output: 96.3,
        publications: 92.8,
        patents: 89.4,
        citations: 94.7,
        collaboration: 88.9,
        funding: 91.2,
      },
    },
    {
      id: "technical-advisory-extension-program",
      name: "Technical Advisory Extension",
      icon: Lightbulb,
      indicators: 7,
      assessed: 6,
      actual: 91.5,
      target: 88.0,
      status: "Exceeding Target",
      objective: "Community engagement increased",
      beneficiaries: 2400,
      projects: 29,
      completion: 93.1,
      metrics: {
        beneficiaries: 94.2,
        projects: 89.1,
        trainings: 91.8,
        impact: 90.7,
        outreach: 92.5,
        partnerships: 87.3,
      },
    },
  ],

  insights: {
    achievements: [
      "Research Program consistently exceeding targets with 4.2% variance above expectations",
      "Higher Education Program demonstrating strong performance in student outcomes with 92.3% enrollment satisfaction",
      "Extension services achieving significant community impact with 2,400+ direct beneficiaries",
      "Advanced Education Program showing steady improvement in graduate-level indicators with 92.1% faculty qualification rate",
    ],
    improvements: [
      "Advanced Education Program requires enhanced faculty development initiatives to reach optimal targets",
      "Strengthen international collaboration metrics across all programs for global competitiveness",
      "Improve baseline measurements for accurate targeting in Higher Education retention rates",
      "Expand extension program assessment criteria to capture broader community socio-economic impact",
    ],
    recommendations: [
      "Implement integrated cross-program collaboration initiatives to maximize resource efficiency",
      "Develop comprehensive digital transformation roadmap for enhanced monitoring and evaluation",
      "Establish strategic partnerships with international institutions for knowledge exchange",
      "Create unified assessment framework for consistent performance measurement across all programs",
    ],
  },
};

export function CategoryOverview({
  userRole,
  requireAuth,
  onNavigate,
  onProjectSelect,
  userEmail = 'user@carsu.edu.ph'
}: CategoryOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [data] = useState(UNIVERSITY_OPERATIONS_DATA);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Exceeding Target":
        return "text-green-700 bg-green-50 border-green-200";
      case "On Track":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "Needs Attention":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  // Get quarterly data for selected year
  const getQuarterlyData = () => {
    return (
      data.quarterlyData[selectedYear] ||
      data.quarterlyData["2024"]
    );
  };

  // Get filtered programs data based on selected year - DASHBOARD FILTER FIX
  const getFilteredPrograms = () => {
    const yearData = getQuarterlyData();
    const yearProjects = yearData.reduce(
      (sum, q) => sum + q.projects,
      0,
    );
    const yearStudents =
      yearData[yearData.length - 1]?.students ||
      data.overview.totalStudents;

    // Adjust program data based on selected year
    return data.programs.map((program) => ({
      ...program,
      // Scale project numbers based on year data
      projects: Math.round(
        program.projects *
          (yearProjects / data.overview.totalProjects),
      ),
      // Adjust other metrics to reflect year filter
      actual:
        selectedYear === "2022"
          ? program.actual - 8
          : selectedYear === "2023"
            ? program.actual - 4
            : program.actual,
      completion:
        selectedYear === "2022"
          ? program.completion - 6
          : selectedYear === "2023"
            ? program.completion - 3
            : program.completion,
    }));
  };

  // Get filtered summary cards data based on selected year - DASHBOARD FILTER FIX
  const getFilteredSummaryData = () => {
    const yearData = getQuarterlyData();
    const avgPerformance =
      yearData.reduce((sum, q) => sum + q.actual, 0) /
      yearData.length;
    const totalProjects = yearData.reduce(
      (sum, q) => sum + q.projects,
      0,
    );
    const completedProjects = Math.round(totalProjects * 0.85); // Assume 85% completion rate

    return {
      assessedIndicators: Math.round(
        data.overview.assessedIndicators *
          (avgPerformance /
            data.overview.overallAccomplishment),
      ),
      totalIndicators: data.overview.totalIndicators,
      overallAccomplishment: avgPerformance,
      targetAccomplishment:
        yearData.reduce((sum, q) => sum + q.target, 0) /
        yearData.length,
      totalProjects: totalProjects,
      completedProjects: completedProjects,
    };
  };

  // Available years for filtering
  const availableYears = Object.keys(data.quarterlyData).sort(
    (a, b) => b.localeCompare(a),
  );

  // Get year-specific insights based on selected year
  const getYearSpecificInsights = () => {
    const currentYear = parseInt(selectedYear);
    const baseInsights = data.insights;

    // Modify insights based on selected year
    if (currentYear === 2022) {
      return {
        achievements: [
          "Foundational year establishing baseline performance metrics across all programs",
          "Higher Education Program launched with 78.5% initial accomplishment rate",
          "Research Program showing early promise with consistent growth trajectory",
          "Extension services initiated community engagement protocols",
        ],
        improvements: [
          "Establish comprehensive assessment frameworks for all program categories",
          "Develop baseline measurements for accurate year-on-year comparison",
          "Implement standardized reporting procedures across departments",
          "Strengthen data collection methodologies for enhanced monitoring",
        ],
        recommendations: [
          "Invest in assessment infrastructure and training programs",
          "Establish multi-year strategic planning framework",
          "Create integrated monitoring and evaluation systems",
          "Develop baseline benchmarks for future performance measurement",
        ],
      };
    } else if (currentYear === 2023) {
      return {
        achievements: [
          "Significant improvement in Research Program with 84.5% accomplishment by Q4",
          "Higher Education Program showing steady growth in student satisfaction metrics",
          "Extension services expanding reach with 2,100+ beneficiaries engaged",
          "Advanced Education Program establishing doctoral and graduate protocols",
        ],
        improvements: [
          "Continue strengthening Advanced Education Program targets and outcomes",
          "Enhance international collaboration opportunities across programs",
          "Improve retention rates in Higher Education through enhanced support",
          "Expand extension program impact measurement criteria",
        ],
        recommendations: [
          "Develop strategic partnerships for knowledge exchange and collaboration",
          "Implement comprehensive faculty development programs",
          "Create integrated assessment framework for consistent measurement",
          "Establish quality assurance protocols across all operations",
        ],
      };
    }

    // Default to current year (2024) insights
    return baseInsights;
  };

  // Chart interaction handlers
  const handleChartClick = (data: any, chartType: string) => {
    console.log("Chart clicked:", chartType, data);

    if (chartType === "performance" && data.payload) {
      const programName = data.payload.name;
      const programId = data.payload.id;
      if (programId) {
        onNavigate(programId);
        toast.success(
          `Exploring ${programName} performance details`,
        );
      }
    } else if (chartType === "quarterly" && data.payload) {
      const quarter = data.payload.quarter;
      toast.info(`Viewing ${quarter} performance details`);
    }
  };

  const handleKPIClick = (kpi: any) => {
    toast.info(
      `Analyzing ${kpi.label} metrics across all programs`,
    );
  };

  return (
    <div className="h-full overflow-auto admin-page-bg">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Header Section */}
        <div className="admin-card">
          <div className="p-6 space-y-5">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <GraduationCap className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-gray-900 text-2xl mb-1">
                    University Operations
                  </h1>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Assessment-based monitoring and evaluation dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Badge
                  variant="secondary"
                  className="px-4 py-1.5 bg-green-50 text-green-700 border-green-200 text-center"
                >
                  <Target className="w-4 h-4 mr-1.5" />
                  {data.overview.overallAccomplishment}% Achievement
                </Badge>
                <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 h-9">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Updated {data.overview.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{data.overview.assessmentCycle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>{data.overview.totalStudents.toLocaleString()} Students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-600" />
                <span>{data.overview.facultyMembers} Faculty</span>
              </div>
            </div>

            {/* Assessment Year Filter */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 mt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Filter className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base text-gray-900 mb-1">
                      Assessment Year Filter
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Filter data across all tabs and 4 subcategories: Higher Education, Advanced Education, Research, and Extension
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-gray-700">
                    Viewing Year:
                  </span>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger className="w-32 bg-white border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500">
                    ({getQuarterlyData().length} quarters)
                  </span>
                </div>
              </div>

              {/* Year Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-blue-100">
                <div className="text-center">
                  <div className="text-lg text-blue-700">
                    {(
                      getQuarterlyData().reduce(
                        (sum, q) => sum + q.actual,
                        0,
                      ) / getQuarterlyData().length
                    ).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Avg Performance
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-green-700">
                    {getQuarterlyData().reduce(
                      (sum, q) => sum + q.projects,
                      0,
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Total Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-purple-700">
                    {getQuarterlyData()[
                      getQuarterlyData().length - 1
                    ]?.students.toLocaleString() || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Student Population
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg text-orange-700">
                    {getQuarterlyData().length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Quarters Assessed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <div className="admin-card p-1">
            <TabsList className="bg-transparent border-0 p-0 w-full grid grid-cols-3 gap-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm"
              >
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm"
              >
                <PieChart className="w-4 h-4 mr-1.5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 border border-transparent py-2.5 text-sm"
              >
                <TrendingUp className="w-4 h-4 mr-1.5" />
                Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Filter Status Indicator */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <Filter className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-gray-700">
                Dashboard data filtered for <strong>{selectedYear}</strong> assessment year.
                All metrics and program data reflect the selected time period.
              </AlertDescription>
            </Alert>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="admin-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1.5">
                        Assessment Progress
                      </p>
                      <p className="text-2xl text-gray-900">
                        {getFilteredSummaryData().assessedIndicators}
                        /
                        {getFilteredSummaryData().totalIndicators}
                      </p>
                      <p className="text-sm text-green-600 mt-1.5">
                        {(
                          (getFilteredSummaryData().assessedIndicators /
                            getFilteredSummaryData().totalIndicators) *
                          100
                        ).toFixed(1)}% Complete
                      </p>
                    </div>
                    <div className="p-2.5 bg-blue-50 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={
                        (getFilteredSummaryData().assessedIndicators /
                          getFilteredSummaryData().totalIndicators) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1.5">
                        Overall Achievement
                      </p>
                      <p className="text-2xl text-gray-900">
                        {getFilteredSummaryData().overallAccomplishment.toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-600 mt-1.5">
                        +{(
                          getFilteredSummaryData().overallAccomplishment -
                          getFilteredSummaryData().targetAccomplishment
                        ).toFixed(1)}% above target
                      </p>
                    </div>
                    <div className="p-2.5 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={getFilteredSummaryData().overallAccomplishment}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Total Projects
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {getFilteredSummaryData().totalProjects}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {
                          getFilteredSummaryData()
                            .completedProjects
                        }{" "}
                        completed
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formal Program Categories */}
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                  Academic Programs
                </h2>
                <p className="text-slate-600">
                  Institutional assessment framework for
                  university operations and educational
                  excellence
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getFilteredPrograms().map((program) => {
                  // Calculate projects fraction - completed/total with seamless null handling
                  const completedProjects = Math.round(
                    program.projects *
                      (program.completion / 100),
                  );
                  const projectsDisplay =
                    program.projects > 0
                      ? `${completedProjects}/${program.projects}`
                      : "";

                  return (
                    <Card
                      key={program.id}
                      className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => {
                        onNavigate(program.id);
                        toast.success(
                          `Accessing ${program.name}`,
                        );
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <program.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-blue-900 transition-colors leading-tight">
                                {program.name}
                              </CardTitle>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                              <span>
                                {program.indicators} Indicators
                              </span>
                              <span>•</span>
                              <span>
                                {program.projects} Projects
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(program.status)} text-xs font-medium`}
                            >
                              {program.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Performance Summary - REPLACED BENEFICIARIES WITH PROJECTS */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-slate-900">
                              {program.actual.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                              Achievement
                            </div>
                          </div>
                          <div className="text-center">
                            {projectsDisplay ? (
                              <div className="text-lg font-semibold text-slate-900">
                                {projectsDisplay}
                              </div>
                            ) : (
                              <div className="text-lg font-semibold text-slate-400">
                                —
                              </div>
                            )}
                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                              Projects
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-slate-900">
                              {program.completion.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                              Completion
                            </div>
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700">
                              Progress vs Target
                            </span>
                            <span className="text-slate-600">
                              {program.actual.toFixed(1)}% /{" "}
                              {program.target}%
                            </span>
                          </div>
                          <Progress
                            value={program.actual}
                            className="h-1.5"
                          />
                        </div>

                        {/* Program Objective */}
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {program.objective}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Quarterly Performance Trend with Year Filter */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-600" />
                      Quarterly Performance Trend
                    </CardTitle>
                    <CardDescription>
                      Target vs actual accomplishment tracking
                      across quarters with year filtering
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <RechartsLineChart data={getQuarterlyData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="quarter"
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        domain={[70, 95]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Actual Performance"
                        dot={{
                          fill: "#3b82f6",
                          strokeWidth: 2,
                          r: 4,
                          cursor: "pointer",
                        }}
                        onClick={(data) =>
                          handleChartClick(data, "quarterly")
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target Performance"
                        dot={{
                          fill: "#64748b",
                          strokeWidth: 2,
                          r: 3,
                          cursor: "pointer",
                        }}
                        onClick={(data) =>
                          handleChartClick(data, "quarterly")
                        }
                        style={{ cursor: "pointer" }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>
                    Viewing quarterly assessment data for{" "}
                    <strong>{selectedYear}</strong> across all 4
                    subcategories. Year filter enables
                    cross-temporal analysis of university
                    operations performance. Each quarter
                    represents aggregated accomplishment rates
                    from Higher Education, Advanced Education,
                    Research, and Extension programs.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* KPI Dashboard */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Critical success metrics across all university
                  operations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.kpiMetrics.map((kpi, index) => (
                    <div
                      key={index}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleKPIClick(kpi)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {kpi.label}
                        </span>
                        <div
                          className={`flex items-center gap-1 ${
                            kpi.trend === "up"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {kpi.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4 rotate-180" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900">
                          {kpi.value}%
                        </span>
                        <span className="text-sm text-slate-500">
                          / {kpi.target}%
                        </span>
                      </div>
                      <Progress
                        value={kpi.value}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab - Enhanced with Year Filter */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Filter Status Indicator */}
            <Alert>
              <Filter className="h-4 w-4" />
              <AlertDescription>
                Analytics data filtered for{" "}
                <strong>{selectedYear}</strong> across all 4
                subcategories. Change year filter above to view
                different time periods.
              </AlertDescription>
            </Alert>

            {/* Year-Filtered Performance Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-purple-600" />
                      {selectedYear} Quarterly Performance
                      Analytics
                    </CardTitle>
                    <CardDescription>
                      Detailed quarterly performance tracking
                      for {selectedYear} across all programs
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 border-purple-200 text-purple-700"
                  >
                    {getQuarterlyData().length} Quarters
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <AreaChart data={getQuarterlyData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="quarter"
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        domain={[70, 95]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                        name="Actual Performance"
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="#64748b"
                        fill="#64748b"
                        fillOpacity={0.3}
                        name="Target Performance"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  <p>
                    Analytics showing {selectedYear} quarterly
                    data with average performance of{" "}
                    {(
                      getQuarterlyData().reduce(
                        (sum, q) => sum + q.actual,
                        0,
                      ) / getQuarterlyData().length
                    ).toFixed(1)}
                    % across all university operations
                    subcategories.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Year-Based Summary Statistics - ENHANCED WITH 2 ADDITIONAL VISUALS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Peak Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(
                      ...getQuarterlyData().map(
                        (q) => q.actual,
                      ),
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Highest quarterly achievement in{" "}
                    {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Average Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {(
                      getQuarterlyData().reduce(
                        (sum, q) => sum + q.actual,
                        0,
                      ) / getQuarterlyData().length
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Mean accomplishment for {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {getQuarterlyData().reduce(
                      (sum, q) => sum + q.projects,
                      0,
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Cumulative projects in {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Target Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {(
                      getQuarterlyData().reduce(
                        (sum, q) => sum + q.actual,
                        0,
                      ) /
                        getQuarterlyData().length -
                      getQuarterlyData().reduce(
                        (sum, q) => sum + q.target,
                        0,
                      ) /
                        getQuarterlyData().length
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Above/below target variance
                  </p>
                </CardContent>
              </Card>

              {/* ADDITIONAL MINI VISUAL 1: Student Engagement Rate */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Student Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(
                      (getQuarterlyData()[
                        getQuarterlyData().length - 1
                      ]?.students || 8000) / 100,
                    )}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Active participation rate in {selectedYear}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.round((getQuarterlyData()[getQuarterlyData().length - 1]?.students || 8000) / 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ADDITIONAL MINI VISUAL 2: Performance Consistency */}
              <Card className="bg-white shadow-sm border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Consistency Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-teal-600">
                    {(
                      100 -
                      (Math.max(
                        ...getQuarterlyData().map(
                          (q) => q.actual,
                        ),
                      ) -
                        Math.min(
                          ...getQuarterlyData().map(
                            (q) => q.actual,
                          ),
                        ))
                    ).toFixed(0)}
                    %
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Performance stability in {selectedYear}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {getQuarterlyData().map((q, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-slate-200 rounded-sm h-2"
                      >
                        <div
                          className="bg-teal-600 h-2 rounded-sm transition-all duration-300"
                          style={{
                            width: `${(q.actual / 100) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ADDITIONAL CHART VISUAL 3: Program Comparison Mini Chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Program Performance Comparison ({selectedYear}
                  )
                </CardTitle>
                <CardDescription>
                  Achievement rates across all four university
                  operation programs
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-48">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={getFilteredPrograms().map((p) => ({
                        name: p.name.split(" ")[0],
                        actual: p.actual,
                        target: p.target,
                      }))}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={11}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        domain={[70, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="actual"
                        fill="#10b981"
                        name="Actual"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="target"
                        fill="#64748b"
                        name="Target"
                        radius={[2, 2, 0, 0]}
                        opacity={0.5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab - Enhanced with CRUD and RBAC */}
          <TabsContent value="insights" className="space-y-6">
            {/* Filter Status Indicator */}
            <Alert className="border-blue-200 bg-blue-50/50">
              <Filter className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-gray-700">
                Insights filtered for <strong>{selectedYear}</strong> assessment data.
                Content adapts based on selected year performance and context.
              </AlertDescription>
            </Alert>

            {/* Insights Manager with CRUD */}
            <InsightsManager
              userRole={userRole}
              userEmail={userEmail}
              selectedYear={selectedYear}
              insights={getYearSpecificInsights()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}