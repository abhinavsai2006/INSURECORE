import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  HeartPulse,
  Car,
  Plane,
  Home,
  Users,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  Award,
  Clock,
  Building2,
  FileCheck,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Lock,
  Search,
  MapPin,
  FileText,
  DollarSign,
  Smartphone,
  UserCheck,
  ShieldAlert,
  Briefcase,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calculator,
  Building,
  SmartphoneNfc,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Hospital Search state
  const [hospitalSearch, setHospitalSearch] = useState('');

  // Claim Journey state
  const [claimFlowType, setClaimFlowType] = useState<'cashless' | 'reimbursement'>('cashless');

  // Premium Calculator Widget State
  const [calcAge, setCalcAge] = useState<number>(30);
  const [calcSumInsured, setCalcSumInsured] = useState<number>(1000000); // ₹10 Lakh default
  const [calcCityTier, setCalcCityTier] = useState<string>('Tier 1');
  const [calcFamilySize, setCalcFamilySize] = useState<string>('1 Adult + 1 Child');

  const calculateQuote = () => {
    let base = calcSumInsured * 0.0012; // 0.12% base
    if (calcAge > 45) base *= 1.5;
    if (calcAge > 60) base *= 2.2;
    if (calcCityTier === 'Tier 1') base *= 1.15;
    const monthly = Math.round(base / 12);
    const annual = Math.round(base);
    return { monthly, annual };
  };

  const quote = calculateQuote();

  const faqs = [
    {
      q: 'How fast are cashless hospital claims processed on InsureCore?',
      a: 'InsureCore offers automated 20-minute cashless hospital pre-authorization approvals across 10,500+ partner hospitals nationwide under IRDAI guidelines.',
    },
    {
      q: 'Can I claim tax deduction under Section 80D for health insurance premiums?',
      a: 'Yes! All health insurance premiums paid on InsureCore qualify for tax exemption under Section 80D up to ₹50,000 per financial year. 1-click tax receipts are generated instantly upon payment.',
    },
    {
      q: 'What is included in the Motor Zero-Depreciation Cover?',
      a: 'Our Zero-Dep Policy guarantees 100% reimbursement on replacement of rubber, plastic, glass, and metal vehicle parts without deducting depreciation value across 6,200+ cashless network garages.',
    },
    {
      q: 'How do I port my existing insurance policy to InsureCore?',
      a: 'Under IRDAI Portability Guidelines, you can transfer your policy from any insurer (Niva Bupa, Star Health, Care, HDFC Ergo) at renewal while retaining 100% credit for pre-existing disease waiting periods and No-Claim Bonuses.',
    },
    {
      q: 'Where can I file a statutory grievance with the Insurance Ombudsman?',
      a: 'If your grievance is not resolved within 15 days by our Grievance Redressal Officer (gro@insurecore.com), you can escalate to the IRDAI Bima Bharosa IGMS Portal at bimabharosa.irdai.gov.in or your local Insurance Ombudsman Office.',
    },
  ];

  const networkHospitalsList = [
    { name: 'Fortis Super Speciality Hospital', city: 'Mumbai', pincode: '400080', type: 'Cashless Hospital' },
    { name: 'Apollo Hospitals Bannerghatta', city: 'Bangalore', pincode: '560076', type: 'Cashless Hospital' },
    { name: 'Max Super Speciality Saket', city: 'Delhi NCR', pincode: '110017', type: 'Cashless Hospital' },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', pincode: '400053', type: 'Cashless Hospital' },
    { name: 'Manipal Hospital Old Airport Road', city: 'Bangalore', pincode: '560017', type: 'Cashless Hospital' },
    { name: 'Yashoda Hospitals Somajiguda', city: 'Hyderabad', pincode: '500082', type: 'Cashless Hospital' },
    { name: 'Carnation Auto Multi-Brand Workshop', city: 'Mumbai', pincode: '400093', type: 'Cashless Garage' },
    { name: 'Mahindra First Choice Authorized Workshop', city: 'Delhi NCR', pincode: '110020', type: 'Cashless Garage' },
  ];

  const filteredHospitals = networkHospitalsList.filter(
    (h) =>
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.pincode.includes(hospitalSearch)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header / Nav & Compliance Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            100% Cashless Hospitalization & Instant Digital Issuance | IRDAI Regulated Insurer
          </span>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-[11px] font-bold">
          <span className="flex items-center text-blue-400">
            <PhoneCall className="w-3.5 h-3.5 mr-1" /> 24x7 Support: 1800-200-INSURE
          </span>
          <span className="text-emerald-400">Solvency Ratio: 1.98x (Mandated 1.5x)</span>
          <span>10,500+ Hospitals | 6,200+ Garages</span>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">INSURECORE</span>
              <p className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">General & Health Insurance</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-700">
            <a href="#plans" className="hover:text-blue-600 transition flex items-center">
              <HeartPulse className="w-4 h-4 mr-1.5 text-blue-600" /> Protection Plans
            </a>
            <a href="#tiers" className="hover:text-blue-600 transition flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-blue-600" /> Compare Tiers
            </a>
            <a href="#calculator" className="hover:text-blue-600 transition flex items-center">
              <Calculator className="w-4 h-4 mr-1.5 text-blue-600" /> Quote Calculator
            </a>
            <a href="#hospitals" className="hover:text-blue-600 transition flex items-center">
              <Building2 className="w-4 h-4 mr-1.5 text-blue-600" /> Cashless Network
            </a>
            <a href="#claims" className="hover:text-blue-600 transition flex items-center">
              <Zap className="w-4 h-4 mr-1.5 text-blue-600" /> Claims Journey
            </a>
            <a href="#portability" className="hover:text-blue-600 transition flex items-center">
              <RefreshCw className="w-4 h-4 mr-1.5 text-blue-600" /> Policy Portability
            </a>
            <a href="#governance" className="hover:text-blue-600 transition flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" /> Governance & GRO
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="font-bold border-slate-300 text-slate-700 hover:bg-slate-100">
                Portal Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="font-bold">
                Get Instant Quote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-8">
            <CheckCircle2 className="w-4 h-4 text-blue-400" /> 98.4% Claims Settlement Ratio | CRISIL AAA Rated
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight">
            Protection That Shields What <span className="text-blue-400">Matters Most</span>
          </h1>

          <p className="mt-6 text-slate-300 text-base md:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            Paperless digital policy issuance in 2 minutes, 20-minute cashless hospital pre-authorization, Section 80D tax exemption receipts, and coverage up to ₹1,00,00,000.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/register">
              <Button size="lg" variant="primary" className="w-full sm:w-auto font-extrabold px-8 shadow-lg">
                Explore Protection Plans <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition shadow-sm"
              >
                Sign In to Policyholder Portal
              </button>
            </Link>
          </div>

          {/* Stat Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto mt-16 pt-12 border-t border-slate-800 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-400">98.4%</span>
              <p className="text-xs text-slate-300 font-medium mt-1">Claim Settlement Ratio</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-400">1.98x</span>
              <p className="text-xs text-slate-300 font-medium mt-1">Solvency Ratio (vs 1.5x)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-400">10,500+</span>
              <p className="text-xs text-slate-300 font-medium mt-1">Cashless Hospitals</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-400">6,200+</span>
              <p className="text-xs text-slate-300 font-medium mt-1">Network Garages</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 col-span-2 md:col-span-1">
              <span className="text-2xl md:text-3xl font-extrabold text-blue-400">₹450 Cr+</span>
              <p className="text-xs text-slate-300 font-medium mt-1">Claims Paid YTD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="bg-white border-b border-slate-200 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 text-xs text-slate-600 font-bold">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>CRISIL AAA Rated Solvency</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>ISO 27001 Certified Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>IRDAI Bima Bharosa Integrated</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <span>PCI-DSS 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </section>

      {/* 3. About Us Block */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Corporate Overview & Profile
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">About InsureCore General & Health Insurance</h2>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              Founded in 2002 under the InsureCore Financial Services Group, InsureCore is one of India's premier IRDAI-registered non-life insurers. Operating across 500+ cities with over 5,000 dedicated employees, our mission is shielding Indian families with zero-paperwork digital health, motor, and life protection.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase">Incorporation</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">Est. 2002</p>
              <p className="text-[11px] text-slate-500">24+ Years Trust</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase">Pan-India Reach</span>
              <p className="text-lg font-extrabold text-slate-900 mt-1">500+ Cities</p>
              <p className="text-[11px] text-slate-500">5,000+ Team Members</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase">Parent Group</span>
              <p className="text-base font-extrabold text-blue-600 mt-1">InsureCore Group</p>
              <p className="text-[11px] text-slate-500">Financial Conglomerate</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-xs text-slate-500 font-bold uppercase">IRDAI License</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">Reg. No. 154</p>
              <p className="text-[11px] text-slate-500">General & Health Insurer</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Cards (3 Types with consistent format) */}
      <section className="max-w-7xl mx-auto px-6 py-16" id="plans">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Protection Portfolio
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">Icon-Based Insurance Products</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Clear coverage ceilings, transparent premiums, and downloadable policy brochures.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product 1: Health */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <HeartPulse className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase">HEALTH & FAMILY FLOATER</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-2">Comprehensive Health Shield</h3>
              <p className="text-slate-500 text-xs font-bold mb-4">Max Coverage: <strong className="text-blue-600 font-extrabold">Up to ₹1,00,00,000</strong></p>
              <ul className="space-y-2 text-xs text-slate-700 font-semibold mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Zero Co-Payment Requirement</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Single Private Room Rent Cap Waiver</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Section 80D Tax Exemption Receipt</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Starting Premium:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹1,250 / month</span>
              </div>
              <Link to="/register">
                <Button variant="primary" className="w-full font-bold">
                  Get Covered Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Brochure PDF downloading...'); }} className="block text-center text-xs text-blue-600 hover:underline font-bold flex items-center justify-center">
                <Download className="w-3.5 h-3.5 mr-1" /> Download Policy Brochure PDF
              </a>
            </div>
          </div>

          {/* Product 2: Motor */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Car className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase">AUTO & MOTOR VEHICLE</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-2">Full Auto Comprehensive</h3>
              <p className="text-slate-500 text-xs font-bold mb-4">Max Coverage: <strong className="text-blue-600 font-extrabold">Full Zero-Dep Depreciation</strong></p>
              <ul className="space-y-2 text-xs text-slate-700 font-semibold mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> 100% Parts Depreciation Waiver</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> 6,200+ Cashless Network Garages</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> 24x7 Roadside Spot Assistance</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Starting Premium:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹750 / month</span>
              </div>
              <Link to="/register">
                <Button variant="primary" className="w-full font-bold">
                  Get Covered Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Brochure PDF downloading...'); }} className="block text-center text-xs text-blue-600 hover:underline font-bold flex items-center justify-center">
                <Download className="w-3.5 h-3.5 mr-1" /> Download Policy Brochure PDF
              </a>
            </div>
          </div>

          {/* Product 3: Term Life */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-blue-600 uppercase">TERM LIFE PROTECTION</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1 mb-2">Term Life Security Reserve</h3>
              <p className="text-slate-500 text-xs font-bold mb-4">Max Coverage: <strong className="text-blue-600 font-extrabold">Up to ₹2,00,00,000</strong></p>
              <ul className="space-y-2 text-xs text-slate-700 font-semibold mb-6">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Guaranteed Death Benefit Reserve</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> 64 Critical Illnesses Rider</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" /> Section 80C Tax Exemption Benefit</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Starting Premium:</span>
                <span className="font-extrabold text-slate-900 text-sm">₹1,800 / month</span>
              </div>
              <Link to="/register">
                <Button variant="primary" className="w-full font-bold">
                  Get Covered Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Brochure PDF downloading...'); }} className="block text-center text-xs text-blue-600 hover:underline font-bold flex items-center justify-center">
                <Download className="w-3.5 h-3.5 mr-1" /> Download Policy Brochure PDF
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Plan Comparison Table (No empty cells, "Not Covered" explicitly written) */}
      <section className="bg-white border-y border-slate-200 py-20 px-6" id="tiers">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Tier Comparison Matrix
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Compare Health Protection Coverage Tiers</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Complete, transparent feature comparison matrix across Silver, Gold, and Platinum tiers.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 font-bold text-slate-900">Coverage Feature</th>
                  <th className="p-4 font-bold text-slate-900 text-center">Silver Tier (₹5 Lakh)</th>
                  <th className="p-4 font-bold text-blue-600 text-center bg-blue-50/50">Gold Tier (₹10 Lakh)</th>
                  <th className="p-4 font-bold text-slate-900 text-center">Platinum Tier (₹1 Crore)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-medium">
                <tr>
                  <td className="p-4 text-slate-800 font-bold">Room Rent Cap Waiver</td>
                  <td className="p-4 text-center text-slate-600">Capped at 1% of Sum Insured</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">Single Private Room (No Cap)</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">Suite / Any Room (No Cap)</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 font-bold">No-Claim Bonus (NCB Multiplier)</td>
                  <td className="p-4 text-center text-slate-600">10% per year (max 50%)</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">50% Super Bonus (max 100%)</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">100% Super Bonus (max 200%)</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 font-bold">Pre & Post Hospitalization</td>
                  <td className="p-4 text-center text-slate-600">30 Days Pre / 60 Days Post</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">60 Days Pre / 90 Days Post</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">90 Days Pre / 180 Days Post</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 font-bold">Maternity & Newborn Cover</td>
                  <td className="p-4 text-center text-rose-600 font-bold">Not Covered</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">Covered up to ₹50,000 (2 yr wait)</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">Covered up to ₹1,00,000 (1 yr wait)</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 font-bold">AYUSH Alternative Hospitalization</td>
                  <td className="p-4 text-center text-slate-600">Covered up to 25% Sum Insured</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">100% Cashless Covered</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">100% Cashless Covered</td>
                </tr>
                <tr>
                  <td className="p-4 text-slate-800 font-bold">Mandatory Co-Payment Requirement</td>
                  <td className="p-4 text-center text-slate-600">10% Mandatory Co-Pay</td>
                  <td className="p-4 text-center text-blue-700 font-bold bg-blue-50/20">Zero Co-Pay Requirement</td>
                  <td className="p-4 text-center text-emerald-700 font-bold">Zero Co-Pay Requirement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Instant Premium Calculator / Quote Widget */}
      <section className="max-w-7xl mx-auto px-6 py-16" id="calculator">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
              Interactive Quote Engine
            </span>
            <h3 className="text-3xl font-extrabold">Instant Premium Quote Estimator</h3>
            <p className="text-slate-300 text-xs md:text-sm font-medium">Calculate your health policy premium based on age, coverage limit, city tier, and family size.</p>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium">
              <div>
                <label className="block text-slate-300 mb-1">Policyholder Age ({calcAge} yrs)</label>
                <input
                  type="range"
                  min={18}
                  max={75}
                  value={calcAge}
                  onChange={(e) => setCalcAge(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Sum Insured Cap</label>
                <select
                  value={calcSumInsured}
                  onChange={(e) => setCalcSumInsured(parseInt(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value={500000}>₹5,00,000 (Silver)</option>
                  <option value={1000000}>₹10,00,000 (Gold)</option>
                  <option value={2500000}>₹25,00,000 (Platinum)</option>
                  <option value={10000000}>₹1,00,00,000 (1 Crore Super)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">City Location Tier</label>
                <select
                  value={calcCityTier}
                  onChange={(e) => setCalcCityTier(e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="Tier 1">Tier 1 (Mumbai, Delhi, Blr)</option>
                  <option value="Tier 2">Tier 2 (Pune, Hyd, Ahemdabad)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Family Members</label>
                <select
                  value={calcFamilySize}
                  onChange={(e) => setCalcFamilySize(e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="1 Adult">1 Adult (Self)</option>
                  <option value="2 Adults">2 Adults (Self + Spouse)</option>
                  <option value="2 Adults + 2 Children">2 Adults + 2 Children</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center space-y-4">
            <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Estimated Monthly Premium</span>
            <div className="text-4xl font-extrabold text-blue-400">{formatCurrency(quote.monthly)} <span className="text-xs text-slate-300">/ mo</span></div>
            <p className="text-xs text-slate-300">Annual Premium: <strong className="text-white">{formatCurrency(quote.annual)} / yr</strong> (incl. 18% GST)</p>
            <Link to="/register">
              <Button variant="primary" className="w-full font-bold shadow-md py-3 mt-2">
                Issue Policy At This Rate <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Cashless Network Search */}
      <section className="bg-blue-600 text-white py-16 px-6" id="hospitals">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-blue-700 px-3 py-1 rounded-full text-blue-100 border border-blue-500">
                Network Search Engine
              </span>
              <h3 className="text-3xl font-extrabold mt-3">Find 10,500+ Hospitals & 6,200+ Garages</h3>
              <p className="text-blue-100 text-xs mt-1 font-medium">Search cashless medical centers and authorized workshops by city or pincode.</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Type City, Hospital Name, or Pincode (e.g. Mumbai, 400080)..."
                value={hospitalSearch}
                onChange={(e) => setHospitalSearch(e.target.value)}
                className="w-full bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredHospitals.slice(0, 4).map((h) => (
              <div key={h.name} className="p-4 rounded-2xl bg-white text-slate-900 shadow-lg border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 uppercase">
                  <span>{h.type}</span>
                  <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">{h.pincode}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{h.name}</h4>
                <p className="text-xs text-slate-500 font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {h.city} Network Node
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Claims Journey (Both Cashless & Reimbursement fully 5-stepped!) */}
      <section className="max-w-7xl mx-auto px-6 py-20" id="claims">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Claims Lifecycle Desk
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Complete 5-Step Claim Journey</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Both Cashless and Reimbursement settlement workflows fully automated.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-slate-200 p-1 rounded-xl flex space-x-2 text-xs font-bold">
            <button
              onClick={() => setClaimFlowType('cashless')}
              className={`px-6 py-2.5 rounded-lg transition ${
                claimFlowType === 'cashless' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Cashless Hospital Claim Flow (5 Steps)
            </button>
            <button
              onClick={() => setClaimFlowType('reimbursement')}
              className={`px-6 py-2.5 rounded-lg transition ${
                claimFlowType === 'reimbursement' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Reimbursement Claim Flow (5 Steps)
            </button>
          </div>
        </div>

        {claimFlowType === 'cashless' ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">1</span>
              <h4 className="font-bold text-slate-900 text-sm">Present Digital Card</h4>
              <p className="text-xs text-slate-600 font-medium">Show digital health card at hospital TPA desk upon admission.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">2</span>
              <h4 className="font-bold text-slate-900 text-sm">TPA Pre-Auth Request</h4>
              <p className="text-xs text-slate-600 font-medium">Hospital transmits cashless pre-authorization form online.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">3</span>
              <h4 className="font-bold text-slate-900 text-sm">20-Min Auto Approval</h4>
              <p className="text-xs text-slate-600 font-medium">Automated underwriting approves claim ticket within 20 mins.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">4</span>
              <h4 className="font-bold text-slate-900 text-sm">Receive Treatment</h4>
              <p className="text-xs text-slate-600 font-medium">Undergo medical treatment with zero out-of-pocket payment.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">5</span>
              <h4 className="font-bold text-slate-900 text-sm">Direct Settlement</h4>
              <p className="text-xs text-slate-600 font-medium">InsureCore settles hospital bill directly with medical center.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">1</span>
              <h4 className="font-bold text-slate-900 text-sm">Intimate Claim Online</h4>
              <p className="text-xs text-slate-600 font-medium">Notify InsureCore within 24 hours of hospital discharge.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">2</span>
              <h4 className="font-bold text-slate-900 text-sm">Upload Bills & Evidence</h4>
              <p className="text-xs text-slate-600 font-medium">Upload PDF/Photos of discharge summary & hospital invoices.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">3</span>
              <h4 className="font-bold text-slate-900 text-sm">Medical Verification</h4>
              <p className="text-xs text-slate-600 font-medium">Underwriters verify hospital bills and diagnostic reports.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">4</span>
              <h4 className="font-bold text-slate-900 text-sm">Approval Confirmation</h4>
              <p className="text-xs text-slate-600 font-medium">Receive real-time SMS/Email notice of approved claim payout.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">5</span>
              <h4 className="font-bold text-slate-900 text-sm">24-Hr Bank Transfer</h4>
              <p className="text-xs text-slate-600 font-medium">Reimbursement credited directly into your bank account.</p>
            </div>
          </div>
        )}
      </section>

      {/* 9. Policy Portability Section */}
      <section className="bg-white border-y border-slate-200 py-20 px-6" id="portability">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              IRDAI Portability Mandate
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900">Switch Your Existing Policy To InsureCore Without Losing Benefits</h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              Under IRDAI Portability regulations, you can seamlessly transfer health policies from Star Health, Niva Bupa, Care, or HDFC Ergo to InsureCore at renewal time. Retain 100% of your accumulated waiting period credits and No-Claim Bonus!
            </p>

            <div className="pt-2">
              <Link to="/register">
                <Button variant="primary" className="font-bold">
                  Start Policy Portability Transfer <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl space-y-4">
            <h4 className="font-bold text-slate-900 text-base">Portability Required Documents Checklist:</h4>
            <div className="space-y-3 text-xs font-medium text-slate-600">
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Existing Policy Renewal Notice</span>
                <span className="font-bold text-blue-600">Required</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span>Previous 3 Years Claim History Statement</span>
                <span className="font-bold text-blue-600">Required</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span>KYC Aadhar & PAN Card Verification</span>
                <span className="font-bold text-blue-600">Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Awards & Industry Ratings Row */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Awards & Accolades
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Recognized For Claim Excellence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <Award className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Best Health Insurer 2025</h4>
            <p className="text-xs text-slate-500 font-medium">Economic Times Financial Excellence Awards</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <Star className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Top Motor Claim Settlement</h4>
            <p className="text-xs text-slate-500 font-medium">FinTech Leadership Summit India 2025</p>
          </div>
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <Building className="w-8 h-8 text-blue-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Great Place to Work Certified</h4>
            <p className="text-xs text-slate-500 font-medium">Recognized for Workplace Excellence (2025-26)</p>
          </div>
        </div>
      </section>

      {/* 11. Institutional Split Cards Section (Half Image + Half Content) */}
      <section className="max-w-7xl mx-auto px-6 py-10" id="governance">
        <div className="space-y-6">
          {/* Card 1: 20-Min Cashless Hospitalization & Medical Care */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 h-48 md:h-56 rounded-2xl overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
                alt="Cashless Medical Protection"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                10,500+ Hospital Network
              </div>
            </div>

            <div className="md:col-span-7 space-y-2.5">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Cashless Care Guarantee
              </span>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                20-Minute Cashless Hospital Pre-Authorization
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                InsureCore connects directly with TPA desks across 10,500+ cashless partner hospitals. Receive instant medical pre-authorization approvals within 20 minutes with zero out-of-pocket payments during medical emergencies.
              </p>

              <div className="pt-1 grid grid-cols-2 gap-2.5 text-[11px] font-bold text-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Zero Room Rent Co-Pay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Direct Hospital Settlement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Organ Donor Coverage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>AYUSH Inpatient Care</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Full Auto Motor Protection & 24x7 Roadside Assistance */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2.5 order-2 md:order-1">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Auto & Vehicle Protection
              </span>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                Full Auto Comprehensive & Roadside Assistance
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Protect your car and bike with zero-depreciation coverage, engine & gearbox riders, free key replacement, and instant cashless repairs across 6,200+ authorized workshops nationwide.
              </p>

              <div className="pt-1 grid grid-cols-2 gap-2.5 text-[11px] font-bold text-slate-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>100% Parts Zero-Depreciation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>6,200+ Cashless Garages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Instant Spot Video Inspection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>24x7 Roadside Towing Rider</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 h-48 md:h-56 rounded-2xl overflow-hidden relative order-1 md:order-2">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                alt="Full Auto Protection & Vehicle Insurance"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 right-3 bg-slate-900/90 text-blue-400 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-xs uppercase tracking-wider border border-slate-700">
                6,200+ Cashless Garages
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Mobile App CTAs */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-blue-600 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-blue-700 px-3 py-1 rounded-full text-blue-100 border border-blue-500">
              InsureCore Mobile App
            </span>
            <h3 className="text-3xl font-extrabold">Track Claims & Download 80D Receipts On The Go</h3>
            <p className="text-blue-100 text-xs md:text-sm font-medium">Download the InsureCore Mobile App for iOS & Android to manage policies 24x7.</p>
          </div>

          <div className="flex items-center space-x-4">
            <button type="button" onClick={() => alert('iOS App downloading...')} className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center hover:bg-slate-800 transition">
              <SmartphoneNfc className="w-5 h-5 mr-2 text-blue-400" /> App Store
            </button>
            <button type="button" onClick={() => alert('Android App downloading...')} className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center hover:bg-slate-800 transition">
              <Smartphone className="w-5 h-5 mr-2 text-emerald-400" /> Google Play
            </button>
          </div>
        </div>
      </section>

      {/* 13. FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16" id="faq">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">Got Questions? We've Got Answers</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {activeFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-extrabold text-lg mb-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <span>INSURECORE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              InsureCore General & Health Insurance Co. Ltd. Regulated by IRDAI Reg No. 154. CIN: L66010MH2002PLC136741. GSTIN: 27AABCI1234F1Z9.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Insurance Products</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/login" className="hover:text-white">Comprehensive Health Shield</Link></li>
              <li><Link to="/login" className="hover:text-white">Full Auto Motor Insurance</Link></li>
              <li><Link to="/login" className="hover:text-white">Term Life Security Reserve</Link></li>
              <li><Link to="/login" className="hover:text-white">Home & Property Guardian</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Quick Portal Access</h4>
            <ul className="space-y-2 font-medium">
              <li><Link to="/login" className="hover:text-white">Customer Portal</Link></li>
              <li><Link to="/login" className="hover:text-white">Agent Desk</Link></li>
              <li><Link to="/login" className="hover:text-white">Admin Overview</Link></li>
              <li><Link to="/login" className="hover:text-white">Claims Settlement Desk</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Customer Support & GRO</h4>
            <p className="text-white font-bold text-sm mb-1">Toll Free: 1800-200-INSURE</p>
            <p className="text-slate-400 text-xs font-medium">GRO Email: gro@insurecore.com</p>
            <p className="text-slate-400 text-xs mt-2 font-medium">IRDAI IGMS Bima Bharosa Reg. No 154</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-800 text-center text-slate-500 font-medium">
          © 2026 InsureCore General & Health Insurance Co. Ltd. All Rights Reserved. IRDAI License No. 154.
        </div>
      </footer>
    </div>
  );
};
