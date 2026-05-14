import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   LayoutDashboard,
   MessageSquare,
   FileText,
   BrainCircuit,
   Search,
   Settings,
   LogOut,
   Bell,
   Search as SearchIcon,
   Plus,
   TrendingUp,
   Clock,
   CheckCircle2,
   MoreVertical,
   User,
   Share2,
   Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Badge, Skeleton } from '../components/ui/Primitives';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   AreaChart,
   Area
} from 'recharts';

import OnboardingTour from '../components/onboarding/OnboardingTour';
import { API_BASE_URL } from '../api/config';

export default function Dashboard() {
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState<any>(null);
   const [recentDocs, setRecentDocs] = useState<any[]>([]);
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
         localStorage.setItem('token', tokenFromUrl);
         window.history.replaceState({}, document.title, window.location.pathname);
      }
   }, []);

   const fetchDashboardData = async () => {
      try {
         const token = localStorage.getItem('token');
         const headers = { 'Authorization': `Bearer ${token}` };

         const statsRes = await fetch(`${API_BASE_URL}/api/v1/ai/stats`, { headers });
         const statsData = await statsRes.json();
         setStats(statsData);

         const docsRes = await fetch(`${API_BASE_URL}/api/v1/ai/documents`, { headers });
         const docsData = await docsRes.json();
         setRecentDocs(docsData.slice(0, 4));
      } catch (error) {
         console.error("Dashboard fetch failed:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchDashboardData();
   }, []);

   const COLORS = ['bg-blue-500', 'bg-primary', 'bg-indigo-500', 'bg-violet-500'];

   const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      try {
         const formData = new FormData();
         formData.append('file', file);
         formData.append('collection_id', 'general');

         const response = await fetch('http://localhost:8000/api/v1/ai/documents/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
         });

         if (response.ok) {
            fetchDashboardData();
         }
      } catch (error) {
         console.error("Quick upload failed:", error);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex min-h-screen bg-[#fcfdff]">
         <Sidebar />
         <OnboardingTour />

         <main className="flex-1 px-8 py-8">
            <header className="mb-10 flex items-center justify-between">
               <div>
                  <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, Akash 👋</h1>
                  <p className="text-slate-500">Your academic companion is ready.</p>
               </div>
               <div className="flex items-center gap-4">
                  <Button
                     className="gap-2 rounded-2xl hidden md:flex bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 h-12 px-6"
                     onClick={() => window.location.href = '/chat'}
                  >
                     <Sparkles size={18} className="animate-pulse" />
                     <span className="font-bold">Start Study Session</span>
                  </Button>
                  <button className="relative h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all hover:border-primary/30">
                     <BrainCircuit size={22} className="text-primary" />
                     <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white animate-bounce" />
                  </button>
                  <Link to="/profile" className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center hover:border-primary/30 transition-all">
                     <User size={24} className="text-slate-400" />
                  </Link>
               </div>
            </header>

            <div className="space-y-8">
               <div className="grid gap-6 md:grid-cols-3">
                  <StatCard title="Study Time" value={stats?.study_time || "0h"} icon={<Clock className="text-blue-500" />} bg="bg-blue-50" loading={loading} />
                  <StatCard title="Quizzes Passed" value={stats?.quizzes_passed?.toString() || "0"} icon={<CheckCircle2 className="text-green-500" />} bg="bg-green-50" loading={loading} />
                  <StatCard title="Docs Analyzed" value={stats?.docs_analyzed?.toString() || "0"} icon={<FileText className="text-purple-500" />} bg="bg-purple-50" loading={loading} />
               </div>

               <div className="grid gap-8 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                        <Link to="/docs"><Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View All</Button></Link>
                     </div>
                     <Card className="p-0 border-slate-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-100">
                           {loading ? (
                              [1, 2, 3].map(i => <div key={i} className="p-4"><Skeleton className="h-12 w-full" /></div>)
                           ) : recentDocs.length > 0 ? (
                              recentDocs.map((doc, i) => (
                                 <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                       <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", COLORS[i % COLORS.length])}>
                                          <FileText size={18} className="text-white" />
                                       </div>
                                       <div>
                                          <p className="font-semibold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-[300px]">{doc.name}</p>
                                          <p className="text-xs text-slate-500">{doc.size} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                    <Link to="/chat">
                                       <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10">
                                          <Sparkles size={18} />
                                       </Button>
                                    </Link>
                                 </div>
                              ))
                           ) : (
                              <div className="p-8 text-center text-slate-500 text-sm">No documents uploaded yet.</div>
                           )}
                        </div>
                     </Card>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-lg font-bold text-slate-900">AI Tools</h3>
                     <div className="space-y-4">
                        <label className="cursor-pointer block">
                           <input type="file" className="hidden" onChange={handleQuickUpload} />
                           <Card className="p-4 border-slate-200 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Plus size={24} />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 text-sm">Quick Upload</p>
                                 <p className="text-xs text-slate-500">Add doc to library</p>
                              </div>
                           </Card>
                        </label>

                        <Link to="/quiz" className="block">
                           <Card className="p-4 border-slate-200 shadow-sm hover:border-orange-500/40 hover:shadow-md transition-all group flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <BrainCircuit size={24} />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 text-sm">Magic Quiz</p>
                                 <p className="text-xs text-slate-500">Test your knowledge</p>
                              </div>
                           </Card>
                        </Link>

                        <Link to="/resume" className="block">
                           <Card className="p-4 border-slate-200 shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all group flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Search size={24} />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 text-sm">Career Check</p>
                                 <p className="text-xs text-slate-500">Analyze resume</p>
                              </div>
                           </Card>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}

function Sidebar() {
   const location = useLocation();
   return (
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col hidden lg:flex">
         <div className="p-8">
            <Link to="/" className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <FileText size={18} />
               </div>
               <span className="font-display text-xl font-bold tracking-tight text-slate-900">CampusMate</span>
            </Link>
         </div>

         <nav className="flex-1 px-4 space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
            <SidebarItem id="sidebar-chat" icon={<MessageSquare size={20} />} label="AI Chat" to="/chat" active={location.pathname === '/chat'} />
            <SidebarItem icon={<FileText size={20} />} label="Documents" to="/docs" />
            <SidebarItem id="sidebar-quiz" icon={<BrainCircuit size={20} />} label="Quizzes" to="/quiz" active={location.pathname === '/quiz'} />
            <SidebarItem id="sidebar-resume" icon={<Search size={20} />} label="Resume Analyzer" to="/resume" active={location.pathname === '/resume'} />
            <SidebarItem icon={<User size={20} />} label="Profile" to="/profile" active={location.pathname === '/profile'} />
         </nav>

         <div className="p-4 border-t border-slate-100 space-y-2">
            <SidebarItem icon={<Settings size={20} />} label="Settings" to="/settings" />
            <SidebarItem icon={<LogOut size={20} />} label="Logout" to="/logout" className="text-red-500 hover:bg-red-50 hover:text-red-600" />
         </div>
      </aside>
   );
}

function SidebarItem({ icon, label, to, active, className, id }: { icon: React.ReactNode; label: string; to: string; active?: boolean; className?: string; id?: string }) {
   return (
      <Link
         id={id}
         to={to}
         className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
            active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:bg-slate-50",
            className
         )}
      >
         {icon}
         {label}
      </Link>
   );
}

function StatCard({ title, value, icon, bg, loading }: { title: string; value: string; icon: React.ReactNode; bg: string; loading?: boolean }) {
   return (
      <Card className="flex items-center gap-4 p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
         <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", bg)}>
            {icon}
         </div>
         <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            {loading ? (
               <Skeleton className="h-8 w-20" />
            ) : (
               <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
            )}
         </div>
      </Card>
   );
}