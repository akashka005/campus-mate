import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Send,
   Plus,
   FileText,
   Paperclip,
   MoreVertical,
   Sparkles,
   Bot,
   User,
   ChevronLeft,
   Search,
   MessageSquare,
   ThumbsUp,
   ThumbsDown,
   RotateCcw,
   ChevronRight,
   ChevronDown,
   LayoutDashboard,
   Sparkles as SummaryIcon,
   Trash2,
   Share2,
   Settings,
   History,
   Command
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Skeleton } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_BASE_URL } from '../api/config';

interface Message {
   id: string;
   role: 'user' | 'assistant';
   content: string;
}

interface ChatSession {
   id: string;
   title: string;
   timestamp: number;
   messages: Message[];
}

const DEFAULT_SESSIONS: ChatSession[] = [
   {
      id: 'initial',
      title: 'Welcome Session',
      timestamp: Date.now(),
      messages: [
         {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your CampusMate AI assistant. I've been optimized with Llama 3.3 to help you with research, study planning, and document analysis. How can we accelerate your learning today?"
         }
      ]
   }
];

const GROQ_MODELS = [
   { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', desc: 'Powerful & Precise' },
   { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', desc: 'Fast & Instant' },
   { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', desc: 'Deep Reasoning' },
];

export default function AIChat() {
   const [sessions, setSessions] = useState<ChatSession[]>(() => {
      const saved = localStorage.getItem('campusmate_chats');
      return saved ? JSON.parse(saved) : DEFAULT_SESSIONS;
   });
   const [user, setUser] = useState<any>(null);
   const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0]?.id || 'initial');
   const [selectedModelId, setSelectedModelId] = useState(GROQ_MODELS[0].id);
   const [showModelMenu, setShowModelMenu] = useState(false);

   const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
   const messages = currentSession?.messages || [];
   const selectedModel = GROQ_MODELS.find(m => m.id === selectedModelId) || GROQ_MODELS[0];

   const [input, setInput] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [isSummarizing, setIsSummarizing] = useState(false);
   const [attachments, setAttachments] = useState<File[]>([]);
   const scrollRef = useRef<HTMLDivElement>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUser(data);
         } catch (error) {
            console.error("Chat User Fetch Error:", error);
         }
      };
      fetchUser();
   }, []);

   useEffect(() => {
      localStorage.setItem('campusmate_chats', JSON.stringify(sessions));
   }, [sessions]);

   useEffect(() => {
      if (scrollRef.current) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [messages]);

   const updateSessionMessages = (sessionId: string, newMessages: Message[]) => {
      setSessions(prev => prev.map(s => {
         if (s.id === sessionId) {
            let newTitle = s.title;
            if ((s.title === 'New Study Session' || s.title === 'Welcome Session') && newMessages.length > 1) {
               const firstUserMsg = newMessages.find(m => m.role === 'user');
               if (firstUserMsg) {
                  newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
               }
            }
            return { ...s, messages: newMessages, title: newTitle, timestamp: Date.now() };
         }
         return s;
      }));
   };

   const handleSend = async () => {
      if (!input.trim() && attachments.length === 0 || isLoading) return;

      const finalContent = input;
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: finalContent };
      const newMessages = [...messages, userMsg];
      updateSessionMessages(currentSessionId, newMessages);

      setInput('');
      setAttachments([]);
      setIsLoading(true);

      try {
         let hasUploaded = false;
         if (attachments.length > 0) {
            for (const file of attachments) {
               const uploadData = new FormData();
               uploadData.append('file', file);
               uploadData.append('collection_id', currentSessionId);

               const token = localStorage.getItem('token');
               await fetch('${API_BASE_URL}/api/v1/ai/documents/upload', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` },
                  body: uploadData
               });
               hasUploaded = true;
            }
         }

         const isResearchQuery = input.toLowerCase().includes('research') ||
            input.toLowerCase().includes('upload') ||
            input.toLowerCase().includes('document') ||
            input.toLowerCase().includes('paper');

         const formData = new FormData();
         formData.append('message', input);
         formData.append('model', selectedModelId);
         formData.append('history', JSON.stringify(messages));
         formData.append('use_rag', (hasUploaded || isResearchQuery) ? 'true' : 'false');
         formData.append('collection_id', 'general');

         const token = localStorage.getItem('token');
         const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
         });

         const data = await response.json();
         if (data.error) throw new Error(data.error);

         const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.content || "I'm sorry, I couldn't generate a response."
         };

         updateSessionMessages(currentSessionId, [...newMessages, assistantMsg]);
      } catch (error) {
         console.error(error);
         const errId = 'err-' + Date.now();
         updateSessionMessages(currentSessionId, [...newMessages, { id: errId, role: 'assistant', content: "Something went wrong. Please check your connection or try again." }]);
      } finally {
         setIsLoading(false);
      }
   };

   const createNewSession = () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
         id: newId,
         title: 'New Study Session',
         timestamp: Date.now(),
         messages: [
            {
               id: '1',
               role: 'assistant',
               content: "Starting a new focused study session. What's on your mind?"
            }
         ]
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
   };

   const handleDeleteSession = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (sessions.length <= 1) return;
      const newSessions = sessions.filter(s => s.id !== id);
      setSessions(newSessions);
      if (currentSessionId === id) {
         setCurrentSessionId(newSessions[0].id);
      }
   };

   const handleRenameSession = (id: string, newTitle: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
   };

   return (
      <div className="flex h-screen bg-white text-slate-900 font-sans">
         <aside className="w-[280px] bg-[#f9f9f9] border-r border-slate-200 flex flex-col hidden lg:flex">
            <div className="p-4">
               <Link to="/dashboard" className="flex items-center gap-2 mb-6 px-3 py-2 text-slate-500 hover:bg-slate-200/50 rounded-xl transition-all group">
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Dashboard</span>
               </Link>
               <button
                  onClick={createNewSession}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
               >
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Plus size={18} />
                     </div>
                     <span className="text-sm font-bold text-slate-700">New Session</span>
                  </div>
                  <Command size={14} className="text-slate-300" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 custom-scrollbar">
               <div>
                  <div className="flex items-center justify-between px-3 mb-4">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</span>
                     <History size={12} className="text-slate-300" />
                  </div>
                  <div className="space-y-1">
                     {sessions.map(session => (
                        <HistoryItem
                           key={session.id}
                           id={session.id}
                           active={currentSessionId === session.id}
                           label={session.title}
                           onSelect={() => setCurrentSessionId(session.id)}
                           onDelete={(e) => handleDeleteSession(session.id, e)}
                           onRename={(newTitle) => handleRenameSession(session.id, newTitle)}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-4 mt-auto">
               <Link to="/profile">
                  <Card className="bg-white border-slate-200 p-3 flex items-center gap-3 shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                     <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 font-bold italic group-hover:scale-105 transition-transform">
                        {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('') : "CM"}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || "Loading..."}</p>
                     </div>
                     <Settings size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </Card>
               </Link>
            </div>
         </aside>
         <main className="flex-1 flex flex-col min-w-0 h-full relative">
            <header className="h-16 px-6 flex items-center justify-between z-20">
               <div className="relative">
                  <button
                     onClick={() => setShowModelMenu(!showModelMenu)}
                     className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-2xl transition-all group"
                  >
                     <span className="text-lg font-bold text-slate-800">CampusMate <span className="text-slate-400 font-medium">3.3</span></span>
                     <ChevronDown size={16} className={cn("text-slate-400 transition-transform", showModelMenu && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                     {showModelMenu && (
                        <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-3 z-50"
                        >
                           {GROQ_MODELS.map(model => (
                              <button
                                 key={model.id}
                                 onClick={() => { setSelectedModelId(model.id); setShowModelMenu(false); }}
                                 className={cn(
                                    "w-full text-left p-4 rounded-3xl transition-all flex items-center justify-between group",
                                    selectedModelId === model.id ? "bg-primary/5 border border-primary/10" : "hover:bg-slate-50"
                                 )}
                              >
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">{model.label}</p>
                                    <p className="text-[10px] text-slate-500">{model.desc}</p>
                                 </div>
                                 {selectedModelId === model.id && <Sparkles size={16} className="text-primary" />}
                              </button>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>


            </header>
            <div
               ref={scrollRef}
               className="flex-1 overflow-y-auto custom-scrollbar px-6"
            >
               <div className="max-w-3xl mx-auto py-12 space-y-12">
                  {messages.length === 1 && (
                     <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary animate-bounce">
                           <Bot size={32} />
                        </div>
                        <div>
                           <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-2">How can I help you study?</h2>
                           <p className="text-slate-500 text-lg">Analyze research papers, create quizzes, or plan your week.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl pt-8">
                           <QuickAction
                              label="Research Deep-Dive"
                              desc="Analyze your last 3 uploaded papers"
                              icon={<Search size={18} />}
                              onClick={() => setInput("Can you perform a deep-dive analysis on my most recent research uploads and find any conflicting theories?")}
                           />
                           <QuickAction
                              label="Technical Interview"
                              desc="Practice for your next CS coding round"
                              icon={<Bot size={18} />}
                              onClick={() => setInput("I want to practice for a technical interview. Can you act as a Senior Engineer at a tech company and ask me some challenging DSA questions?")}
                           />
                           <QuickAction
                              label="Curriculum Planner"
                              desc="Organize your upcoming exam weeks"
                              icon={<History size={18} />}
                              onClick={() => setInput("Help me create a detailed 4-week study plan for my upcoming finals based on my current document library.")}
                           />
                           <QuickAction
                              label="Citation Wizard"
                              desc="Fix references and bibliography"
                              icon={<SummaryIcon size={18} />}
                              onClick={() => setInput("I have a list of sources. Can you help me format them into a perfect APA bibliography?")}
                           />
                        </div>
                     </div>
                  )}

                  {messages.map((msg, idx) => (
                     <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                           "group flex gap-6",
                           msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                     >
                        <div className={cn(
                           "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center",
                           msg.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-primary text-white shadow-lg shadow-primary/20"
                        )}>
                           {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className={cn(
                           "flex flex-col gap-3 min-w-0 max-w-[85%]",
                           msg.role === 'user' ? "items-end text-right" : "items-start text-left"
                        )}>
                           <div className={cn(
                              "text-[15px] leading-relaxed text-slate-700",
                              msg.role === 'user' ? "bg-slate-50 px-6 py-4 rounded-[2rem] rounded-tr-none text-lg" : "w-full"
                           )}>
                              {msg.role === 'user' ? (
                                 <div className="whitespace-pre-wrap">{msg.content}</div>
                              ) : (
                                 <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                       p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                       h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900 font-display" {...props} />,
                                       h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3 text-slate-900 font-display" {...props} />,
                                       h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-900 font-display" {...props} />,
                                       ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                       ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                       li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                       strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                       code: ({ node, className, children, ...props }) => (
                                          <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                                       ),
                                       pre: ({ node, ...props }) => <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono" {...props} />,
                                    }}
                                 >
                                    {msg.content}
                                 </ReactMarkdown>
                              )}
                           </div>
                           {msg.role === 'assistant' && idx > 0 && (
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><ThumbsUp size={16} /></button>
                                 <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><ThumbsDown size={16} /></button>
                                 <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all ml-2"><RotateCcw size={16} /></button>
                              </div>
                           )}
                        </div>
                     </motion.div>
                  ))}

                  {isLoading && (
                     <div className="flex gap-6">
                        <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                           <Bot size={20} />
                        </div>
                        <div className="space-y-3 w-full">
                           <Skeleton className="h-5 w-full rounded-full" />
                           <Skeleton className="h-5 w-4/5 rounded-full" />
                           <Skeleton className="h-5 w-2/3 rounded-full" />
                        </div>
                     </div>
                  )}
               </div>
            </div>
            <div className="w-full bg-gradient-to-t from-white via-white to-transparent pt-12 pb-8 px-6">
               <div className="max-w-3xl mx-auto relative">
                  <AnimatePresence>
                     {attachments.length > 0 && (
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: 10 }}
                           className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-2"
                        >
                           {attachments.map((file, idx) => (
                              <div key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in zoom-in">
                                 <FileText size={14} className="text-primary" />
                                 <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{file.name}</span>
                                 <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">×</button>
                              </div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <div className="bg-[#f4f4f4] rounded-[2.5rem] p-2 flex items-end gap-2 shadow-sm border border-transparent focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-2xl transition-all duration-300">
                     <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-12 w-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-all"
                     >
                        <Paperclip size={20} />
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && setAttachments(prev => [...prev, ...Array.from(e.target.files!)])} />

                     <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Message CampusMate..."
                        className="flex-1 bg-transparent py-3.5 px-2 outline-none resize-none text-slate-700 leading-relaxed placeholder:text-slate-500 max-h-48 scroll-none"
                        rows={1}
                     />

                     <button
                        onClick={handleSend}
                        disabled={(!input.trim() && attachments.length === 0) || isLoading}
                        className={cn(
                           "h-12 w-12 flex items-center justify-center rounded-full transition-all",
                           input.trim() ? "bg-slate-900 text-white shadow-xl scale-110" : "text-slate-300 pointer-events-none"
                        )}
                     >
                        <Send size={20} />
                     </button>
                  </div>

                  <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                     CampusMate can make mistakes. Check important info.
                  </p>
               </div>
            </div>
         </main>
      </div>
   );
}

function QuickAction({ label, desc, icon, onClick }: { label: string, desc: string, icon: React.ReactNode, onClick: () => void }) {
   return (
      <button
         onClick={onClick}
         className="flex items-start gap-4 px-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-left hover:bg-slate-50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
      >
         <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            {icon}
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 mb-0.5">{label}</p>
            <p className="text-xs text-slate-500 leading-snug">{desc}</p>
         </div>
      </button>
   );
}

interface HistoryItemProps {
   id: string;
   label: string;
   active?: boolean;
   onSelect: () => void;
   onDelete: (e: React.MouseEvent) => void;
   onRename: (newTitle: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ label, active, onSelect, onDelete, onRename }) => {
   const [isEditing, setIsEditing] = useState(false);
   const [editValue, setEditValue] = useState(label);
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      if (isEditing) {
         inputRef.current?.focus();
         inputRef.current?.select();
      }
   }, [isEditing]);

   const handleSubmit = () => {
      if (editValue.trim() && editValue !== label) {
         onRename(editValue);
      }
      setIsEditing(false);
   };

   return (
      <div
         onClick={() => !isEditing && onSelect()}
         className={cn(
            "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all group relative cursor-pointer",
            active
               ? "bg-white shadow-sm border border-slate-100 text-slate-900"
               : "text-slate-500 hover:bg-slate-200/50 border border-transparent"
         )}>
         {isEditing ? (
            <input
               ref={inputRef}
               value={editValue}
               onChange={(e) => setEditValue(e.target.value)}
               onBlur={handleSubmit}
               onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
               className="w-full bg-transparent outline-none font-medium text-slate-900"
            />
         ) : (
            <div className="flex items-center justify-between gap-2">
               <p className="truncate pr-6 font-medium flex-1">{label}</p>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                     onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                     className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-primary transition-colors"
                  >
                     <FileText size={12} />
                  </button>
                  <button
                     onClick={onDelete}
                     className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                  >
                     <Trash2 size={12} />
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}