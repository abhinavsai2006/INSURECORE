import React, { useState, useEffect } from 'react';
import { Search, Shield, Users, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ policies: any[]; customers: any[]; claims: any[] }>({
    policies: [],
    customers: [],
    claims: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ policies: [], customers: [], claims: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [polRes, custRes, claimRes] = await Promise.all([
          api.get(`/policies?search=${query}&limit=4`),
          api.get(`/customers?search=${query}&limit=4`),
          api.get(`/claims?search=${query}&limit=4`),
        ]);
        setResults({
          policies: polRes.data.data || [],
          customers: custRes.data.data || [],
          claims: claimRes.data.data || [],
        });
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-blue-600 mr-3" />
          <input
            type="text"
            placeholder="Search policies, customers, claims... (e.g. POL-2026, Vance)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent py-4 text-slate-900 placeholder-slate-400 focus:outline-none text-base font-medium"
            autoFocus
          />
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {query && (
            <>
              {results.policies.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5" /> Policies
                  </div>
                  <div className="space-y-1">
                    {results.policies.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          navigate(`/policies/${p.id}`);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition border border-slate-100 hover:border-blue-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{p.policyNumber}</p>
                          <p className="text-xs text-slate-500">{p.planName} • {p.customer?.name}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.customers.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Customers
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          navigate(`/customers/${c.id}`);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition border border-slate-100 hover:border-blue-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.email} • {c.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.claims.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1.5" /> Claims
                  </div>
                  <div className="space-y-1">
                    {results.claims.map((cl) => (
                      <div
                        key={cl.id}
                        onClick={() => {
                          navigate(`/claims/${cl.id}`);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition border border-slate-100 hover:border-blue-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{cl.claimNumber}</p>
                          <p className="text-xs text-slate-500">{cl.reason}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
                          {cl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.policies.length === 0 && results.customers.length === 0 && results.claims.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No results found for "{query}"</div>
              )}
            </>
          )}

          {!query && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Type anything to search policies, customer profiles, and claim tickets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
