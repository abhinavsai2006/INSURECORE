import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, FileText, Download, Trash2, Eye, Search, ShieldCheck, CheckCircle2, Lock, Filter, Check, X, RefreshCw, AlertCircle, ArrowRight, UserCheck, Shield, ChevronRight, FileCheck, FileSpreadsheet, Layers, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { api, downloadFile } from '../lib/api';
import { formatDate } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kyc' | 'vault'>('kyc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Guided Upload 5-Step Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(1);
  const [custSearch, setCustSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<string>('GENERAL_KYC');
  const [docCategory, setDocCategory] = useState<string>('Aadhaar Card');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [generatedDocId, setGeneratedDocId] = useState('');

  // Preview & Remark Modal (Admin Review Screen)
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [verificationRemark, setVerificationRemark] = useState('');

  // Sample static customer database for step 1
  const mockCustomers = [
    { id: 'c101', name: 'Rajesh Kumar Sharma', email: 'rajesh@example.com', phone: '+91 98765 43210', city: 'Mumbai', policy: 'POL-2026-000012' },
    { id: 'c102', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98123 45678', city: 'Delhi', policy: 'POL-2026-000045' },
    { id: 'c103', name: 'Amitabh Sen', email: 'amitabh@example.com', phone: '+91 99887 76655', city: 'Bengaluru', policy: 'POL-2026-000089' },
    { id: 'c104', name: 'Neha Patel', email: 'neha@example.com', phone: '+91 97766 55443', city: 'Ahmedabad', policy: 'POL-2026-000102' },
  ];

  // Sample static KYC records merged with backend data
  const sampleKycRecords = [
    { id: 'DOC-2026-000125', customerName: 'Rajesh Kumar Sharma', customerEmail: 'rajesh@example.com', docType: 'Aadhaar Card (DigiLocker)', status: 'VERIFIED', uploadedAt: '2026-07-20T10:30:00Z', fileSizeKb: 450, fileName: 'Aadhaar_Rajesh.pdf', remark: 'Verified via UIDAI DigiLocker OTP' },
    { id: 'DOC-2026-000126', customerName: 'Rajesh Kumar Sharma', customerEmail: 'rajesh@example.com', docType: 'PAN Card Verification', status: 'PENDING', uploadedAt: '2026-07-21T14:15:00Z', fileSizeKb: 320, fileName: 'PAN_Rajesh_Kumar.jpg', remark: 'Awaiting Tax NSDL verification match' },
    { id: 'DOC-2026-000127', customerName: 'Priya Sharma', customerEmail: 'priya@example.com', docType: 'Driving Licence Proof', status: 'VERIFIED', uploadedAt: '2026-07-19T09:00:00Z', fileSizeKb: 512, fileName: 'DL_Priya_Verma.pdf', remark: 'RTO Verification Succeeded' },
    { id: 'DOC-2026-000128', customerName: 'Amitabh Sen', customerEmail: 'amitabh@example.com', docType: 'Passport Address Proof', status: 'REJECTED', uploadedAt: '2026-07-18T16:45:00Z', fileSizeKb: 680, fileName: 'Passport_Scan.png', remark: 'Image blurry, please re-upload clear front page' },
    { id: 'DOC-2026-000129', customerName: 'Neha Patel', customerEmail: 'neha@example.com', docType: 'Aadhaar Card', status: 'REUPLOAD_REQUIRED', uploadedAt: '2026-07-22T08:20:00Z', fileSizeKb: 290, fileName: 'Aadhaar_Back.jpg', remark: 'Back side missing' },
  ];

  const [kycList, setKycList] = useState<any[]>(sampleKycRecords);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/documents');
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadProgress(0);
    setIsUploading(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      setUploadProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 150);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please attach a valid file');

    const newDocId = `DOC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedDocId(newDocId);

    const newRecord = {
      id: newDocId,
      customerName: selectedCustomer?.name || user?.name || 'Customer Account',
      customerEmail: selectedCustomer?.email || user?.email || 'customer@example.com',
      docType: docCategory,
      status: 'PENDING',
      uploadedAt: new Date().toISOString(),
      fileSizeKb: Math.round(file.size / 1024),
      fileName: file.name,
      remark: 'Uploaded via Guided Workflow',
    };

    setKycList((prev) => [newRecord, ...prev]);
    setUploadStep(6); // Success Step
  };

  const resetUploadWizard = () => {
    setUploadStep(1);
    setSelectedCustomer(null);
    setSelectedPolicy('GENERAL_KYC');
    setDocCategory('Aadhaar Card');
    setFile(null);
    setUploadProgress(0);
    setIsUploadOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: string, defaultRemark: string = '') => {
    setKycList(prev => prev.map(k => k.id === id ? { ...k, status: newStatus, remark: verificationRemark || defaultRemark } : k));
    setSelectedDoc(null);
    setVerificationRemark('');
  };

  const safeKyc = Array.isArray(kycList) ? kycList : [];
  const filteredKyc = safeKyc.filter(k => {
    const matchesSearch = (k.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (k.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (k.docType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (k.id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || k.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ROLE 1: CUSTOMER VIEW — MY KYC & DOCUMENTS
  if (user?.role === 'CUSTOMER') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My KYC & Documents</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your identity documents, upload Aadhaar/PAN scans, and download policy certificates.</p>
        </div>

        {/* Customer Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">KYC Completion</span>
            <p className="text-2xl font-extrabold text-emerald-600">80%</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Documents Uploaded</span>
            <p className="text-2xl font-extrabold text-blue-600">5</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Pending Verification</span>
            <p className="text-2xl font-extrabold text-amber-600">1</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Policy Certificates</span>
            <p className="text-2xl font-extrabold text-slate-900">3</p>
          </Card>
        </div>

        {/* Personal KYC Grid */}
        <Card className="p-6 space-y-4 bg-white border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Personal Identity KYC</h3>
            <Button onClick={() => { setUploadStep(3); setIsUploadOpen(true); }} variant="primary" className="text-xs font-bold shadow-xs">
              <Upload className="w-3.5 h-3.5 mr-1" /> Upload New Proof
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-3">Document Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Uploaded On</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Aadhaar Card (DigiLocker)</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">VERIFIED</span></td>
                  <td className="p-3 text-slate-500">20 Jul 2026</td>
                  <td className="p-3 text-right"><Button variant="outline" size="sm" onClick={() => alert('Viewing document proof...')} className="font-bold">View</Button></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">PAN Card Verification</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase">PENDING</span></td>
                  <td className="p-3 text-slate-500">21 Jul 2026</td>
                  <td className="p-3 text-right"><Button variant="outline" size="sm" onClick={() => alert('Viewing document proof...')} className="font-bold">View</Button></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">Passport / DL Address Proof</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 uppercase">NOT UPLOADED</span></td>
                  <td className="p-3 text-slate-400">—</td>
                  <td className="p-3 text-right"><Button variant="primary" size="sm" onClick={() => { setUploadStep(3); setIsUploadOpen(true); }} className="font-bold">Upload</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Policy Documents Suite */}
        <Card className="p-6 space-y-4 bg-white border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-3">My Policy Documents Suite</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button onClick={() => alert('Downloading Policy Schedule PDF...')} variant="outline" className="text-xs font-bold justify-start py-2.5 bg-white">
              📄 Policy Schedule
            </Button>
            <Button onClick={() => alert('Downloading Health Smart Card...')} variant="outline" className="text-xs font-bold justify-start py-2.5 bg-white">
              🆔 Health Smart Card
            </Button>
            <Button onClick={() => alert('Downloading Premium Receipt...')} variant="outline" className="text-xs font-bold justify-start py-2.5 bg-white">
              🧾 Premium Receipt
            </Button>
            <Button onClick={() => alert('Downloading Section 80D Tax Certificate...')} variant="outline" className="text-xs font-bold justify-start py-2.5 bg-white">
              📜 Section 80D Tax Cert
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ROLE 2: AGENT VIEW — ASSIGNED CUSTOMER DOCUMENTS
  if (user?.role === 'AGENT') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Customer Documents</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Upload, track, and manage documents for your assigned customer portfolio.</p>
          </div>
          <Button onClick={() => { setUploadStep(1); setIsUploadOpen(true); }} variant="primary" className="font-bold shadow-md">
            <Upload className="w-4 h-4 mr-2" /> Upload Customer File
          </Button>
        </div>

        {/* Agent Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Assigned Customers</span>
            <p className="text-2xl font-extrabold text-blue-600">128</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Pending Uploads</span>
            <p className="text-2xl font-extrabold text-amber-600">7</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">KYC Pending</span>
            <p className="text-2xl font-extrabold text-blue-600">14</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Re-upload Required</span>
            <p className="text-2xl font-extrabold text-rose-600">3</p>
          </Card>
        </div>

        {/* Assigned Customers Documents Table */}
        <Card className="p-0 overflow-hidden bg-white border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Document Category</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4">Uploaded On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredKyc.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{k.customerName}</p>
                      <p className="text-xs text-slate-500">{k.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-xs">{k.docType}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{k.fileName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        k.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        k.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{formatDate(k.uploadedAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setSelectedDoc(k)} className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">
                        View
                      </button>
                      <button onClick={() => { setSelectedCustomer({ name: k.customerName, email: k.customerEmail }); setUploadStep(3); setIsUploadOpen(true); }} className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs">
                        Upload New
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // ROLE 3: ADMIN / UNDERWRITER / SUPER ADMIN VIEW — KYC VERIFICATION CENTER
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase">
            Admin Compliance Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">KYC Verification Center</h1>
          <p className="text-slate-500 text-sm font-medium">Review customer identity documents, verify IRDAI compliance, and manage verification workflows.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => { setUploadStep(1); setIsUploadOpen(true); }} variant="primary" className="font-bold shadow-md">
            <Upload className="w-4 h-4 mr-2" /> Upload Document
          </Button>
        </div>
      </div>

      {/* 5 Admin Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3 bg-white border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Pending Verification</span>
          <p className="text-xl font-extrabold text-amber-600">14</p>
        </Card>
        <Card className="p-3 bg-white border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Verified Today</span>
          <p className="text-xl font-extrabold text-emerald-600">28</p>
        </Card>
        <Card className="p-3 bg-white border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Rejected</span>
          <p className="text-xl font-extrabold text-rose-600">3</p>
        </Card>
        <Card className="p-3 bg-white border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Re-upload Requests</span>
          <p className="text-xl font-extrabold text-blue-600">5</p>
        </Card>
        <Card className="p-3 bg-white border-slate-200 space-y-1">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Total Vault Files</span>
          <p className="text-xl font-extrabold text-slate-900">184</p>
        </Card>
      </div>

      {/* View Mode Toggle Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('kyc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'kyc' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KYC Verification Queue ({kycList.length})</span>
          </button>

          <button
            onClick={() => setViewMode('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              viewMode === 'vault' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Vault File Storage ({documents.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {viewMode === 'kyc' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
            >
              <option value="">All Verification Statuses</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
              <option value="REUPLOAD_REQUIRED">REUPLOAD REQUIRED</option>
            </select>
          )}

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, customer, or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* KYC VERIFICATION QUEUE TABLE */}
      {viewMode === 'kyc' && (
        <Card className="p-0 overflow-hidden bg-white border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-6 py-4">Doc ID & Customer</th>
                  <th className="px-6 py-4">Document Category</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4">Uploaded Date</th>
                  <th className="px-6 py-4 text-right">Admin Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredKyc.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-bold text-blue-600">{k.id}</p>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">{k.customerName}</p>
                      <p className="text-[11px] text-slate-500">{k.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-xs">{k.docType}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{k.fileName} ({k.fileSizeKb} KB)</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        k.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        k.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        k.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{formatDate(k.uploadedAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setSelectedDoc(k)} className="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold shadow-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> Review & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ADMIN SPLIT SCREEN REVIEW MODAL */}
      <Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={`Admin KYC Adjudication — ${selectedDoc?.id}`}>
        {selectedDoc && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-800">
            {/* Left Side: Document Preview Canvas */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Document Canvas Preview</span>
                <p className="font-bold text-sm text-blue-400 mt-1">{selectedDoc.fileName}</p>
                <div className="my-6 p-8 bg-slate-800 rounded-xl border border-slate-700 text-center text-slate-400">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="font-bold text-xs text-white">Govt Identity Proof Document Preview</p>
                  <p className="text-[10px] mt-1 font-mono">Size: {selectedDoc.fileSizeKb} KB • Format: PDF/JPG</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => alert('Zooming in...')} className="w-1/2 font-bold text-white border-slate-700 bg-slate-800">Zoom In</Button>
                <Button variant="outline" size="sm" onClick={() => alert('Downloading proof file...')} className="w-1/2 font-bold text-white border-slate-700 bg-slate-800">Download</Button>
              </div>
            </div>

            {/* Right Side: Information & Validation Checks */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <p>Policyholder: <strong className="text-slate-900">{selectedDoc.customerName}</strong></p>
                <p>Document Subtype: <strong className="text-blue-600 uppercase font-bold">{selectedDoc.docType}</strong></p>
                <p>Verification Status: <strong className="text-amber-700 uppercase">{selectedDoc.status}</strong></p>
                <p>Uploaded On: <strong>{formatDate(selectedDoc.uploadedAt)}</strong></p>
              </div>

              {/* Automated OCR Validation Grid */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-[11px] text-blue-950 font-bold">
                <p className="uppercase text-[10px] text-blue-700">Automated e-KYC Verification Checks</p>
                <p>✓ Aadhaar / PAN Format Validated</p>
                <p>✓ Tax NSDL Database Match 100%</p>
                <p>✓ Zero Duplicate Customer Record</p>
                <p>✓ Face Match & Biometric Authenticated</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adjudication Remarks</label>
                <input
                  type="text"
                  placeholder="Enter remarks for audit trail..."
                  value={verificationRemark}
                  onChange={(e) => setVerificationRemark(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <Button onClick={() => handleUpdateStatus(selectedDoc.id, 'VERIFIED', 'Verified by Admin')} variant="primary" className="text-xs font-bold py-2">
                  <Check className="w-3.5 h-3.5 mr-1" /> Approve
                </Button>
                <Button onClick={() => handleUpdateStatus(selectedDoc.id, 'REUPLOAD_REQUIRED', 'Customer requested clear scan')} variant="outline" className="text-xs font-bold py-2">
                  Re-upload
                </Button>
                <Button onClick={() => handleUpdateStatus(selectedDoc.id, 'REJECTED', 'Proof rejected')} variant="secondary" className="text-xs font-bold py-2 bg-rose-50 text-rose-700">
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
