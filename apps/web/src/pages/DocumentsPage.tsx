import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, FileText, Download, Trash2, Eye } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../lib/api';
import { formatDate } from '../lib/utils';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState('KYC');

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/documents?category=${category}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [category]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file to upload');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docCategory', docCategory);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsUploadOpen(false);
      setFile(null);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Upload failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete document permanently?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Document Vault & Library</h1>
          <p className="text-slate-500 text-sm mt-1">Store KYC proofs, policy contracts, and claim evidence files.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 pb-3">
        {['', 'KYC', 'POLICY', 'CLAIM_EVIDENCE', 'OTHER'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              category === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat === '' ? 'All Vault Files' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200 animate-pulse" />)
        ) : documents.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-500 font-medium">No documents found in vault.</div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{doc.fileName}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                      {doc.docCategory}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex justify-between font-medium">
                <span>Size: {doc.fileSizeKb} KB</span>
                <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
              </div>

              <a
                href={`/api/v1/documents/${doc.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-xs font-bold text-blue-700 flex items-center justify-center space-x-2 transition border border-slate-200 hover:border-blue-200"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Document</span>
              </a>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document File">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Category</label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm"
            >
              <option value="KYC">KYC Identity Verification</option>
              <option value="POLICY">Policy Schedule</option>
              <option value="CLAIM_EVIDENCE">Claim Medical / Repair Invoice Evidence</option>
              <option value="OTHER">Other Attachment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">File Attachment (PDF, JPG, PNG)</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-xs"
            />
          </div>

          <Button type="submit" className="w-full font-bold">Upload to Vault</Button>
        </form>
      </Modal>
    </div>
  );
};
