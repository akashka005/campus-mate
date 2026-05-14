import { API_BASE_URL } from '../api/config';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit,
  ChevronLeft,
  Settings,
  FileText,
  Sparkles,
  Timer,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui/Primitives';
import { cn } from '@/src/lib/utils';

const mockQuestions: any[] = [];

export default function QuizGenerator() {
  const [step, setStep] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [showCustom, setShowCustom] = useState(false);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('${API_BASE_URL}/api/v1/ai/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setDocuments(data);
        if (data.length > 0) setSelectedDocId(data[0].collection_id);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocs();
  }, []);

  const startQuiz = async (type: 'doc' | 'custom') => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (type === 'doc' && selectedDocId) {
        formData.append('collection_id', selectedDocId);
      } else {
        formData.append('topic', customTopic || "General Knowledge");
        formData.append('difficulty', difficulty);
      }
      formData.append('num_questions', '5');

      const token = localStorage.getItem('token');
      const response = await fetch('${API_BASE_URL}/api/v1/ai/quiz/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
      setStep('quiz');
      setCurrentQ(0);
      setScore(0);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setStep('quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === questions[currentQ].correct) {
      setScore(s => s + 1);
    }
  };

  const submitQuizResult = async (finalScore: number) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('topic', customTopic || selectedDocId || 'General Knowledge');
      formData.append('score', finalScore.toString());
      formData.append('total', questions.length.toString());
      formData.append('difficulty', difficulty);

      await fetch('${API_BASE_URL}/api/v1/ai/quiz/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
    } catch (error) {
      console.error("Failed to submit quiz result:", error);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = score;
      submitQuizResult(finalScore);
      setStep('result');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8 text-slate-500 hover:text-primary transition-colors">
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>

        {step === 'setup' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="primary" className="mb-4">AI Content Generation</Badge>
            <h1 className="font-display text-4xl font-extrabold text-slate-900 mb-4">Magic Quiz Generator</h1>
            <p className="text-slate-500 text-lg mb-12">Transform any folder of notes, PDF files, or website URLs into interactive MCQs and flashcards.</p>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className={cn("p-8 transition-all duration-500", !showCustom ? "border-primary/20 bg-primary/5" : "opacity-50 grayscale hover:grayscale-0")}>
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-6">
                  <FileText size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Selection from Docs</h3>
                <p className="text-sm text-slate-600 mb-6">Create quiz based on your recently uploaded files.</p>

                {documents.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Source Document</p>
                    <select
                      value={selectedDocId}
                      onChange={(e) => {
                        setSelectedDocId(e.target.value);
                        setShowCustom(false);
                      }}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary transition-all"
                    >
                      {documents.map(doc => (
                        <option key={doc.id} value={doc.collection_id}>{doc.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p className="text-xs text-red-500 mb-6 italic">No documents found. Please upload some first.</p>
                )}

                <Button onClick={() => startQuiz('doc')} disabled={isLoading || documents.length === 0} className="w-full h-12 rounded-xl bg-primary shadow-lg shadow-primary/20">
                  {isLoading && !showCustom ? "Generating..." : "Generate from Doc"}
                </Button>
              </Card>

              <Card className={cn("p-8 transition-all duration-500", showCustom ? "border-primary/20 bg-primary/5" : "border-slate-100 hover:border-slate-200")}>
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-6">
                  <Settings size={28} />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Custom Configuration</h3>
                <p className="text-sm text-slate-600 mb-6">Manually pick topics, difficulty, and question type.</p>

                {showCustom ? (
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quiz Topic</p>
                      <input
                        type="text"
                        placeholder="e.g. Quantum Physics, History..."
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Difficulty Level</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['Easy', 'Intermediate', 'Hard'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={cn(
                              "h-9 rounded-lg text-[10px] font-bold transition-all border",
                              difficulty === lvl ? "bg-primary text-white border-primary" : "bg-white text-slate-500 border-slate-100 hover:border-primary/20"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <Button
                  variant={showCustom ? "primary" : "outline"}
                  onClick={() => {
                    if (!showCustom) setShowCustom(true);
                    else startQuiz('custom');
                  }}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl"
                >
                  {isLoading && showCustom ? "Generating..." : showCustom ? "Start Custom Quiz" : "Set Parameters"}
                </Button>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 'quiz' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</p>
                <h2 className="font-display text-2xl font-bold text-slate-900">Adaptive AI Quiz</h2>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                <Timer size={18} className="text-primary" />
                <span className="font-mono text-sm font-bold text-slate-700">14:52</span>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!questions[currentQ] ? (
                  <Card className="p-10 text-center">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Quiz Generation Incomplete</h3>
                    <p className="text-slate-500 mb-6">Something went wrong while loading this question. Please try generating the quiz again.</p>
                    <Button onClick={() => setStep('setup')}>Back to Setup</Button>
                  </Card>
                ) : (
                  <>
                    <Card className="p-10">
                      <h3 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">{questions[currentQ].question}</h3>
                      <div className="space-y-4">
                        {questions[currentQ].options.map((opt: string, i: number) => {
                          const isCorrect = i === questions[currentQ].correct;
                          const isSelected = selectedOption === i;
                          const showError = isAnswered && isSelected && !isCorrect;
                          const showSuccess = isAnswered && isCorrect;

                          return (
                            <motion.button
                              key={i}
                              onClick={() => handleOptionSelect(i)}
                              disabled={isAnswered}
                              animate={showError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                              transition={{ duration: 0.4 }}
                              className={cn(
                                "w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                                isSelected
                                  ? (isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50")
                                  : (isAnswered && isCorrect ? "border-green-500 bg-green-50" : "border-slate-100 hover:border-primary/40 hover:bg-slate-50")
                              )}
                            >
                              <span className={cn(
                                "font-medium",
                                isSelected ? "text-slate-900" : "text-slate-600"
                              )}>{opt}</span>
                              {showSuccess && <CheckCircle2 className="text-green-500" size={20} />}
                              {showError && <XCircle className="text-red-500" size={20} />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </Card>

                    <AnimatePresence>
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="overflow-hidden"
                        >
                          <Card className="p-6 bg-slate-50 border-none">
                            <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shrink-0 shadow-sm">
                                <BrainCircuit size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">AI Explanation</p>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                  "{questions[currentQ].explanation}"
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-end pt-4">
              <Button
                onClick={nextQuestion}
                disabled={!isAnswered}
                size="lg"
                className={cn(
                  "rounded-2xl px-12 gap-2 h-14 transition-all duration-500 shadow-xl shadow-primary/20",
                  isAnswered ? "opacity-100 translate-y-0" : "opacity-50 translate-y-2 pointer-events-none"
                )}
              >
                {currentQ === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight size={20} />
              </Button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-12"
          >
            <div className="h-24 w-24 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 mb-8">
              <Award size={48} />
            </div>
            <Badge variant="primary" className="mb-4">Quiz Completed</Badge>
            <h2 className="font-display text-5xl font-extrabold text-slate-900 mb-4">You scored {score}/{questions.length}</h2>
            <p className="text-slate-500 text-lg max-w-md mb-12">Great job! You've mastered these concepts. Ready to try something harder?</p>

            <div className="flex gap-4">
              <Button onClick={() => setStep('setup')} variant="outline" size="lg" className="rounded-2xl gap-2 h-14 px-8">
                <RotateCcw size={20} /> Try Again
              </Button>
              <Link to="/dashboard">
                <Button size="lg" className="rounded-2xl gap-2 h-14 px-8">
                  Back to Dashboard <ArrowRight size={20} />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}