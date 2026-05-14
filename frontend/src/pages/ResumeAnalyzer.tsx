import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Upload,
  ChevronLeft,
  PieChart,
  LineChart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Target,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge, Skeleton } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

const skillData: any[] = [];

export default function ResumeAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/v1/ai/resume/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResults(data);
      setShowResults(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] p-8 pb-20 relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">Analysis Complete</h4>
                <p className="text-xs text-slate-300">ATS Score: {results?.score || 0}/100. AI insights generated.</p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <ChevronLeft className="rotate-90" size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        <header className="mb-12">
          <Badge variant="accent" className="mb-4">Internal Tool v2.1</Badge>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-4">ATS Optimizer & Resume Analyzer</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Our multi-agent system analyzes your resume against industry standards and specific job roles
            to provide actionable feedback and skill gap analysis.
          </p>
        </header>

        {!showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={cn(
              "p-12 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all",
              analyzing ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40"
            )}>
              {analyzing ? (
                <div className="space-y-8 w-full max-w-md">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                      <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Intelligence at Work...</h3>
                    <p className="text-sm text-slate-500 mb-8">Comparing profile with 10,000+ job descriptions</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                    <Skeleton className="h-8 w-full rounded-xl" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 text-slate-400 group-hover:text-primary transition-colors cursor-pointer" onClick={() => document.getElementById('resume-upload')?.click()}>
                    <Upload size={32} />
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {file ? file.name : "Upload your resume"}
                  </h3>
                  <p className="text-slate-500 max-w-sm mb-8">
                    {file ? "File selected. Ready for analysis." : "Drag and drop your PDF or DOCX file here to receive a full AI analysis."}
                  </p>
                  <Button onClick={startAnalysis} disabled={!file} size="lg" className="rounded-2xl h-14 px-10">
                    Process Resume
                  </Button>
                  <p className="mt-6 text-xs text-slate-400">Supported formats: PDF, DOCX (Max 5MB)</p>
                </>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="p-8 flex flex-col items-center text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">ATS Score</p>
              <div className="relative h-48 w-48 mb-8">
                <svg className="h-full w-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <motion.circle
                    initial={{ strokeDashoffset: 550 }}
                    animate={{ strokeDashoffset: 550 - (550 * 0.82) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96" cy="96" r="88" fill="transparent" stroke="#1e3a8a" strokeWidth="12" strokeDasharray="553" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <h4 className="text-5xl font-extrabold text-slate-900">{results?.score || 0}</h4>
                  <p className="text-slate-400 font-bold">/ 100</p>
                </div>
              </div>
              <Badge variant="primary" className="mb-4">
                {(results?.score || 0) > 80 ? "Highly Competitive" : (results?.score || 0) > 60 ? "Average" : "Needs Work"}
              </Badge>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your resume has an ATS score of {results?.score || 0}. See the detailed breakdown below for improvements.
              </p>
            </Card>
            <Card className="p-8 lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-xl font-bold text-slate-900">Skill Distribution</h3>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold text-slate-500">Your Average</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results?.skills || skillData}>
                    <PolarGrid stroke="#f1f5f9" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name="Student" dataKey="A" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className="lg:col-span-3 grid gap-8 md:grid-cols-2">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">Strengths</h3>
                </div>
                <ul className="space-y-4">
                  {results?.strengths?.map((s: string, i: number) => (
                    <StrengthItem key={i} text={s} />
                  ))}
                </ul>
              </Card>

              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-slate-900">Improvements</h3>
                </div>
                <ul className="space-y-4">
                  {results?.improvements?.map((s: string, i: number) => (
                    <ImproveItem key={i} text={s} />
                  ))}
                </ul>
                <Button onClick={() => window.location.href = '/chat'} variant="outline" className="w-full mt-8 rounded-2xl group">
                  Fix with AI Editor <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StrengthItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-sm text-slate-700">
      <div className="mt-1 h-3.5 w-3.5 rounded-full bg-green-500 shrink-0" />
      {text}
    </li>
  );
}

function ImproveItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-sm text-slate-700">
      <div className="mt-1 h-3.5 w-3.5 rounded-full bg-amber-500 shrink-0" />
      {text}
    </li>
  );
}