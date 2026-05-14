import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, BrainCircuit, Search, FileText, ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from '../ui/Primitives';
import { cn } from '@/src/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetId?: string;
  path?: string;
  icon: React.ReactNode;
}

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('campusmate_tour_seen');
    if (!hasSeenTour && location.pathname === '/dashboard') {
      setIsVisible(true);
    }
  }, [location.pathname]);

  const steps: TourStep[] = [
    {
      id: 'chat',
      title: 'AI PDF Chat',
      content: 'Upload your lecture notes or research papers and have a conversation with them. CampusMate AI understands complex academic context.',
      targetId: 'sidebar-chat',
      path: '/dashboard',
      icon: <FileText className="text-primary" />
    },
    {
      id: 'quiz',
      title: 'Smart Quiz Generator',
      content: 'Turn your study materials into interactive quizzes instantly. Our AI identifies key concepts to test your knowledge.',
      targetId: 'sidebar-quiz',
      path: '/dashboard',
      icon: <BrainCircuit className="text-secondary" />
    },
    {
      id: 'resume',
      title: 'Resume Analyzer',
      content: 'Get your resume ready for internships. Our ATS optimizer gives you a competitive score and specific improvement tips.',
      targetId: 'sidebar-resume',
      path: '/dashboard',
      icon: <Search className="text-accent" />
    },
    {
      id: 'finished',
      title: 'You\'re All Set!',
      content: 'Start your academic journey with CampusMate AI. Reach out if you need any help!',
      icon: <Sparkles className="text-yellow-500" />
    }
  ];

  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      if (step.targetId) {
        const el = document.getElementById(step.targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('campusmate_tour_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
        onClick={handleComplete}
      />
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          className="absolute z-[101] rounded-xl border-4 border-primary ring-[1000px] ring-slate-900/40 transition-all duration-300"
        />
      )}

      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {currentStep === -1 ? (
            <motion.div
              key="welcome"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="z-[102] w-full max-w-lg pointer-events-auto"
            >
              <Card className="p-10 text-center relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]">
                <div className="glow w-64 h-64 bg-primary/20 -top-32 -left-32" />
                <div className="relative z-10">
                  <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30">
                    <Sparkles size={40} />
                  </div>
                  <Badge variant="primary" className="mb-4">v1.0 Launch</Badge>
                  <h2 className="font-display text-4xl font-extrabold text-slate-900 mb-4">Welcome to CampusMate AI</h2>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    The future of academic excellence is here. Let us show you how to leverage AI to study smarter, not harder.
                  </p>
                  <Button onClick={() => setCurrentStep(0)} size="lg" className="w-full h-14 rounded-2xl group">
                    Start Platform Tour <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <button
                    onClick={handleComplete}
                    className="mt-4 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Explore on my own
                  </button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: targetRect ? 0 : 0,
                opacity: 1,
                x: targetRect ? (targetRect.right + 200 > window.innerWidth ? -100 : 200) : 0
              }}
              exit={{ y: -20, opacity: 0 }}
              className={cn(
                "z-[102] w-full max-w-md pointer-events-auto",
                targetRect ? "fixed" : "relative"
              )}
              style={targetRect ? {
                top: Math.max(100, targetRect.top - 50),
                left: Math.max(100, targetRect.right + 40)
              } : {}}
            >
              <Card className="p-8 relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-primary/10">
                <button
                  onClick={handleComplete}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center"
                  >
                    {steps[currentStep].icon}
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-1">Step {currentStep + 1} of {steps.length}</p>
                    <h3 className="font-display text-xl font-bold text-slate-900">{steps[currentStep].title}</h3>
                  </div>
                </div>

                <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                  {steps[currentStep].content}
                </p>
                {currentStep < steps.length - 1 && (
                  <div className="mb-8 rounded-xl bg-slate-50 p-4 border border-slate-100 overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Live Preview</p>
                    <div className="space-y-2 animate-pulse">
                      <div className={cn("h-4 w-3/4 rounded bg-slate-200", currentStep === 0 && "bg-primary/20")} />
                      <div className={cn("h-4 w-1/2 rounded bg-slate-200", currentStep === 1 && "bg-secondary/20")} />
                      <div className={cn("h-4 w-2/3 rounded bg-slate-200", currentStep === 2 && "bg-accent/20")} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {steps.map((_, i) => (
                      <div key={i} className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-slate-100"
                      )} />
                    ))}
                  </div>
                  <Button onClick={handleNext} className="gap-2 rounded-xl h-11 px-6">
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'} <ChevronRight size={18} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}