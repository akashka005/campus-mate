import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
   Settings as SettingsIcon,
   User,
   Bell,
   Shield,
   Zap,
   Globe,
   ChevronRight,
   ChevronLeft,
   Moon,
   Sun,
   Database,
   Cloud,
   Mail,
   School,
   GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Skeleton } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';

export default function Settings() {
   const [activeSection, setActiveSection] = useState('Account');
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);

   const fetchUser = async () => {
      try {
         const token = localStorage.getItem('token');
         const res = await fetch('http://localhost:8000/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await res.json();
         setUser(data);
      } catch (error) {
         console.error("Failed to fetch user in settings:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchUser();
   }, []);

   const handleSave = async () => {
      setSaving(true);
      try {
         const token = localStorage.getItem('token');
         await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
         setSaving(false);
      }
   };

   const SECTIONS = [
      { id: 'Account', icon: <User size={20} />, label: 'Account & Identity' },
      { id: 'AI', icon: <Zap size={20} />, label: 'AI Preferences' },
      { id: 'Notifications', icon: <Bell size={20} />, label: 'Notifications' },
      { id: 'Privacy', icon: <Shield size={20} />, label: 'Privacy & Security' },
      { id: 'Integrations', icon: <Cloud size={20} />, label: 'Connected Apps' },
   ];

   return (
      <div className="min-h-screen bg-[#fcfdff] p-8 pb-24">
         <div className="max-w-6xl mx-auto">
            <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors w-fit">
               <ChevronLeft size={20} />
               <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>

            <header className="mb-12">
               <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-2">System Settings</h1>
               <p className="text-slate-500">Configure your workspace and AI interaction models.</p>
            </header>

            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
               <div className="space-y-1">
                  {SECTIONS.map((section) => (
                     <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                           "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left",
                           activeSection === section.id
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "text-slate-500 hover:bg-slate-50"
                        )}
                     >
                        {section.icon}
                        {section.label}
                     </button>
                  ))}
               </div>
               <div className="space-y-6">
                  <Card className="p-8 relative">
                     <h3 className="text-2xl font-bold text-slate-900 mb-8">{activeSection}</h3>

                     {loading ? (
                        <div className="space-y-8">
                           <div className="flex items-center gap-6 pb-8 border-b">
                              <Skeleton className="h-20 w-20 rounded-3xl" />
                              <div className="space-y-2">
                                 <Skeleton className="h-6 w-48" />
                                 <Skeleton className="h-4 w-64" />
                              </div>
                           </div>
                           {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                     ) : activeSection === 'Account' && user && (
                        <div className="space-y-8">
                           <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                 <User size={40} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-bold text-slate-900">{user.full_name}</h4>
                                 <p className="text-sm text-slate-500 mb-4">{user.major || "Student"} • {user.university || "CampusMate Academy"}</p>
                                 <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8 text-xs">Change Photo</Button>
                                    <Link to="/profile"><Button size="sm" variant="ghost" className="h-8 text-xs text-primary">View Full Profile</Button></Link>
                                 </div>
                              </div>
                           </div>
                           <div className="grid gap-6">
                              <SettingRow label="Full Name" value={user.full_name} icon={<User size={16} />} />
                              <SettingRow label="Email Address" value={user.email} icon={<Mail size={16} />} />
                              <SettingRow label="University" value={user.university || "Not set"} icon={<School size={16} />} />
                              <SettingRow label="Major" value={user.major || "Not set"} icon={<GraduationCap size={16} />} />
                           </div>
                        </div>
                     )}

                     {activeSection === 'AI' && (
                        <div className="space-y-8">
                           <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                    <Zap size={24} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-900">Advanced Agentic Flow</p>
                                    <p className="text-xs text-slate-500">Enable multi-step reasoning for complex tasks.</p>
                                 </div>
                              </div>
                              <button className="h-6 w-11 bg-indigo-600 rounded-full relative transition-all">
                                 <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full" />
                              </button>
                           </div>
                           <div className="grid gap-6">
                              <SettingToggle label="Explain logic in responses" active />
                              <SettingToggle label="Auto-generate summaries for uploads" active />
                              <SettingToggle label="Tone: Academic/Professional" active />
                           </div>
                        </div>
                     )}

                     {activeSection === 'Notifications' && (
                        <div className="space-y-6">
                           <SettingToggle label="Study Session Reminders" active />
                           <SettingToggle label="Quiz Performance Reports" active />
                           <SettingToggle label="Security Alerts" active />
                        </div>
                     )}

                     {['Privacy', 'Integrations'].includes(activeSection) && (
                        <div className="py-20 text-center">
                           <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
                              <Database size={40} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 mb-2">Module Coming Soon</h3>
                           <p className="text-slate-500">We are currently building this security module.</p>
                        </div>
                     )}

                     <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4">
                        <Button variant="ghost">Reset Defaults</Button>
                        <Button onClick={handleSave} disabled={saving}>
                           {saving ? "Saving..." : "Save Changes"}
                        </Button>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   );
}

function SettingRow({ label, value, icon }: any) {
   return (
      <div className="flex items-center justify-between py-2 group">
         <div className="flex items-center gap-3">
            <div className="text-slate-400 group-hover:text-primary transition-colors">{icon}</div>
            <span className="text-sm font-bold text-slate-500">{label}</span>
         </div>
         <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-bold text-slate-900">{value}</span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
         </div>
      </div>
   );
}

function SettingToggle({ label, active }: any) {
   return (
      <div className="flex items-center justify-between py-2">
         <span className="text-sm font-bold text-slate-500">{label}</span>
         <button className={cn(
            "h-6 w-11 rounded-full relative transition-all",
            active ? "bg-primary" : "bg-slate-200"
         )}>
            <div className={cn(
               "absolute top-1 h-4 w-4 bg-white rounded-full transition-all",
               active ? "right-1" : "left-1"
            )} />
         </button>
      </div>
   );
}