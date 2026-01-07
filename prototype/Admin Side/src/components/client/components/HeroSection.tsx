import React from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  BarChart3, 
  Eye, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface HeroSectionProps {
  onNavigate?: (page: string) => void;
  onSignIn?: () => void;
}

export function HeroSection({ onNavigate, onSignIn }: HeroSectionProps) {
  const keyFeatures = [
    'Real-time Project Monitoring',
    'Transparent Budget Tracking', 
    'Comprehensive Reporting',
    'Multi-Campus Operations'
  ];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-emerald-200 to-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-r from-amber-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Status Badge */}
          <div className="mb-6 flex justify-center">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 text-sm font-medium">
              <CheckCircle className="mr-2 h-4 w-4" />
              System Online • Real-time Data
            </Badge>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="block">PMO Monitoring &</span>
            <span className="block bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Evaluation Dashboard
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Ensuring transparency and accountability in 
            <span className="font-semibold text-emerald-700"> Caraga State University's </span>
            project management operations across all campuses and programs.
          </p>
          
          {/* Key Features */}
          <div className="mb-10 flex flex-wrap justify-center gap-4 text-sm">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-emerald-100">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={() => onNavigate?.('overview')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Explore Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onNavigate?.('about-us')}
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Learn About PMO
            </Button>
          </div>
          
          {/* Statistics Preview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-600 mb-1">127+</div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-amber-100 shadow-sm">
              <div className="text-2xl lg:text-3xl font-bold text-amber-600 mb-1">₱2.8B</div>
              <div className="text-sm text-gray-600">Budget Managed</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Campuses</div>
            </div>
            <div className="text-center p-4 bg-white/80 backdrop-blur rounded-xl border border-amber-100 shadow-sm">
              <div className="text-2xl lg:text-3xl font-bold text-amber-600 mb-1">15K+</div>
              <div className="text-sm text-gray-600">Students Served</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}