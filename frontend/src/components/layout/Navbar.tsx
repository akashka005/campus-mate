import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Primitives';
import { Sparkles, LayoutDashboard, BrainCircuit, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      <div className="flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-6 py-3 backdrop-blur-xl shadow-lg">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:rotate-12">
            <GraduationCap size={24} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            CampusMate <span className="text-primary italic">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/#features">Features</NavLink>
          {isLoggedIn && <NavLink to="/dashboard">Dashboard</NavLink>}
          <NavLink to="/chat">AI Tools</NavLink>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </Button>
              </Link>
              <Button onClick={handleSignOut} className="gap-2">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="gap-2">
                  Get Started <Sparkles size={16} />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}