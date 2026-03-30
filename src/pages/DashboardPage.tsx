import React from 'react';
import { Header } from '../components/layout/Header';
import { Users, Video, BrainCircuit, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export function DashboardPage() {
  const stats = [
    { label: 'Total Sessions', value: '124', icon: Video, color: 'text-primary-400', bg: 'bg-primary-900/20' },
    { label: 'Active Patients', value: '32', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
    { label: 'AI Insights Generated', value: '89', icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { label: 'Patient Progress', value: '+14%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-900/20' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Welcome back, Dr. Therapist" />
      <div className="flex-1 overflow-auto p-6 lg:p-8 bg-grid-pattern">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              variants={itemVariants}
              className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-sm hover:border-slate-700 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 shadow-sm p-12 text-center relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-medium text-slate-100 mb-3 font-serif">Ready for your next session?</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">Upload a new video or audio recording to get instant AI-powered clinical insights and transcriptions.</p>
            <Link to="/sessions" className="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-500 transition-colors shadow-[0_0_20px_rgba(208,150,59,0.3)] hover:shadow-[0_0_30px_rgba(208,150,59,0.5)] focus-ring">
              Go to Sessions
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
