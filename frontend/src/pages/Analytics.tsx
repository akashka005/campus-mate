import { API_BASE_URL } from '../api/config';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   BarChart3,
   TrendingUp,
   Calendar,
   Clock,
   Target,
   ChevronLeft,
   ArrowUpRight,
   ArrowDownRight,
   BrainCircuit,
   FileText,
   Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Skeleton } from '../components/ui/Primitives';
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar,
   Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';

export default function Analytics() {
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState<any>(null);

   const fetchStats = async () => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch('${API_BASE_URL}/api/v1/ai/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await res.json();
         setStats(data);
      } catch (error) {
         console.error("Failed to fetch analytics:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchStats();
   }, []);

   return (
      <div className="min-h-screen bg-[#fcfdff] p-8 pb-24">
         <div className="max-w-7xl mx-auto">
            <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors w-fit">
               <ChevronLeft size={20} />
               <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>

            <header className="mb-12">
               <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-2">Performance Analytics</h1>
               <p className="text-slate-500">Visualize your academic growth and AI interaction patterns.</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
               <MetricCard title="Total Study Time" value={stats?.study_time || "0h"} trend="+0%" up icon={<Clock />} loading={loading} />
               <MetricCard title="Quizzes Passed" value={stats?.quizzes_passed?.toString() || "0"} trend="+0%" up icon={<Target />} loading={loading} />
               <MetricCard title="AI Interactions" value={stats?.ai_interactions?.toString() || "0"} trend="+0%" up={true} icon={<Zap />} loading={loading} />
               <MetricCard title="Docs Analyzed" value={stats?.docs_analyzed?.toString() || "0"} trend="+0%" up icon={<FileText />} loading={loading} />
            </div>

            <div className="grid gap-8 lg:grid-cols-3 mb-8">
               <Card className="lg:col-span-2 p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-bold text-slate-900">Study Momentum</h3>
                        <p className="text-sm text-slate-500">Hours spent studying per day</p>
                     </div>
                     <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-xl px-4 py-2 outline-none cursor-pointer">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                     </select>
                  </div>
                  <div className="h-[350px] w-full relative">
                     {loading ? <Skeleton className="h-full w-full" /> : stats?.activity ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={stats.activity}>
                              <defs>
                                 <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <Tooltip
                                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              />
                              <Area type="monotone" dataKey="study" stroke="#1e3a8a" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                           No activity data available.
                        </div>
                     )}
                  </div>
               </Card>

               <Card className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Quiz Accuracy</h3>
                  <p className="text-sm text-slate-500 mb-8">Performance by subject category</p>

                  <div className="space-y-6">
                     {loading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />) :
                        stats?.subject_accuracy?.map((subj: any) => (
                           <SubjectProgress key={subj.name} name={subj.name} percent={subj.accuracy} color={
                              subj.name === 'Computer Science' ? 'bg-blue-500' :
                                 subj.name === 'Mathematics' ? 'bg-indigo-500' :
                                    subj.name === 'Physics' ? 'bg-violet-500' : 'bg-orange-500'
                           } />
                        ))
                     }
                  </div>

                  <div className="mt-12 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                     <div className="flex items-center gap-3 mb-2">
                        <BrainCircuit className="text-primary" size={20} />
                        <span className="font-bold text-slate-900 text-sm">AI Insight</span>
                     </div>
                     <p className="text-xs text-slate-600 leading-relaxed">
                        Based on your **{stats?.study_time || "recent"}** study session, your CS retention is peaking. Use the Quiz Master to validate your knowledge.
                     </p>
                  </div>
               </Card>
            </div>
         </div>
      </div>
   );
}

function MetricCard({ title, value, trend, up, icon, loading }: any) {
   return (
      <Card className="p-6">
         <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
               {icon}
            </div>
            {loading ? <Skeleton className="h-5 w-12" /> : (
               <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
               )}>
                  {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {trend}
               </div>
            )}
         </div>
         <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
         {loading ? <Skeleton className="h-8 w-24" /> : (
            <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
         )}
      </Card>
   );
}

function SubjectProgress({ name, percent, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">{name}</span>
            <span className="text-slate-900">{percent}%</span>
         </div>
         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
               initial={{ width: 0 }}
               whileInView={{ width: `${percent}%` }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={cn("h-full", color)}
            />
         </div>
      </div>
   );
}