import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui/Primitives';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        })
      });

      if (response.ok) {
        navigate('/login');
      } else {
        const errData = await response.json();
        setError(errData.detail || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="glow w-[500px] h-[500px] bg-secondary/10 top-[-100px] right-[-100px]" />
      <div className="glow w-[400px] h-[400px] bg-primary/10 bottom-[-100px] left-[-100px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group text-indigo-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg transition-transform group-hover:rotate-12">
            <GraduationCap size={28} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            CampusMate <span className="italic text-indigo-600">AI</span>
          </span>
        </Link>
        <h2 className="text-center text-3xl font-display font-extrabold text-slate-900">
          Create account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign In
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 shadow-2xl shadow-slate-200/50 border-white/50">
            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium animate-pulse">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="email-address">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="email-address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 sm:text-sm"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 sm:text-sm"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-slate-300 rounded-lg"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-slate-700">
                    I agree to the <a href="#" className="text-indigo-600">Terms</a> and <a href="#" className="text-indigo-600">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl group bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'Creating account...' : (
                  <>
                    Sign Up <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full h-12 rounded-xl gap-2 text-sm border-slate-200">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}