import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   User as UserIcon,
   Settings,
   BookOpen,
   GraduationCap,
   ChevronRight,
   Edit2,
   LogOut,
   Clock,
   TrendingUp,
   Award,
   Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';

export default function Profile() {
   const [activeTab, setActiveTab] = React.useState("Academic Identity");
   const [user, setUser] = React.useState<any>(null);
   const [stats, setStats] = React.useState<any>(null);
   const [loading, setLoading] = React.useState(true);
   const [isEditing, setIsEditing] = React.useState(false);
   const [editData, setEditData] = React.useState({
      full_name: "",
      university: "",
      major: "",
      gpa: ""
   });

   const fetchData = async () => {
      try {
         const token = localStorage.getItem('token');
         const headers = { 'Authorization': `Bearer ${token}` };

         const userRes = await fetch('http://localhost:8000/api/v1/auth/me', { headers });
         if (userRes.ok) {
            const userData = await userRes.json();
            setUser(userData);
            setEditData({
               full_name: userData.full_name,
               university: userData.university,
               major: userData.major,
               gpa: userData.gpa
            });
         }

         const statsRes = await fetch('http://localhost:8000/api/v1/ai/stats', { headers });
         const statsData = await statsRes.json();
         setStats(statsData);
      } catch (error) {
         console.error("Profile fetch failed:", error);
      } finally {
         setLoading(false);
      }
   };

   React.useEffect(() => {
      fetchData();
      document.documentElement.classList.remove('dark');
   }, []);

   const handleLogout = () => {
      window.location.href = '/login';
   };

   const handleSaveProfile = async () => {
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:8000/api/v1/auth/me', {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(editData)
         });

         if (response.ok) {
            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
            alert("Profile updated successfully!");
         } else {
            alert("Failed to update profile.");
         }
      } catch (error) {
         console.error("Profile update failed:", error);
         alert("Error connecting to server.");
      }
   };

   const [ragEnabled, setRagEnabled] = React.useState(false);
   const [aiTone, setAiTone] = React.useState("Academic");

   return (
      <div className="flex min-h-screen bg-[#fcfdff]">
         <div className="flex-1 px-8 py-8">
            <header className="mb-10 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                     <ChevronRight className="rotate-180" size={24} />
                  </Link>
                  <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">Academic Profile</h1>
               </div>
               <Button onClick={handleLogout} variant="outline" className="gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut size={18} /> Logout
               </Button>
            </header>

            <div className="max-w-5xl mx-auto space-y-8">
               <Card className="p-8 relative overflow-hidden border-none shadow-xl">
                  <div className="glow w-64 h-64 bg-primary/10 -top-32 -right-32" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                     <div className="relative group">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-4 border-white shadow-xl">
                           {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={64} />}
                        </div>
                        <button className="absolute bottom-1 right-1 h-10 w-10 bg-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
                           <Edit2 size={16} />
                        </button>
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                           <h2 className="text-3xl font-display font-bold text-slate-900">{user?.full_name || "Guest User"}</h2>
                        </div>
                        <p className="text-slate-500 mb-6 font-medium">{user?.major || "Academic"} Student @ {user?.university || "University"}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                              <TrendingUp size={16} className="text-green-500" />
                              <span className="text-sm font-bold text-slate-700">{user?.gpa || "0.0"} GPA</span>
                           </div>
                           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                              <Award size={16} className="text-primary" />
                              <span className="text-sm font-bold text-slate-700">Academic Integrity Verified</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <Button onClick={() => setIsEditing(!isEditing)} className="rounded-xl px-8 h-12">
                           {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                     </div>
                  </div>
               </Card>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     {[
                        { id: "Academic Identity", icon: <UserIcon size={18} /> },
                        { id: "Research Vault", icon: <BookOpen size={18} /> },
                        { id: "Study Groups", icon: <GraduationCap size={18} /> },
                        { id: "AI Preferences", icon: <Sparkles size={18} /> },
                        { id: "Global Settings", icon: <Settings size={18} /> }
                     ].map(tab => (
                        <SettingsNavItem
                           key={tab.id}
                           icon={tab.icon}
                           label={tab.id}
                           active={activeTab === tab.id}
                           onClick={() => setActiveTab(tab.id)}
                        />
                     ))}
                  </div>

                  <div className="lg:col-span-2">
                     <AnimatePresence mode="wait">
                        {activeTab === "Academic Identity" && (
                           <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                              <Card className="p-8">
                                 <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                                    {isEditing && (
                                       <Button onClick={handleSaveProfile} size="sm" className="rounded-lg h-9">Save Changes</Button>
                                    )}
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                       { label: "Full Name", key: "full_name" },
                                       { label: "University", key: "university" },
                                       { label: "Major", key: "major" },
                                       { label: "GPA", key: "gpa" }
                                    ].map(field => (
                                       <div key={field.key} className="space-y-1.5">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{field.label}</label>
                                          {isEditing ? (
                                             <input
                                                type="text"
                                                value={editData[field.key as keyof typeof editData]}
                                                onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                                                className="w-full h-12 px-4 bg-white border border-primary/20 rounded-xl flex items-center text-slate-700 font-medium outline-none focus:border-primary shadow-sm"
                                             />
                                          ) : (
                                             <div className="h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center text-slate-700 font-medium">{user?.[field.key] || "N/A"}</div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </Card>

                              <Card className="p-8">
                                 <h3 className="text-xl font-bold text-slate-900 mb-6">Academic Activity</h3>
                                 <div className="grid grid-cols-3 gap-6">
                                    <ActivityCard icon={<BookOpen size={20} />} value={stats?.document_count || 0} label="Docs Analyzed" color="primary" />
                                    <ActivityCard icon={<Award size={20} />} value={stats?.quizzes_passed || 0} label="Quizzes Passed" color="secondary" />
                                    <ActivityCard icon={<Clock size={20} />} value={stats?.study_time || "0h"} label="Study Time" color="accent" />
                                 </div>
                              </Card>
                           </motion.div>
                        )}

                        {activeTab === "Research Vault" && (
                           <motion.div key="research" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                              <Card className="p-8 text-center py-16">
                                 <div className="h-16 w-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen size={32} />
                                 </div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">Research Library</h3>
                                 <p className="text-slate-500 max-w-sm mx-auto">Your archived papers, bibliography, and citation history will appear here.</p>
                                 <Link to="/docs"><Button variant="outline" className="mt-8 rounded-xl">View Uploads</Button></Link>
                              </Card>
                           </motion.div>
                        )}

                        {activeTab === "Study Groups" && (
                           <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                              <Card className="p-8 text-center py-16">
                                 <div className="h-16 w-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-6">
                                    <GraduationCap size={32} />
                                 </div>
                                 <h3 className="text-xl font-bold text-slate-900 mb-2">Peer Collaboration</h3>
                                 <p className="text-slate-500 max-w-sm mx-auto">Connect with students in your major for shared quiz sessions and group planning.</p>
                                 <Button variant="outline" className="mt-8 rounded-xl" disabled>Coming Soon</Button>
                              </Card>
                           </motion.div>
                        )}

                        {activeTab === "AI Preferences" && (
                           <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                              <Card className="p-8">
                                 <h3 className="text-xl font-bold text-slate-900 mb-6">AI Configuration</h3>
                                 <div className="space-y-6">
                                    <button
                                       onClick={() => setRagEnabled(!ragEnabled)}
                                       className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 rounded-3xl border border-slate-100 transition-all text-left"
                                    >
                                       <div>
                                          <p className="font-bold text-slate-900">Advanced RAG Mode</p>
                                          <p className="text-xs text-slate-500">Enable deep scanning for complex documents</p>
                                       </div>
                                       <div className={cn(
                                          "h-7 w-12 rounded-full relative transition-colors duration-300",
                                          ragEnabled ? "bg-primary" : "bg-slate-200"
                                       )}>
                                          <div className={cn(
                                             "h-5 w-5 bg-white rounded-full absolute top-1 transition-all duration-300",
                                             ragEnabled ? "right-1" : "left-1"
                                          )} />
                                       </div>
                                    </button>
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                       <div>
                                          <p className="font-bold text-slate-900">Tone Preference</p>
                                          <p className="text-xs text-slate-500">Set the AI's explanation style</p>
                                       </div>
                                       <button
                                          onClick={() => setAiTone(prev => prev === "Academic" ? "Friendly" : "Academic")}
                                          className="active:scale-95 transition-transform"
                                       >
                                          <Badge variant={aiTone === "Academic" ? "primary" : "secondary"}>
                                             {aiTone}
                                          </Badge>
                                       </button>
                                    </div>
                                 </div>
                              </Card>
                           </motion.div>
                        )}

                        {activeTab === "Global Settings" && (
                           <motion.div key="global" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                              <Card className="p-8">
                                 <h3 className="text-xl font-bold text-slate-900 mb-6">System Settings</h3>
                                 <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                          <Sparkles size={20} className="text-primary" />
                                          <span className="font-bold text-slate-700">Interface Theme</span>
                                       </div>
                                       <Badge variant="outline">Light Mode Only</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full justify-between h-14 rounded-2xl text-slate-700 px-6">
                                       <div className="flex items-center gap-3">
                                          <Sparkles size={20} className="text-primary" />
                                          <span className="font-bold">Language</span>
                                       </div>
                                       <Badge variant="outline">English (US)</Badge>
                                    </Button>
                                 </div>
                              </Card>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function ActivityCard({ icon, value, label, color }: { icon: React.ReactNode; value: any; label: string; color: string }) {
   const colorMap = {
      primary: "bg-primary/10 text-primary",
      secondary: "bg-indigo-100 text-indigo-600",
      accent: "bg-violet-100 text-violet-600"
   };
   return (
      <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all">
         <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2", colorMap[color as keyof typeof colorMap])}>
            {icon}
         </div>
         <p className="text-2xl font-bold text-slate-900">{value}</p>
         <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
   );
}

function SettingsNavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
   return (
      <button
         onClick={onClick}
         className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group font-display",
            active ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-slate-50 text-slate-600"
         )}
      >
         <div className="flex items-center gap-3">
            <div className={cn(
               "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
               active ? "bg-white/20" : "bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary"
            )}>
               {icon}
            </div>
            <span className="font-bold text-sm">{label}</span>
         </div>
         <ChevronRight size={18} className={active ? "text-white/60" : "text-slate-300"} />
      </button>
   );
}