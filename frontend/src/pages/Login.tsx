import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui/Primitives';
import { API_BASE_URL } from '../api/config';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        navigate('/dashboard');
      } else {
        const errData = await response.json();
        setError(errData.detail || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address first to reset your password.");
      return;
    }
    setMessage(`Password reset link sent to ${email}`);
  };

  const handleOAuthLogin = (provider: string) => {
    setError("");
    setMessage(`Redirecting to ${provider} authentication...`);
    const endpoint = provider.toLowerCase();
    window.location.href = `${API_BASE_URL}/api/v1/auth/${endpoint}/login`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="glow w-[500px] h-[500px] bg-primary/10 top-[-100px] right-[-100px]" />
      <div className="glow w-[400px] h-[400px] bg-secondary/10 bottom-[-100px] left-[-100px]" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-8 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-transform group-hover:rotate-12">
            <GraduationCap size={28} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
            CampusMate <span className="text-primary italic">AI</span>
          </span>
        </Link>
        <h2 className="text-center text-3xl font-display font-extrabold text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 shadow-2xl shadow-slate-200/50 border-white/50 bg-white/80 backdrop-blur-xl">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium animate-pulse">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl font-medium">
                  {message}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 sm:text-sm"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded-lg cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button onClick={handleForgotPassword} type="button" className="font-medium text-primary hover:text-primary/80">
                    Forgot your password?
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl group"
              >
                {loading ? 'Signing in...' : (
                  <>
                    Sign In <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
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
                  <span className="px-2 bg-white/80 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={() => handleOAuthLogin('Google')} type="button" variant="outline" className="w-full h-12 rounded-xl gap-2 text-sm bg-white hover:bg-slate-50">
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