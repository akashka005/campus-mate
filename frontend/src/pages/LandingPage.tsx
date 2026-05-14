import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../components/ui/Primitives';
import Navbar from '../components/layout/Navbar';
import {
  FileText,
  Brain,
  Search,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function LandingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="glow w-[600px] h-[600px] bg-primary/20 top-[-200px] left-[-100px]" />
      <div className="glow w-[500px] h-[500px] bg-secondary/15 bottom-[-100px] right-[-100px]" />

      <Navbar />

      <main className="pt-32">
        <section className="container mx-auto px-6 pb-20 pt-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="primary" className="mb-6 px-4 py-1.5 text-sm">
                <Sparkles size={14} className="mr-2" /> Powered by Llama 3 (Groq)
              </Badge>
              <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-7xl">
                Your AI <br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Academic Companion
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
                Chat with notes, generate quizzes, analyze resumes, and study smarter.
                The all-in-one platform for modern students and academics.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="h-14 px-8 rounded-2xl group">
                    Get Started Free
                    <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Features
                </Button>
              </div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 overflow-hidden rounded-[2.5rem] border-[8px] border-slate-900/5 bg-slate-200/50 p-2 shadow-2xl backdrop-blur-sm">
                <div className="rounded-[2rem] bg-white p-6 shadow-inner min-h-[400px]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-yellow-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="h-8 w-48 rounded-lg bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="h-32 rounded-2xl bg-indigo-50 p-4">
                        <div className="h-4 w-20 rounded bg-indigo-200 mb-4" />
                        <div className="h-8 w-32 rounded bg-indigo-300" />
                      </div>
                      <div className="h-48 rounded-2xl bg-slate-50 p-4">
                        <div className="h-4 w-24 rounded bg-slate-200 mb-4" />
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded bg-slate-100" />
                          <div className="h-2 w-[80%] rounded bg-slate-100" />
                          <div className="h-2 w-[90%] rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-48 rounded-2xl bg-violet-50 p-4">
                        <div className="h-4 w-24 rounded bg-violet-200 mb-4" />
                        <div className="flex items-end gap-2 h-24">
                          <div className="h-[40%] w-4 rounded-t bg-violet-300" />
                          <div className="h-[70%] w-4 rounded-t bg-violet-400" />
                          <div className="h-[55%] w-4 rounded-t bg-violet-300" />
                          <div className="h-[90%] w-4 rounded-t bg-violet-500" />
                          <div className="h-[30%] w-4 rounded-t bg-violet-300" />
                        </div>
                      </div>
                      <div className="h-32 rounded-2xl bg-cyan-50 p-4">
                        <div className="h-4 w-20 rounded bg-cyan-200 mb-4" />
                        <div className="h-10 w-10 rounded-full border-4 border-cyan-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 z-20 rounded-2xl bg-white p-4 shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Quiz Ready!</p>
                    <p className="text-[10px] text-slate-500">20 MCQs from Biology.pdf</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 z-20 rounded-2xl bg-white p-4 shadow-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white">
                    <Brain size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">AI Analysis</p>
                    <p className="text-[10px] text-slate-500">Study gap identified in module 3</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section id="features" className="bg-white py-24">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 className="font-display text-4xl font-bold text-slate-900">Studying, simplified by AI.</h2>
              <p className="mt-4 text-lg text-slate-600">Everything you need to excel in your academic journey.</p>
            </div>

            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<FileText className="text-primary" />}
                title="AI PDF Chat"
                description="Upload papers or lecture notes and ask anything. Get instant explanations and summaries."
              />
              <FeatureCard
                icon={<Brain className="text-secondary" />}
                title="Smart Quiz Generator"
                description="Transform notes into personalized interactive quizzes and flashcards automatically."
              />
              <FeatureCard
                icon={<Search className="text-accent" />}
                title="Resume Analyzer"
                description="Get detailed ATS scores and skill analysis to land your dream internship."
              />
              <FeatureCard
                icon={<Calendar className="text-indigo-500" />}
                title="AI Study Planner"
                description="Dynamic schedules that adapt to your progress and exam dates automatically."
              />
              <FeatureCard
                icon={<Cpu className="text-purple-500" />}
                title="Multi-Agent AI"
                description="Collaborative AI agents that work together to solve complex research tasks."
              />
              <FeatureCard
                icon={<Zap className="text-yellow-500" />}
                title="Rapid Recaps"
                description="Synthesize long lecture recordings and papers into 5-minute key takeaway lists."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">CampusMate AI. Built for the future of learning.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </Card>
  );
}