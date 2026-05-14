import { API_BASE_URL } from '../api/config';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Skeleton } from '../components/ui/Primitives';

export default function StudyPlanner() {
   const [plan, setPlan] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const [goal, setGoal] = useState("Prepare for Machine Learning Exam");

   const generatePlan = async () => {
      setLoading(true);
      try {
         const formData = new FormData();
         formData.append('goal', goal);
         formData.append('timeframe', '1 week');

         const response = await fetch('${API_BASE_URL}/api/v1/ai/study/plan', {
            method: 'POST',
            body: formData
         });

         const data = await response.json();
         setPlan(data.plan || []);
      } catch (error) {
         console.error("Failed to generate plan:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      generatePlan();
   }, []);

   return (
      <div className="min-h-screen bg-[#fcfdff] p-8">
         <div className="max-w-6xl mx-auto">
            <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors">
               <ChevronLeft size={20} />
               <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>

            <div className="flex items-center justify-between mb-12">
               <div>
                  <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-2">AI Study Planner</h1>
                  <p className="text-slate-500">Your schedule adapts as you learn.</p>
               </div>
               <Button onClick={generatePlan} disabled={loading} className="h-12 rounded-xl gap-2 shadow-primary/20 bg-primary">
                  <Sparkles size={18} /> {loading ? "Generating..." : "Regenerate Plan"}
               </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-4">
               <div className="space-y-6">
                  <Card className="p-6">
                     <h3 className="font-bold text-slate-900 mb-4">Focus Mode</h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary">
                           <Clock size={16} />
                           <span className="text-sm font-bold">25:00</span>
                        </div>
                        <Button variant="outline" className="w-full text-xs py-2 rounded-lg">Start Pomodoro</Button>
                     </div>
                  </Card>
               </div>

               <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center gap-4 mb-2">
                     <Badge variant="primary">Today, May 14</Badge>
                  </div>
                  <Card className="p-0 overflow-hidden divide-y divide-slate-100">
                     {loading ? (
                        Array(4).fill(0).map((_, i) => (
                           <div key={i} className="p-6 flex gap-6">
                              <Skeleton className="h-4 w-20" />
                              <div className="flex-1 space-y-2">
                                 <Skeleton className="h-4 w-1/2" />
                                 <Skeleton className="h-3 w-1/4" />
                              </div>
                           </div>
                        ))
                     ) : plan.length > 0 ? (
                        plan.map((item, i) => (
                           <TaskItem key={i} time={item.time} title={item.title} status={item.status} />
                        ))
                     ) : (
                        <div className="p-12 text-center text-slate-400">
                           No tasks generated yet. Click regenerate to start.
                        </div>
                     )}
                  </Card>
               </div>
            </div>
         </div>
      </div>
   );
}

function TaskItem({ time, title, status }: { time: string; title: string; status: 'Done' | 'In Progress' | 'Upcoming' }) {
   return (
      <div className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors">
         <div className="w-24 shrink-0">
            <p className="text-xs font-bold text-slate-400">{time}</p>
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">
               {status === 'Done' ? 'Completed' : status === 'In Progress' ? 'Currently working' : 'Scheduled'}
            </p>
         </div>
         {status === 'Done' ? (
            <CheckCircle2 className="text-green-500" size={20} />
         ) : status === 'In Progress' ? (
            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
         ) : (
            <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
         )}
      </div>
   );
}