import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Plus,
  MoreVertical,
  Trash2,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  LayoutGrid,
  List as ListIcon,
  Filter,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Skeleton } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  color: string;
}

const COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
];

export default function Documents() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/ai/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDocuments(data.map((doc: any) => ({
        id: doc.id.toString(),
        name: doc.name,
        size: doc.size,
        type: doc.type,
        date: new Date(doc.created_at).toLocaleDateString(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      })));
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('collection_id', 'general');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/ai/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fcfdff] p-8 pb-24">
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="z-10 w-full max-w-2xl"
            >
              <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white">
                <div className={cn("h-48 flex items-center justify-center relative", selectedDoc.color)}>
                  <div className="absolute top-6 left-6 text-white">
                    <h2 className="text-2xl font-display font-bold mb-1">{selectedDoc.name}</h2>
                    <p className="text-white/70 text-sm">{selectedDoc.size} • {selectedDoc.type}</p>
                  </div>
                  <FileText size={80} className="text-white/20 absolute -right-4 -bottom-4" />
                </div>
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Sparkles size={20} className="text-primary" /> AI Document Overview
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        This document contains comprehensive data regarding <strong>{selectedDoc.name.split('.')[0]}</strong>.
                        Our AI has identified 3 key sections including methodology, experimental results, and conclusion.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="primary">#Academic</Badge>
                        <Badge variant="secondary">#Research</Badge>
                        <Badge variant="accent">#Analysis</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => window.location.href = '/chat'} className="rounded-xl h-12 gap-2">
                      <MessageSquare size={18} /> Chat with Doc
                    </Button>
                    <Button onClick={() => window.open('#', '_blank')} variant="outline" className="rounded-xl h-12 gap-2">
                      <ExternalLink size={18} /> View Full File
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors w-fit">
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-2">My Documents</h1>
            <p className="text-slate-500">Manage and analyze your academic resources.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
              />
            </div>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              <div className={cn(
                "h-12 px-6 rounded-xl flex items-center gap-2 bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90",
                uploading && "opacity-50 cursor-not-allowed"
              )}>
                {uploading ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Plus size={18} />}
                {uploading ? "Uploading..." : "Upload"}
              </div>
            </label>
          </div>
        </header>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <button className="text-sm font-bold text-primary border-b-2 border-primary pb-6">All Files</button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-6 transition-colors">Shared with me</button>
            <button className="text-sm font-bold text-slate-400 hover:text-slate-600 pb-6 transition-colors">Favorites</button>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setView('grid')}
              className={cn("p-2 rounded-lg transition-colors", view === 'grid' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn("p-2 rounded-lg transition-colors", view === 'list' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
            >
              <ListIcon size={20} />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className={cn("grid gap-6", view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} className="p-4 flex flex-col gap-4">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </Card>
            ))}
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className={cn("grid gap-6", view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
            {filteredDocs.map((doc) => (
              <DocItem key={doc.id} doc={doc} view={view} onOverview={() => setSelectedDoc(doc)} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-500">Try adjusting your search or upload a new file.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DocItem({ doc, view, onOverview }: { doc: Document; view: 'grid' | 'list', onOverview: () => void }) {
  if (view === 'list') {
    return (
      <Card className="p-4 flex items-center gap-4 hover:border-primary/20 hover:shadow-lg transition-all group">
        <div className={cn("h-12 w-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-white shrink-0", doc.color)}>
          {doc.type}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h5>
          <p className="text-[11px] text-slate-500">{doc.size} • {doc.date}</p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={onOverview} className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary"><Sparkles size={18} /></Button>
        </div>
        <button className="text-slate-300 hover:text-slate-600">
          <MoreVertical size={18} />
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all group">
      <div className={cn("h-32 flex items-center justify-center relative", doc.color)}>
        <FileText size={48} className="text-white/40" />
        <Badge className="absolute top-3 right-3 bg-white/20 text-white border-none backdrop-blur-md">{doc.type}</Badge>
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <Button size="icon" onClick={onOverview} className="rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white h-10 w-10">
            <Sparkles size={18} />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h5 className="text-sm font-bold text-slate-900 truncate mb-1">{doc.name}</h5>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">{doc.size}</p>
          <p className="text-[11px] text-slate-500">{doc.date}</p>
        </div>
      </div>
    </Card>
  );
}